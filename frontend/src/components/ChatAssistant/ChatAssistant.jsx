import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Sparkles, Loader2, UserCircle } from 'lucide-react'
import { aiAPI } from '../../services/api'
import './ChatAssistant.css'

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `Hello! 👋 I'm **HealthAI**, your personal health assistant powered by Gemini 2.0 Flash and RAG.

I can help you securely analyze your encrypted medical records, imaging results, and health risks. 

You can ask me things like:
• "What do my latest blood test results mean?"
• "Explain my cardiovascular risk score"
• "Are there any abnormalities in my recent MRI?"`
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const formatText = (text) => {
    // Simple bold/italic/list formatting for Gemini output
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />')
    
    // Replace bullet points with styled items
    html = html.replace(/(?:<br \/>|^)• (.*?)(?=<br \/>|$)/g, '<div class="list-item"><span>•</span> $1</div>')
    return html
  }

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages
        .filter((_, i) => i > 0)
        .map(m => ({ role: m.role, content: m.content }))

      const { data } = await aiAPI.chat(userMessage.content, history)
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.data.message
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        isError: true,
        content: `⚠️ I encountered an error: ${err.response?.data?.error || 'Please try again later.'}`
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat-interface animate-fade-in">
      <div className="chat-header glass-card">
        <div className="chat-header-left">
          <div className="chat-logo-icon">
            <Sparkles size={20} />
          </div>
          <div className="chat-titles">
            <h2>HealthAI</h2>
            <p>Encrypted • Gemini 2.0 Flash</p>
          </div>
        </div>
        <div className="status-indicator">
          <span className="dot online"></span>
          <span>Secure Session</span>
        </div>
      </div>

      <div className="chat-scroll-area">
        <div className="chat-messages-container">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-row ${msg.role} ${msg.isError ? 'error' : ''} animate-slide-up`}>
              {msg.role === 'assistant' && (
                <div className="chat-avatar assistant">
                  <Bot size={18} />
                </div>
              )}
              
              <div className="chat-bubble">
                <div 
                  className="chat-content-html" 
                  dangerouslySetInnerHTML={{ __html: formatText(msg.content) }} 
                />
              </div>

              {msg.role === 'user' && (
                <div className="chat-avatar user">
                  <UserCircle size={18} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="chat-row assistant">
              <div className="chat-avatar assistant">
                <Bot size={18} />
              </div>
              <div className="chat-bubble typing">
                <Loader2 size={16} className="spin-icon text-muted" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="scroll-anchor" />
        </div>
      </div>

      <div className="chat-input-wrapper">
        <form className="chat-input-form glass-card" onSubmit={sendMessage}>
          <textarea
            className="chat-textarea"
            placeholder="Ask about your medical history..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
          />
          <button
            type="submit"
            className="chat-submit-btn"
            disabled={!input.trim() || loading}
          >
            <Send size={18} />
          </button>
        </form>
        <p className="chat-disclaimer">
          HealthAI can make mistakes. Always verify clinical information with a doctor.
        </p>
      </div>
    </div>
  )
}
