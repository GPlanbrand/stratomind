/**
 * 语音驱动的简化表单系统 - 语音输入组件
 * 专为县域广告公司设计：大大按钮、大字体、接地气
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Volume2, Trash2, RefreshCw } from 'lucide-react'

// 语音识别状态
type RecognitionState = 'idle' | 'listening' | 'error'

// Props
interface VoiceInputProps {
  onTranscriptComplete?: (text: string) => void
  disabled?: boolean
  className?: string
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptComplete,
  disabled = false,
  className = ''
}) => {
  // 状态
  const [recognitionState, setRecognitionState] = useState<RecognitionState>('idle')
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pulseActive, setPulseActive] = useState(false)

  // Refs
  const recognitionRef = useRef<any>(null)
  const animationRef = useRef<any>(null)
  const pulseIntervalRef = useRef<any>(null)

  // 检查浏览器支持
  const isSpeechRecognitionSupported = useCallback(() => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
  }, [])

  // 初始化语音识别
  const initSpeechRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported()) {
      setError('浏览器不支持，请用Chrome试试')
      return null
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'zh-CN'

    recognition.onstart = () => {
      setRecognitionState('listening')
      setError(null)
      setPulseActive(true)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
      setInterimTranscript(interimText)
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        setError('请允许使用麦克风')
      } else if (event.error === 'no-speech') {
        setError('没听清，再说一遍')
      } else {
        setError('识别出错了')
      }
      setRecognitionState('error')
      setPulseActive(false)
    }

    recognition.onend = () => {
      if (recognitionState === 'listening') {
        setRecognitionState('idle')
      }
      setPulseActive(false)
    }

    return recognition
  }, [isSpeechRecognitionSupported, recognitionState])

  // 开始录音
  const startListening = useCallback(() => {
    if (disabled || recognitionState === 'listening') return

    setError(null)
    
    if (!recognitionRef.current) {
      recognitionRef.current = initSpeechRecognition()
    }

    if (!recognitionRef.current) return

    try {
      recognitionRef.current.start()
      setRecognitionState('listening')
    } catch (err) {
      setError('启动失败，重试一下')
    }
  }, [disabled, recognitionState, initSpeechRecognition])

  // 停止录音
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (err) {}
    }
    
    setRecognitionState('idle')
    setPulseActive(false)
    
    // 触发完成
    if (transcript.trim()) {
      onTranscriptComplete?.(transcript.trim())
    }
  }, [transcript, onTranscriptComplete])

  // 清除
  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  // 重新识别
  const restartListening = useCallback(() => {
    clearTranscript()
    stopListening()
    setTimeout(startListening, 100)
  }, [clearTranscript, stopListening, startListening])

  // 清理
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
    }
  }, [])

  return (
    <div className={`voice-input-container ${className}`}>
      {/* 识别文字显示 */}
      <div className="w-full min-h-24 p-4 bg-white rounded-2xl border-2 border-purple-200 shadow-sm mb-4">
        {interimTranscript ? (
          <p className="text-purple-400 text-lg leading-relaxed">
            {transcript}<span className="animate-pulse">{interimTranscript}</span>
          </p>
        ) : transcript ? (
          <p className="text-gray-800 text-lg leading-relaxed">{transcript}</p>
        ) : (
          <p className="text-gray-400 text-lg">
            🎤 正在听您说...
          </p>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="w-full p-3 bg-red-50 rounded-xl border border-red-200 mb-4">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* 脉冲动画圆圈 */}
      {recognitionState === 'listening' && (
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="absolute inset-0 rounded-full bg-purple-200 animate-ping opacity-75" />
          <div className="absolute inset-2 rounded-full bg-purple-300 opacity-50 animate-pulse" />
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-4">
        {/* 清除按钮 */}
        {transcript && (
          <button
            onClick={clearTranscript}
            className="p-4 rounded-full bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <Trash2 className="w-6 h-6 text-gray-500" />
          </button>
        )}

        {/* 主麦克风按钮 - 超级大 */}
        <button
          onClick={recognitionState === 'listening' ? stopListening : startListening}
          disabled={disabled || !isSpeechRecognitionSupported()}
          className={`
            relative w-28 h-28 rounded-full flex items-center justify-center
            transition-all duration-300 shadow-xl
            ${recognitionState === 'listening' 
              ? 'bg-gradient-to-br from-red-500 to-rose-600 scale-110' 
              : 'bg-gradient-to-br from-purple-600 to-violet-600 hover:scale-105 active:scale-95'
            }
            ${disabled || !isSpeechRecognitionSupported() ? 'opacity-40' : ''}
          `}
        >
          {recognitionState === 'listening' ? (
            <MicOff className="w-12 h-12 text-white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>

        {/* 重试按钮 */}
        {transcript && recognitionState !== 'listening' && (
          <button
            onClick={restartListening}
            className="p-4 rounded-full bg-purple-100 hover:bg-purple-200 transition-all"
          >
            <RefreshCw className="w-6 h-6 text-purple-600" />
          </button>
        )}
      </div>

      {/* 提示文字 */}
      <p className="text-center mt-4 text-gray-500 text-lg">
        {recognitionState === 'listening' 
          ? '🔴 录音中...说完点击停止' 
          : '点击麦克风，说说您的需求'
        }
      </p>

      {/* 浏览器不支持 */}
      {!isSpeechRecognitionSupported() && (
        <p className="text-center mt-4 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
          💡 建议用Chrome浏览器，语音识别更准
        </p>
      )}
    </div>
  )
}

export default VoiceInput
