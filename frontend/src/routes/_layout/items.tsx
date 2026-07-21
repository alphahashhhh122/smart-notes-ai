import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { AiService, NotesService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/items")({
  component: NotesPage,
})

const BACKEND = import.meta.env.VITE_API_URL || ""

interface Note {
  id: string
  title: string
  content: string
  tags?: string | null
  summary?: string | null
}
interface Version {
  id: string
  note_id: string
  title: string
  content: string
  tags: string | null
  created_at: string
}

const s: Record<string, React.CSSProperties> = {
  page: {
    padding: "32px",
    fontFamily: "'DM Sans', sans-serif",
    color: "#E8E8F0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "28px",
  },
  h1: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: "22px",
    color: "#E8E8F0",
    margin: "0 0 4px",
    letterSpacing: "-0.5px",
  },
  count: { fontSize: "12px", color: "#7878A0", margin: 0 },
  newBtn: {
    height: "38px",
    padding: "0 16px",
    background: "#7C6AF7",
    color: "white",
    border: "none",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  searchWrap: {
    position: "relative" as const,
    maxWidth: "360px",
    marginBottom: "28px",
  },
  searchIcon: {
    position: "absolute" as const,
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#4A4A6A",
    pointerEvents: "none" as const,
  },
  searchInput: {
    width: "100%",
    height: "38px",
    background: "#111218",
    border: "1px solid #1A1B26",
    borderRadius: "9px",
    color: "#E8E8F0",
    fontSize: "13px",
    paddingLeft: "32px",
    paddingRight: "12px",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  card: {
    background: "#111218",
    border: "1px solid #1A1B26",
    borderRadius: "14px",
    padding: "18px",
    position: "relative" as const,
  },
  cardTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "13px",
    color: "#E8E8F0",
    margin: "0 0 8px",
    paddingRight: "56px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },
  cardContent: {
    fontSize: "12px",
    color: "#7878A0",
    lineHeight: 1.6,
    margin: "0 0 14px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical" as const,
  },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    gap: "6px",
  },
  tagWrap: { display: "flex", gap: "4px", flexWrap: "wrap" as const },
  tag: {
    padding: "2px 8px",
    background: "rgba(124,106,247,0.12)",
    border: "1px solid rgba(124,106,247,0.2)",
    borderRadius: "5px",
    fontSize: "10px",
    color: "#9B8CF9",
    fontWeight: 500,
  },
  actions: {
    position: "absolute" as const,
    top: "12px",
    right: "12px",
    display: "flex",
    gap: "4px",
  },
  actionBtn: {
    width: "26px",
    height: "26px",
    background: "#1A1B26",
    border: "none",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#7878A0",
  },
  summaryBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "3px",
    padding: "2px 7px",
    background: "rgba(52,211,153,0.1)",
    border: "1px solid rgba(52,211,153,0.15)",
    borderRadius: "5px",
    fontSize: "10px",
    color: "#34D399",
    marginBottom: "6px",
  },
  summaryBox: {
    background: "#0D0E14",
    border: "1px solid #1A1B26",
    borderRadius: "8px",
    padding: "10px 12px",
    marginTop: "10px",
    fontSize: "12px",
    color: "#B0B0C0",
    lineHeight: 1.6,
  },
  empty: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 0",
    gap: "12px",
  },
  emptyIcon: {
    width: "56px",
    height: "56px",
    background: "rgba(124,106,247,0.08)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(124,106,247,0.12)",
  },
  emptyTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    color: "#E8E8F0",
    margin: 0,
  },
  emptySub: { fontSize: "12px", color: "#7878A0", margin: 0 },
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  },
  modal: {
    background: "#111218",
    border: "1px solid #22232E",
    borderRadius: "18px",
    padding: "24px",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "90vh",
    overflow: "auto" as const,
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  modalTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    color: "#E8E8F0",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#7878A0",
    cursor: "pointer",
    fontSize: "18px",
  },
  fieldLabel: {
    display: "block",
    fontSize: "11px",
    color: "#7878A0",
    fontWeight: 500,
    marginBottom: "6px",
  },
  fieldInput: {
    width: "100%",
    height: "40px",
    background: "#1A1B26",
    border: "1px solid #22232E",
    borderRadius: "8px",
    color: "#E8E8F0",
    fontSize: "13px",
    padding: "0 12px",
    outline: "none",
    boxSizing: "border-box" as const,
    marginBottom: "14px",
  },
  fieldTextarea: {
    width: "100%",
    minHeight: "120px",
    background: "#1A1B26",
    border: "1px solid #22232E",
    borderRadius: "8px",
    color: "#E8E8F0",
    fontSize: "13px",
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: "14px",
  },
  modalFooter: {
    display: "flex",
    gap: "10px",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },
  aiBtn: {
    height: "34px",
    padding: "0 14px",
    background: "rgba(52,211,153,0.1)",
    color: "#34D399",
    border: "1px solid rgba(52,211,153,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  shareBtn: {
    height: "34px",
    padding: "0 14px",
    background: "rgba(124,106,247,0.1)",
    color: "#9B8CF9",
    border: "1px solid rgba(124,106,247,0.2)",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  saveBtn: {
    height: "36px",
    padding: "0 18px",
    background: "#7C6AF7",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    height: "36px",
    padding: "0 16px",
    background: "transparent",
    border: "1px solid #22232E",
    borderRadius: "8px",
    color: "#7878A0",
    fontSize: "13px",
    cursor: "pointer",
  },
  aiHint: {
    fontSize: "11px",
    color: "#34D399",
    marginTop: "-10px",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  versionItem: {
    padding: "12px",
    background: "#0D0E14",
    borderRadius: "8px",
    marginBottom: "8px",
    border: "1px solid #1A1B26",
  },
  versionTitle: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#E8E8F0",
    margin: "0 0 4px",
  },
  versionMeta: { fontSize: "10px", color: "#4A4A6A", margin: "0 0 8px" },
  versionContent: {
    fontSize: "11px",
    color: "#7878A0",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
  },
  restoreBtn: {
    marginTop: "8px",
    height: "28px",
    padding: "0 12px",
    background: "rgba(124,106,247,0.1)",
    color: "#9B8CF9",
    border: "1px solid rgba(124,106,247,0.2)",
    borderRadius: "6px",
    fontSize: "11px",
    cursor: "pointer",
  },
}

// ── AI Summary ──────────────────────────────────────────────────────────────

function AISummaryBox({ note }: { note: Note }) {
  const [summary, setSummary] = useState<string | null>(note.summary || null)
  const [loading, setLoading] = useState(false)

  const fetchSummary = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    try {
      const res = await AiService.askNotes({
        requestBody: {
          question: `Summarize the note titled "${note.title}" in 2 sentences`,
        },
      })
      setSummary(res.answer)
    } catch {
      setSummary("Could not generate summary.")
    } finally {
      setLoading(false)
    }
  }

  if (summary && !loading) {
    return (
      <div style={s.summaryBox} onClick={(e) => e.stopPropagation()}>
        <div style={s.summaryBadge}>
          <svg
            width="9"
            height="9"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
          </svg>
          AI Summary
        </div>
        <p style={{ margin: 0, fontSize: "12px" }}>{summary}</p>
        <button
          style={{
            background: "none",
            border: "none",
            color: "#4A4A6A",
            fontSize: "10px",
            cursor: "pointer",
            marginTop: "6px",
            padding: 0,
          }}
          onClick={(e) => {
            e.stopPropagation()
            setSummary(null)
          }}
        >
          Dismiss
        </button>
      </div>
    )
  }

  return (
    <button
      style={{
        ...s.actionBtn,
        width: "auto",
        padding: "0 8px",
        fontSize: "10px",
        gap: "3px",
        display: "flex",
        alignItems: "center",
        color: loading ? "#34D399" : "#7878A0",
      }}
      onClick={fetchSummary}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
      </svg>
      {loading ? "..." : "AI"}
    </button>
  )
}

// ── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note,
  onEdit,
  onDelete,
  onShare,
  onHistory,
}: {
  note: Note
  onEdit: (n: Note) => void
  onDelete: (id: string) => void
  onShare: (n: Note) => void
  onHistory: (n: Note) => void
}) {
  const [hovered, setHovered] = useState(false)
  const tags = note.tags
    ? note.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  return (
    <div
      style={s.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          ...s.actions,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.15s",
        }}
      >
        <button
          style={s.actionBtn}
          onClick={(e) => {
            e.stopPropagation()
            onHistory(note)
          }}
          title="Version history"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
        <button
          style={s.actionBtn}
          onClick={(e) => {
            e.stopPropagation()
            onShare(note)
          }}
          title="Share"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
        <button
          style={s.actionBtn}
          onClick={(e) => {
            e.stopPropagation()
            onEdit(note)
          }}
          title="Edit"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          style={{ ...s.actionBtn, color: "#F87171" }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
          title="Delete"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </button>
      </div>

      <p style={s.cardTitle}>{note.title}</p>
      <p style={s.cardContent}>{note.summary || note.content}</p>

      <div style={s.cardFooter}>
        <div style={s.tagWrap}>
          {tags.slice(0, 3).map((t) => (
            <span key={t} style={s.tag}>
              {t}
            </span>
          ))}
        </div>
        <AISummaryBox note={note} />
      </div>
    </div>
  )
}

// ── Version History Modal ────────────────────────────────────────────────────

function VersionModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const qc = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const token = localStorage.getItem("access_token")

  const { data, isLoading } = useQuery({
    queryKey: ["versions", note.id],
    queryFn: async () => {
      const res = await fetch(`${BACKEND}/api/v1/notes/${note.id}/versions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return res.json()
    },
  })

  const restore = async (versionId: string) => {
    const res = await fetch(
      `${BACKEND}/api/v1/notes/${note.id}/restore/${versionId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      },
    )
    if (res.ok) {
      showSuccessToast("Version restored!")
      qc.invalidateQueries({ queryKey: ["notes"] })
      onClose()
    } else {
      showErrorToast("Failed to restore version")
    }
  }

  const versions: Version[] = data?.data || []

  return (
    <div style={s.overlay} onClick={onClose}>
      <div
        style={{ ...s.modal, maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Version History — {note.title}</h3>
          <button style={s.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>
        {isLoading ? (
          <p style={{ color: "#7878A0", fontSize: "13px" }}>
            Loading versions...
          </p>
        ) : versions.length === 0 ? (
          <p style={{ color: "#7878A0", fontSize: "13px" }}>
            No previous versions. Versions are saved when you edit a note.
          </p>
        ) : (
          versions.map((v) => (
            <div key={v.id} style={s.versionItem}>
              <p style={s.versionTitle}>{v.title}</p>
              <p style={s.versionMeta}>
                {new Date(v.created_at).toLocaleString()}
              </p>
              <p style={s.versionContent}>{v.content}</p>
              <button style={s.restoreBtn} onClick={() => restore(v.id)}>
                Restore this version
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const token = localStorage.getItem("access_token")

  const createLink = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${BACKEND}/api/v1/sharing/${note.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      const frontendUrl = window.location.origin
      setShareUrl(`${frontendUrl}/shared/${data.token}`)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const copy = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div
        style={{ ...s.modal, maxWidth: "420px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>Share Note</h3>
          <button style={s.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>
        <p style={{ fontSize: "13px", color: "#7878A0", marginBottom: "16px" }}>
          Create a public read-only link for "
          <strong style={{ color: "#E8E8F0" }}>{note.title}</strong>"
        </p>
        {!shareUrl ? (
          <button
            style={{ ...s.saveBtn, opacity: loading ? 0.6 : 1 }}
            onClick={createLink}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Share Link"}
          </button>
        ) : (
          <div>
            <div
              style={{
                background: "#0D0E14",
                border: "1px solid #1A1B26",
                borderRadius: "8px",
                padding: "10px 12px",
                fontSize: "12px",
                color: "#9B8CF9",
                wordBreak: "break-all" as const,
                marginBottom: "12px",
              }}
            >
              {shareUrl}
            </div>
            <button
              style={{
                ...s.saveBtn,
                background: copied ? "#34D399" : "#7C6AF7",
              }}
              onClick={copy}
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Note Modal (Create/Edit) ─────────────────────────────────────────────────

function NoteModal({
  note,
  onClose,
}: {
  note: Note | null
  onClose: () => void
}) {
  const qc = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const isEditing = !!note?.id
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [tags, setTags] = useState(note?.tags || "")
  const [suggestingTags, setSuggestingTags] = useState(false)
  const [tagSuggested, setTagSuggested] = useState(false)

  const suggestTags = async () => {
    if (!title && !content) return
    setSuggestingTags(true)
    try {
      const res = await AiService.askNotes({
        requestBody: {
          question: `Suggest exactly 3 short comma-separated tags for a note titled "${title}" with content: ${content.slice(0, 200)}. Reply with only the tags.`,
        },
      })
      setTags(res.answer.replace(/^tags?:/i, "").trim())
      setTagSuggested(true)
    } catch {
      showErrorToast("Could not suggest tags")
    } finally {
      setSuggestingTags(false)
    }
  }

  const create = useMutation({
    mutationFn: () =>
      NotesService.createNote({ requestBody: { title, content, tags } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] })
      qc.invalidateQueries({ queryKey: ["notes-count"] })
      showSuccessToast("Note created!")
      onClose()
    },
    onError: () => showErrorToast("Failed to create note"),
  })
  const update = useMutation({
    mutationFn: () =>
      NotesService.updateNote({
        id: note!.id,
        requestBody: { title, content, tags },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] })
      showSuccessToast("Note updated!")
      onClose()
    },
    onError: () => showErrorToast("Failed to update note"),
  })

  const saving = create.isPending || update.isPending
  const save = () => {
    if (!title.trim()) return
    isEditing ? update.mutate() : create.mutate()
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>{isEditing ? "Edit Note" : "New Note"}</h3>
          <button style={s.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>
        <label style={s.fieldLabel}>Title *</label>
        <input
          style={s.fieldInput}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
        />
        <label style={s.fieldLabel}>Content</label>
        <textarea
          style={s.fieldTextarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your note here..."
        />
        <label style={s.fieldLabel}>Tags (comma separated)</label>
        <input
          style={s.fieldInput}
          value={tags}
          onChange={(e) => {
            setTags(e.target.value)
            setTagSuggested(false)
          }}
          placeholder="work, ideas, research..."
        />
        {tagSuggested && (
          <p style={s.aiHint}>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
            </svg>
            Tags suggested by AI
          </p>
        )}
        <div style={s.modalFooter}>
          <button
            style={{ ...s.aiBtn, opacity: suggestingTags ? 0.6 : 1 }}
            onClick={suggestTags}
            disabled={suggestingTags || (!title && !content)}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-1.66-9.93A2.5 2.5 0 0 1 7.5 6.5h.5" />
              <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l1.66-9.93A2.5 2.5 0 0 0 16.5 6.5H16" />
            </svg>
            {suggestingTags ? "Suggesting..." : "AI Suggest Tags"}
          </button>
          <div style={{ display: "flex", gap: "10px" }}>
            <button style={s.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              style={{
                ...s.saveBtn,
                opacity: !title.trim() || saving ? 0.6 : 1,
              }}
              onClick={save}
              disabled={!title.trim() || saving}
            >
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

function NotesPage() {
  const qc = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<Note | null | undefined>(undefined)
  const [shareNote, setShareNote] = useState<Note | null>(null)
  const [historyNote, setHistoryNote] = useState<Note | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["notes", search],
    queryFn: () =>
      NotesService.readNotes({ limit: 100, search: search || undefined }),
  })

  const del = useMutation({
    mutationFn: (id: string) => NotesService.deleteNote({ id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes"] })
      qc.invalidateQueries({ queryKey: ["notes-count"] })
      showSuccessToast("Note deleted")
    },
    onError: () => showErrorToast("Failed to delete note"),
  })

  const notes: Note[] = (data?.data || []) as Note[]

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>My Notes</h1>
          <p style={s.count}>{data?.count ?? 0} notes</p>
        </div>
        <button
          style={s.newBtn}
          onClick={() => setModal({ id: "", title: "", content: "", tags: "" })}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Note
        </button>
      </div>

      <div style={s.searchWrap}>
        <svg
          style={s.searchIcon}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          style={s.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
        />
      </div>

      {isLoading ? (
        <div style={s.grid}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ ...s.card, height: "160px", opacity: 0.4 }} />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#7878A0"
              strokeWidth="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p style={s.emptyTitle}>
            {search ? "No notes found" : "No notes yet"}
          </p>
          <p style={s.emptySub}>
            {search
              ? "Try a different search term"
              : "Create your first note to get started"}
          </p>
          {!search && (
            <button
              style={s.newBtn}
              onClick={() =>
                setModal({ id: "", title: "", content: "", tags: "" })
              }
            >
              Create Note
            </button>
          )}
        </div>
      ) : (
        <div style={s.grid}>
          {notes.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onEdit={setModal}
              onDelete={(id) => del.mutate(id)}
              onShare={setShareNote}
              onHistory={setHistoryNote}
            />
          ))}
        </div>
      )}

      {modal !== undefined && (
        <NoteModal
          note={modal?.id ? modal : null}
          onClose={() => setModal(undefined)}
        />
      )}
      {shareNote && (
        <ShareModal note={shareNote} onClose={() => setShareNote(null)} />
      )}
      {historyNote && (
        <VersionModal note={historyNote} onClose={() => setHistoryNote(null)} />
      )}
    </div>
  )
}
