/**
 * AI 服务统一导出
 * 
 * 文案生成 → 豆包/通义千问
 * 策略分析 → DeepSeek
 * 竞品分析 → DeepSeek（支持联网搜索）
 */

export { generateBrief, generateText as generateCopywriting } from './doubao'
export { generateStrategy, analyzeCompetitor, generateText as generateWithDeepSeek } from './deepseek'
