import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { AiService } from "../../client"

export const Route = createFileRoute("/_layout/ai")({
  component: AiChatPage,
})

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: Array<{ id: string; title: string; snippet: string }>
}

const SUGGESTIONS = [
  "Summarize all my notes",
  "What topics have I written about?",
  "Find my notes about work",
  "What ideas do I have?",
]

function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const send = async (question: string) => {
    if (!question.trim() || isLoading) return
    setMessages((p) => [...p, { role: "user", content: question }])
    setInput("")
    setIsLoading(true)
    try {
      const res = await AiService.askNotes({ requestBody: { question } })
      setMessages((p) => [
        ...p,
        { role: "assistant", content: res.answer, sources: res.sources as any },
      ])
    } catch {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: "Sorry, I couldn't process your question. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const s: Record<string, React.CSSProperties> = {
    page: {
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      padding: "32px 32px 16px",
      fontFamily: "'DM Sans', sans-serif",
      color: "#E8E8F0",
    },
    header: { marginBottom: "24px" },
    headerRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      marginBottom: "6px",
    },
    iconBox: {
      width: "34px",
      height: "34px",
      background: "rgba(52,211,153,0.12)",
      borderRadius: "9px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid rgba(52,211,153,0.2)",
    },
    h1: {
      fontFamily: "'Syne', sans-serif",
      fontWeight: 800,
      fontSize: "22px",
      color: "#E8E8F0",
      margin: 0,
      letterSpacing: "-0.5px",
    },
    sub: { fontSize: "13px", color: "#7878A0", margin: 0 },
    chatArea: {
      flex: 1,
      overflowY: "auto" as const,
      marginBottom: "16px",
      paddingRight: "8px",
    },
    emptyWrap: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: "40px",
    },
    emptyIcon: {
      width: "60px",
      height: "60px",
      background: "rgba(52,211,153,0.08)",
      borderRadius: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid rgba(52,211,153,0.12)",
      marginBottom: "16px",
    },
    emptyTitle: {
      fontFamily: "'Syne', sans-serif",
      fontWeight: 700,
      fontSize: "16px",
      color: "#E8E8F0",
      margin: "0 0 6px",
    },
    emptySub: { fontSize: "12px", color: "#7878A0", margin: "0 0 24px" },
    sugLabel: {
      fontSize: "10px",
      fontWeight: 600,
      color: "#4A4A6A",
      letterSpacing: "1.5px",
      textTransform: "uppercase" as const,
      marginBottom: "10px",
    },
    sugWrap: {
      display: "flex",
      flexWrap: "wrap" as const,
      gap: "8px",
      justifyContent: "center",
    },
    sugBtn: {
      padding: "7px 14px",
      background: "#111218",
      border: "1px solid #1A1B26",
      borderRadius: "20px",
      fontSize: "12px",
      color: "#9878A0",
      cursor: "pointer",
    },
    msgList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "700px",
    },
    msgRow: (role: string) => ({
      display: "flex",
      gap: "10px",
      alignItems: "flex-start",
      flexDirection: (role === "user" ? "row-reverse" : "row") as const,
    }),
    avatar: (role: string) => ({
      width: "28px",
      height: "28px",
      borderRadius: "7px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      background:
        role === "user" ? "rgba(124,106,247,0.15)" : "rgba(52,211,153,0.12)",
      border:
        role === "user"
          ? "1px solid rgba(124,106,247,0.25)"
          : "1px solid rgba(52,211,153,0.2)",
      marginTop: "2px",
    }),
    bubble: (role: string) => ({
      maxWidth: "85%",
      padding: "10px 14px",
      borderRadius:
        role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
      background: role === "user" ? "rgba(124,106,247,0.1)" : "#111218",
      border:
        role === "user"
          ? "1px solid rgba(124,106,247,0.2)"
          : "1px solid #1A1B26",
    }),
    bubbleText: {
      fontSize: "13px",
      color: "#E8E8F0",
      lineHeight: 1.7,
      whiteSpace: "pre-wrap" as const,
      margin: 0,
    },
    sourcesLabel: {
      fontSize: "10px",
      color: "#4A4A6A",
      fontWeight: 600,
      letterSpacing: "1px",
      textTransform: "uppercase" as const,
      marginBottom: "6px",
      marginTop: "8px",
    },
    sourceChip: {
      display: "inline-block",
      padding: "4px 10px",
      background: "#0D0E14",
      border: "1px solid #1A1B26",
      borderRadius: "7px",
      fontSize: "11px",
      color: "#9B8CF9",
      marginRight: "6px",
    },
    dotsWrap: { display: "flex", gap: "4px", alignItems: "center" },
    dot: (i: number) => ({
      width: "6px",
      height: "6px",
      background: "#34D399",
      borderRadius: "50%",
      animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
    }),
    inputWrap: {
      maxWidth: "700px",
      display: "flex",
      gap: "8px",
      background: "#111218",
      border: "1px solid #22232E",
      borderRadius: "12px",
      padding: "8px",
    },
    inputEl: {
      flex: 1,
      background: "transparent",
      border: "none",
      color: "#E8E8F0",
      fontSize: "13px",
      outline: "none",
    },
    sendBtn: {
      width: "34px",
      height: "34px",
      background: "#34D399",
      border: "none",
      borderRadius: "9px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    hint: {
      fontSize: "10px",
      color: "#4A4A6A",
      textAlign: "center" as const,
      marginTop: "6px",
    },
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.headerRow}>
          <div style={s.iconBox}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34D399"
              strokeWidth="2"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
            </svg>
          </div>
          <h1 style={s.h1}>Ask AI</h1>
        </div>
        <p style={s.sub}>
          Ask anything about your notes using natural language
        </p>
      </div>

      <div style={s.chatArea}>
        {messages.length === 0 ? (
          <div style={s.emptyWrap}>
            <div style={s.emptyIcon}>
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#34D399"
                strokeWidth="1.5"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
              </svg>
            </div>
            <h2 style={s.emptyTitle}>What would you like to know?</h2>
            <p style={s.emptySub}>
              I can answer questions based on your notes, find connections, and
              summarize information.
            </p>
            <p style={s.sugLabel}>Try asking</p>
            <div style={s.sugWrap}>
              {SUGGESTIONS.map((s2) => (
                <button key={s2} style={s.sugBtn} onClick={() => send(s2)}>
                  {s2}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={s.msgList}>
            {messages.map((msg, i) => (
              <div key={i} style={s.msgRow(msg.role)}>
                <div style={s.avatar(msg.role)}>
                  {msg.role === "user" ? (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7C6AF7"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  ) : (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2"
                    >
                      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
                      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
                    </svg>
                  )}
                </div>
                <div>
                  <div style={s.bubble(msg.role)}>
                    <p style={s.bubbleText}>
                      {msg.content.replace(/\*\*(.*?)\*\*/g, "$1")}
                    </p>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div>
                      <p style={s.sourcesLabel}>Sources</p>
                      {msg.sources.map((src) => (
                        <span key={src.id} style={s.sourceChip}>
                          {src.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={s.msgRow("assistant")}>
                <div style={s.avatar("assistant")}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="2"
                  >
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
                  </svg>
                </div>
                <div style={s.bubble("assistant")}>
                  <div style={s.dotsWrap}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={s.dot(i)} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div style={{ maxWidth: "700px" }}>
        <div style={s.inputWrap}>
          <input
            style={s.inputEl}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send(input)
              }
            }}
            placeholder="Ask a question about your notes..."
            disabled={isLoading}
          />
          <button
            style={{
              ...s.sendBtn,
              opacity: !input.trim() || isLoading ? 0.4 : 1,
            }}
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={s.hint}>Answers are based on your notes only</p>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
    </div>
  )
}
