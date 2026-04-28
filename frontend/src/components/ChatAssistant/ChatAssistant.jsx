import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, User, Bot, Shield, Copy, Check } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Badge } from '../../components/ui/badge'
import { API_BASE_URL } from '../../services/api'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `Hello! I am **HealthAI**, your personal health assistant powered by Gemini 3 Flash Preview and RAG.

I can help you securely analyze your encrypted medical records, imaging results, and health risks.

You can ask me things like:
- "What do my latest blood test results mean?"
- "Explain my cardiovascular risk score"
- "Are there any abnormalities in my recent MRI?"`,
}

const SUGGESTIONS = [
  "What do my latest blood test results mean?",
  "Explain my cardiovascular risk score",
  "Are there any abnormalities in my recent MRI?",
  "What lifestyle changes should I make?",
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}

function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`flex gap-4 max-w-3xl mx-auto animate-message-pop ${
        isUser ? 'flex-row-reverse' : 'flex-row'
      }`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Avatar */}
      <div
        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
          isUser
            ? 'bg-zinc-800 text-zinc-400'
            : 'bg-white text-black'
        }`}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`relative group inline-block max-w-full ${
            isUser
              ? 'bg-white text-black rounded-2xl rounded-tr-sm'
              : 'text-zinc-100'
          }`}
        >
          <div className={`${isUser ? 'px-5 py-3' : 'px-1 py-1'}`}>
            {isUser ? (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            ) : (
              <div className="max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => (
                      <p className="text-[15px] leading-7 text-zinc-300 mb-4 last:mb-0">{children}</p>
                    ),
                    strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                    em: ({ children }) => <em className="text-zinc-400 not-italic">{children}</em>,
                    ul: ({ children, ordered, ...props }) => (
                      <ul className="space-y-2 mb-4 last:mb-0 list-none pl-0" {...props}>
                        {children}
                      </ul>
                    ),
                    ol: ({ children, ...props }) => (
                      <ol className="space-y-2 mb-4 last:mb-0 list-decimal pl-5" {...props}>
                        {children}
                      </ol>
                    ),
                    li: ({ children, ordered }) => (
                      <li className="flex items-start gap-3 text-[15px] text-zinc-300 leading-7">
                        {!ordered && <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2.5 shrink-0" />}
                        <span className="flex-1">{children}</span>
                      </li>
                    ),
                    code: ({ inline, children }) =>
                      inline ? (
                        <code className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 text-[13px] font-mono border border-white/[0.06]">
                          {children}
                        </code>
                      ) : (
                        <code className="block p-4 rounded-xl bg-zinc-900/80 border border-white/[0.06] overflow-x-auto text-[13px] font-mono text-zinc-300">
                          {children}
                        </code>
                      ),
                    pre: ({ children }) => (
                      <pre className="mb-4 last:mb-0">{children}</pre>
                    ),
                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-6 first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-semibold text-white mb-3 mt-5 first:mt-0">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-4 first:mt-0">{children}</h3>,
                    hr: () => <hr className="border-white/[0.06] my-6" />,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-emerald-500/30 pl-4 text-zinc-400 mb-4 last:mb-0">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <table className="w-full text-sm text-zinc-300 mb-4 border border-white/[0.06] rounded-xl overflow-hidden">
                        {children}
                      </table>
                    ),
                    thead: ({ children }) => <thead className="bg-white/[0.03]">{children}</thead>,
                    th: ({ children }) => <th className="px-4 py-2 text-left text-white font-medium border-b border-white/[0.06]">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-2 border-b border-white/[0.04]">{children}</td>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Copy button for assistant messages */}
          {!isUser && !msg.isError && !msg.streaming && (
            <button
              onClick={handleCopy}
              className="absolute -right-10 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300"
              title="Copy message"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          )}
        </div>

        {msg.isError && (
          <div className="mt-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm inline-flex items-center gap-2">
            <Shield size={14} />
            {msg.content}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streaming])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const sendMessage = async (text) => {
    const messageText = text || input.trim()
    if (!messageText || streaming) return

    const userMessage = { role: 'user', content: messageText }
    const history = messages
      .filter((_, i) => i > 0)
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setStreaming(true)

    // Add placeholder assistant message
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', streaming: true },
    ])

    try {
      const token = localStorage.getItem('medchain_token')
      const response = await fetch(`${API_BASE_URL}/ai/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: history,
        }),
      })

      if (!response.ok) {
        // Non-streaming error response
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let streamedText = ''

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          streamedText += decoder.decode(value, { stream: true })
          setMessages((prev) => {
            const newMessages = [...prev]
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: streamedText,
              streaming: true,
            }
            return newMessages
          })
        }
      }

      // Flush any remaining bytes
      streamedText += decoder.decode()

      // Finalize message
      setMessages((prev) => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: streamedText,
          streaming: false,
        }
        return newMessages
      })
    } catch (err) {
      setMessages((prev) => {
        const newMessages = [...prev]
        // Replace the streaming placeholder with an error
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          isError: true,
          content: err.message || 'Please try again later.',
        }
        return newMessages
      })
    } finally {
      setStreaming(false)
    }
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    sendMessage()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col relative animate-fade-in">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-white/[0.01] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="shrink-0 px-6 py-4 border-b border-white/[0.04]">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-lg shadow-white/5">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">HealthAI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-zinc-500">Secure Session · Gemini 3 Flash Preview</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-[10px]">
              <Shield size={10} className="mr-1" />
              Encrypted
            </Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} index={i} />
          ))}

          {streaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex gap-4 max-w-3xl mx-auto">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-white text-black flex items-center justify-center">
                <Bot size={15} />
              </div>
              <div className="flex-1">
                <div className="px-1 py-1">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="shrink-0 px-6 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          {/* Suggestion Chips - only show when no user messages */}
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
              {SUGGESTIONS.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="px-4 py-2 rounded-full text-xs text-zinc-400 bg-zinc-900/50 border border-white/[0.06] hover:border-white/[0.12] hover:text-zinc-200 transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <div className="glass-strong rounded-2xl flex items-end gap-2 p-2 focus-within:border-white/[0.15] transition-colors duration-200">
              <textarea
                ref={textareaRef}
                rows={1}
                className="flex-1 bg-transparent text-[15px] text-white placeholder:text-zinc-600 resize-none outline-none px-3 py-2.5 max-h-[200px] scrollbar-thin"
                placeholder="Ask about your medical history..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={streaming}
              />
              <button
                type="submit"
                disabled={!input.trim() || streaming}
                className="shrink-0 w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {streaming ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-[11px] text-zinc-600 mt-3">
            HealthAI can make mistakes. Always verify clinical information with a doctor.
          </p>
        </div>
      </div>
    </div>
  )
}
