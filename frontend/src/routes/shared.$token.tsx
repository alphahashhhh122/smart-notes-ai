import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/shared/$token")({
  component: SharedNotePage,
})

const BACKEND = import.meta.env.VITE_API_URL || ""

interface SharedNote {
  title: string
  content: string
  tags: string | null
  summary: string | null
}

function SharedNotePage() {
  const { token } = Route.useParams()
  const [note, setNote] = useState<SharedNote | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND}/api/v1/sharing/view/${token}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setNote)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [token])

  const tags = note?.tags
    ? note.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0B0F",
        fontFamily: "'DM Sans', sans-serif",
        color: "#E8E8F0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 16px",
      }}
    >
      {/* Brand header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            background: "rgba(124,106,247,0.15)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(124,106,247,0.25)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7C6AF7"
            strokeWidth="2.5"
          >
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "14px",
            color: "#E8E8F0",
          }}
        >
          Smart Notes AI
        </span>
      </div>

      {loading ? (
        <div style={{ color: "#7878A0", fontSize: "14px" }}>
          Loading note...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 700,
              fontSize: "20px",
              color: "#E8E8F0",
              margin: "0 0 8px",
            }}
          >
            Note not found
          </p>
          <p style={{ color: "#7878A0", fontSize: "14px" }}>
            This link may have expired or been removed.
          </p>
        </div>
      ) : note ? (
        <div style={{ width: "100%", maxWidth: "680px" }}>
          {/* Note card */}
          <div
            style={{
              background: "#111218",
              border: "1px solid #1A1B26",
              borderRadius: "18px",
              padding: "32px",
            }}
          >
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "24px",
                color: "#E8E8F0",
                margin: "0 0 16px",
                letterSpacing: "-0.5px",
              }}
            >
              {note.title}
            </h1>

            {note.summary && (
              <div
                style={{
                  background: "#0D0E14",
                  border: "1px solid rgba(52,211,153,0.15)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="2"
                  >
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
                  </svg>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#34D399",
                      fontWeight: 600,
                    }}
                  >
                    AI Summary
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#B0B0C0",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {note.summary}
                </p>
              </div>
            )}

            <p
              style={{
                fontSize: "14px",
                color: "#C0C0D0",
                lineHeight: 1.8,
                margin: "0 0 20px",
                whiteSpace: "pre-wrap",
              }}
            >
              {note.content}
            </p>

            {tags.length > 0 && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "3px 10px",
                      background: "rgba(124,106,247,0.12)",
                      border: "1px solid rgba(124,106,247,0.2)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#9B8CF9",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <p
            style={{
              textAlign: "center",
              marginTop: "24px",
              fontSize: "12px",
              color: "#4A4A6A",
            }}
          >
            Shared via Smart Notes AI —{" "}
            <a href="/" style={{ color: "#7C6AF7", textDecoration: "none" }}>
              Create your own notes
            </a>
          </p>
        </div>
      ) : null}
    </div>
  )
}
