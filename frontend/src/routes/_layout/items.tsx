import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { NotesService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/items")({
  component: NotesPage,
})

interface Note { id: string; title: string; content: string; tags?: string | null }

const s: Record<string, React.CSSProperties> = {
  page: { padding: "32px", fontFamily: "'DM Sans', sans-serif", color: "#E8E8F0" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" },
  h1: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "22px", color: "#E8E8F0", margin: "0 0 4px", letterSpacing: "-0.5px" },
  count: { fontSize: "12px", color: "#7878A0", margin: 0 },
  newBtn: { height: "38px", padding: "0 16px", background: "#7C6AF7", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  searchWrap: { position: "relative", maxWidth: "360px", marginBottom: "28px" },
  searchIcon: { position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#4A4A6A", pointerEvents: "none" as const },
  searchInput: { width: "100%", height: "38px", background: "#111218", border: "1px solid #1A1B26", borderRadius: "9px", color: "#E8E8F0", fontSize: "13px", paddingLeft: "32px", paddingRight: "12px", outline: "none", boxSizing: "border-box" as const },
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  card: { background: "#111218", border: "1px solid #1A1B26", borderRadius: "14px", padding: "18px", position: "relative" as const, cursor: "pointer" },
  cardTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "13px", color: "#E8E8F0", margin: "0 0 8px", paddingRight: "56px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const },
  cardContent: { fontSize: "12px", color: "#7878A0", lineHeight: 1.6, margin: "0 0 14px", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: "6px" },
  tagWrap: { display: "flex", gap: "4px", flexWrap: "wrap" as const },
  tag: { padding: "2px 8px", background: "rgba(124,106,247,0.12)", border: "1px solid rgba(124,106,247,0.2)", borderRadius: "5px", fontSize: "10px", color: "#9B8CF9", fontWeight: 500 },
  actions: { position: "absolute" as const, top: "12px", right: "12px", display: "flex", gap: "4px", opacity: 0 },
  actionBtn: { width: "26px", height: "26px", background: "#1A1B26", border: "none", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#7878A0" },
  empty: { display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px" },
  emptyIcon: { width: "56px", height: "56px", background: "rgba(124,106,247,0.08)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(124,106,247,0.12)" },
  emptyTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "15px", color: "#E8E8F0", margin: 0 },
  emptySub: { fontSize: "12px", color: "#7878A0", margin: 0 },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" },
  modal: { background: "#111218", border: "1px solid #22232E", borderRadius: "18px", padding: "24px", width: "100%", maxWidth: "520px" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
  modalTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "15px", color: "#E8E8F0", margin: 0 },
  closeBtn: { background: "none", border: "none", color: "#7878A0", cursor: "pointer", fontSize: "18px" },
  fieldLabel: { display: "block", fontSize: "11px", color: "#7878A0", fontWeight: 500, marginBottom: "6px" },
  fieldInput: { width: "100%", height: "40px", background: "#1A1B26", border: "1px solid #22232E", borderRadius: "8px", color: "#E8E8F0", fontSize: "13px", padding: "0 12px", outline: "none", boxSizing: "border-box" as const, marginBottom: "14px" },
  fieldTextarea: { width: "100%", minHeight: "120px", background: "#1A1B26", border: "1px solid #22232E", borderRadius: "8px", color: "#E8E8F0", fontSize: "13px", padding: "10px 12px", outline: "none", boxSizing: "border-box" as const, resize: "vertical" as const, fontFamily: "'DM Sans', sans-serif", marginBottom: "14px" },
  modalFooter: { display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "6px" },
  cancelBtn: { height: "36px", padding: "0 16px", background: "transparent", border: "1px solid #22232E", borderRadius: "8px", color: "#7878A0", fontSize: "13px", cursor: "pointer" },
  saveBtn: { height: "36px", padding: "0 18px", background: "#7C6AF7", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
}

function NoteCard({ note, onEdit, onDelete }: { note: Note; onEdit: (n: Note) => void; onDelete: (id: string) => void }) {
  const [hovered, setHovered] = useState(false)
  const tags = note.tags ? note.tags.split(",").map(t => t.trim()).filter(Boolean) : []
  return (
    <div style={s.card} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ ...s.actions, opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
        <button style={s.actionBtn} onClick={e => { e.stopPropagation(); onEdit(note) }} title="Edit">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button style={{ ...s.actionBtn, color: "#F87171" }} onClick={e => { e.stopPropagation(); onDelete(note.id) }} title="Delete">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
      <p style={s.cardTitle}>{note.title}</p>
      <p style={s.cardContent}>{note.content}</p>
      <div style={s.cardFooter}>
        <div style={s.tagWrap}>{tags.slice(0,3).map(t => <span key={t} style={s.tag}>{t}</span>)}</div>
      </div>
    </div>
  )
}

function NoteModal({ note, onClose }: { note: Note | null; onClose: () => void }) {
  const qc = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const isEditing = !!note?.id
  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [tags, setTags] = useState(note?.tags || "")

  const create = useMutation({
    mutationFn: () => NotesService.createNote({ requestBody: { title, content, tags } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); qc.invalidateQueries({ queryKey: ["notes-count"] }); showSuccessToast("Note created!"); onClose() },
    onError: () => showErrorToast("Failed to create note"),
  })
  const update = useMutation({
    mutationFn: () => NotesService.updateNote({ id: note!.id, requestBody: { title, content, tags } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); showSuccessToast("Note updated!"); onClose() },
    onError: () => showErrorToast("Failed to update note"),
  })

  const saving = create.isPending || update.isPending
  const save = () => { if (!title.trim()) return; isEditing ? update.mutate() : create.mutate() }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={e => e.stopPropagation()}>
        <div style={s.modalHeader}>
          <h3 style={s.modalTitle}>{isEditing ? "Edit Note" : "New Note"}</h3>
          <button style={s.closeBtn} onClick={onClose}>×</button>
        </div>
        <label style={s.fieldLabel}>Title *</label>
        <input style={s.fieldInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title..." />
        <label style={s.fieldLabel}>Content</label>
        <textarea style={s.fieldTextarea} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note here..." />
        <label style={s.fieldLabel}>Tags (comma separated)</label>
        <input style={s.fieldInput} value={tags} onChange={e => setTags(e.target.value)} placeholder="work, ideas, research..." />
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...s.saveBtn, opacity: (!title.trim() || saving) ? 0.6 : 1 }} onClick={save} disabled={!title.trim() || saving}>
            {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Note"}
          </button>
        </div>
      </div>
    </div>
  )
}

function NotesPage() {
  const qc = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<Note | null | undefined>(undefined)

  const { data, isLoading } = useQuery({
    queryKey: ["notes", search],
    queryFn: () => NotesService.readNotes({ limit: 100, search: search || undefined }),
  })

  const del = useMutation({
    mutationFn: (id: string) => NotesService.deleteNote({ id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notes"] }); qc.invalidateQueries({ queryKey: ["notes-count"] }); showSuccessToast("Note deleted") },
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
        <button style={s.newBtn} onClick={() => setModal({ id: "", title: "", content: "", tags: "" })}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Note
        </button>
      </div>

      <div style={s.searchWrap}>
        <svg style={s.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input style={s.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." />
      </div>

      {isLoading ? (
        <div style={s.grid}>{[...Array(6)].map((_, i) => <div key={i} style={{ ...s.card, height: "160px", opacity: 0.4 }} />)}</div>
      ) : notes.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7878A0" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <p style={s.emptyTitle}>{search ? "No notes found" : "No notes yet"}</p>
          <p style={s.emptySub}>{search ? "Try a different search term" : "Create your first note to get started"}</p>
          {!search && <button style={s.newBtn} onClick={() => setModal({ id: "", title: "", content: "", tags: "" })}>Create Note</button>}
        </div>
      ) : (
        <div style={s.grid}>
          {notes.map(n => <NoteCard key={n.id} note={n} onEdit={setModal} onDelete={id => del.mutate(id)} />)}
        </div>
      )}

      {modal !== undefined && <NoteModal note={modal?.id ? modal : null} onClose={() => setModal(undefined)} />}
    </div>
  )
}
