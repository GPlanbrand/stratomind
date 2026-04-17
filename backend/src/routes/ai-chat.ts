import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// 所有路由都需要登录
router.use(authMiddleware);

// AI对话配置
const AI_CONFIG = {
  deepseek: {
    apiUrl: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    key: process.env.DEEPSEEK_API_KEY || '',
  },
  doubao: {
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    model: 'doubao-pro-32k',
    key: process.env.DOUBAO_API_KEY || '',
  },
};

// 获取可用的AI提供商
function getAvailableAI() {
  if (AI_CONFIG.deepseek.key) return 'deepseek';
  if (AI_CONFIG.doubao.key) return 'doubao';
  return null;
}

// AI聊天接口 - 支持流式响应
export const chat = async (req: AuthRequest, res: Response) => {
  try {
    const { message, images, projectId, projectName, history } = req.body;

    if (!message && (!images || images.length === 0)) {
      return res.status(400).json({ success: false, error: '消息内容不能为空' });
    }

    const aiProvider = getAvailableAI();
    if (!aiProvider) {
      return res.status(500).json({ 
        success: false, 
        error: '未配置AI服务，请联系管理员配置 DEEPSEEK_API_KEY 或 DOUBAO_API_KEY'
      });
    }

    const config = AI_CONFIG[aiProvider as keyof typeof AI_CONFIG];

    // 构建消息历史
    const messages = [
      {
        role: 'system',
        content: `你是灵思AI助手，一个专业的品牌策划和创意生成助手。
你有以下能力：
1. 品牌策略分析 - 帮助用户制定品牌定位、竞争策略
2. 创意简报生成 - 根据需求生成专业的创意简报
3. 竞品分析 - 分析竞争对手的市场表现和策略
4. 文案创作 - 生成各类营销文案和创意内容
5. 建议优化 - 对现有方案提出改进建议

请用专业、精准的语言回答用户问题。如果涉及具体项目，可以询问更多细节以提供更精准的建议。`
      }
    ];

    // 添加历史对话
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((h: { role: string; content: string }) => {
        messages.push({
          role: h.role as 'user' | 'assistant',
          content: h.content
        });
      });
    }

    // 添加当前消息
    let userContent = message || '';
    if (images && images.length > 0) {
      userContent += '\n\n[用户上传了图片]';
    }

    messages.push({
      role: 'user',
      content: userContent
    });

    // 构建API请求
    const requestBody: Record<string, any> = {
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    };

    // 如果需要流式响应
    if (req.headers.accept === 'text/event-stream') {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.key}`,
          },
          body: JSON.stringify({ ...requestBody, stream: true }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          res.write(`data: ${JSON.stringify({ error: `API请求失败: ${response.status}` })}\n\n`);
          res.end();
          return;
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          res.write(`data: ${JSON.stringify({ error: '无法读取响应流' })}\n\n`);
          res.end();
          return;
        }

        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                res.write(`data: ${JSON.stringify({ done: true, content: fullContent })}\n\n`);
              } else {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullContent += content;
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }
        }

        res.write(`data: ${JSON.stringify({ done: true, content: fullContent })}\n\n`);
        res.end();
      } catch (error: any) {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message || '流式响应出错' })}\n\n`);
        res.end();
      }
      return;
    }

    // 非流式响应
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.key}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        success: false, 
        error: `AI服务请求失败: ${response.status} - ${errorText}` 
      });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    res.json({
      success: true,
      data: {
        response: content,
        provider: aiProvider,
      }
    });

  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ success: false, error: error.message || 'AI服务出错' });
  }
};

// 绑定路由
router.post('/chat', authMiddleware, chat);

export default router;
