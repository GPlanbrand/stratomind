import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileImage, 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';

// 话术风格类型
type TalkStyle = 'professional' | 'casual';

// 话术包装结果
interface TalkResult {
  professional: string;
  casual: string;
}

const TalkWrapper: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [results, setResults] = useState<TalkResult | null>(null);
  const [copiedStyle, setCopiedStyle] = useState<'professional' | 'casual' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // 拖放上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setImageName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // 生成话术
  const handleGenerate = async () => {
    if (!image) return;
    
    setIsGenerating(true);
    
    // 模拟AI生成过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 根据描述和图片生成专业/通俗两版话术
    const professionalTalk = description
      ? `本设计采用专业视觉语言，通过精心规划的布局结构突出核心信息。色彩搭配遵循品牌规范，视觉层次分明，重点突出。在构图方面，运用了经典的视觉引导原则，确保信息传递高效准确。整体风格简洁大气，符合目标受众的审美偏好。`
      : `本设计采用居中式构图，视觉焦点集中在核心信息区域。运用渐变色彩增强视觉层次，图标与文字协调配合，传达清晰。整体风格现代简约，适配多种展示场景。`;

    const casualTalk = description
      ? `老板您看这个！最大的卖点我用最大字号突出显示了，颜色也是挑的特别醒目那种，保证一眼就能看到。旁边配的小图标帮助说明，一看就懂。整体排版很清爽，不会显得乱。`
      : `这个设计我把最想让别人看的东西放中间了，字体够大，颜色够显眼，保证一眼就注意到。整体看起来很干净，不花哨，适合各种场合用。`;

    setResults({
      professional: professionalTalk,
      casual: casualTalk
    });
    
    setIsGenerating(false);
  };

  // 复制话术
  const handleCopy = async (style: 'professional' | 'casual') => {
    if (!results) return;
    
    const text = style === 'professional' ? results.professional : results.casual;
    await navigator.clipboard.writeText(text);
    setCopiedStyle(style);
    setTimeout(() => setCopiedStyle(null), 2000);
  };

  // 重新生成
  const handleRegenerate = () => {
    setResults(null);
    handleGenerate();
  };

  // 清空
  const handleClear = () => {
    setImage(null);
    setImageName('');
    setDescription('');
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">话术包装器</h1>
              <p className="text-gray-500 text-sm">上传设计稿，一键生成专业风/通俗风解释文案</p>
            </div>
          </div>
        </div>

        {/* 上传区域 */}
        {!image ? (
          <div
            className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center hover:border-purple-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/jpeg,image/png"
              className="hidden"
            />
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              上传设计稿
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              支持 JPG、PNG 格式，点击或拖拽上传
            </p>
            <p className="text-xs text-gray-400">
              建议上传完整的设计稿，以获得更准确的解读
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 图片预览 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <img
                    src={image}
                    alt="设计稿预览"
                    className="w-48 h-48 object-cover rounded-xl shadow-md"
                  />
                  <button
                    onClick={handleClear}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{imageName}</h3>
                  <p className="text-sm text-gray-500 mb-4">设计稿已上传</p>
                  
                  {/* 补充描述（可选） */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      补充描述（可选）
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="例如：这是618活动的主视觉，突出优惠力度..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-purple-400 resize-none"
                      rows={3}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      提供更多信息可以获得更贴合的话术
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 生成按钮 */}
            {!results && (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在生成话术...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    生成专业/通俗两版话术
                  </>
                )}
              </button>
            )}

            {/* 话术结果 */}
            {results && (
              <div className="space-y-4">
                {/* 专业风 */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileImage className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">专业风</h3>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleRegenerate}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="重新生成"
                      >
                        <RefreshCw className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleCopy('professional')}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                          copiedStyle === 'professional'
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                      >
                        {copiedStyle === 'professional' ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span className="text-sm">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="text-sm">复制</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {results.professional}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    💡 适用于向领导汇报、客户提案等正式场合
                  </p>
                </div>

                {/* 通俗风 */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-orange-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">通俗风</h3>
                    </div>
                    <button
                      onClick={() => handleCopy('casual')}
                      className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                        copiedStyle === 'casual'
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      {copiedStyle === 'casual' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="text-sm">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">复制</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {results.casual}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 mt-3">
                    💡 适用于团队内部沟通、向非专业人士解释
                  </p>
                </div>

                {/* 重新上传 */}
                <button
                  onClick={handleClear}
                  className="w-full py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  上传新图片
                </button>
              </div>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
          <h4 className="font-semibold text-gray-900 mb-3">使用说明</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">1.</span>
              <span>上传您的设计稿（JPG或PNG格式）</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">2.</span>
              <span>可选：补充描述设计要点，如卖点、风格等</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">3.</span>
              <span>点击生成，获得专业风和通俗风两版解释话术</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">4.</span>
              <span>一键复制到剪贴板，直接使用</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TalkWrapper;
