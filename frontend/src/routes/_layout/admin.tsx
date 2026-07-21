import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { z } from "zod"
import { type UserPublic, UsersService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"

const usersSearchSchema = z.object({ page: z.number().catch(1) })
const PER_PAGE = 5

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
  validateSearch: (search) => usersSearchSchema.parse(search),
})

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
    margin: 0,
    letterSpacing: "-0.5px",
  },
  addBtn: {
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
  table: { width: "100%", borderCollapse: "collapse" as const },
  thead: { background: "#111218", borderBottom: "1px solid #1A1B26" },
  th: {
    padding: "12px 16px",
    textAlign: "left" as const,
    fontSize: "11px",
    fontWeight: 600,
    color: "#7878A0",
    letterSpacing: "0.5px",
    textTransform: "uppercase" as const,
  },
  tr: { borderBottom: "1px solid #1A1B26", transition: "background 0.15s" },
  td: { padding: "14px 16px", fontSize: "13px", color: "#E8E8F0" },
  badge: (color: string): React.CSSProperties => ({
    display: "inline-block",
    padding: "2px 10px",
    background: `${color}15`,
    border: `1px solid ${color}30`,
    borderRadius: "20px",
    fontSize: "11px",
    color,
    fontWeight: 500,
  }),
  youTag: {
    marginLeft: "8px",
    padding: "1px 8px",
    background: "rgba(124,106,247,0.12)",
    border: "1px solid rgba(124,106,247,0.2)",
    borderRadius: "10px",
    fontSize: "10px",
    color: "#9B8CF9",
  },
  pagination: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "6px",
    marginTop: "20px",
  },
  pageBtn: (active: boolean): React.CSSProperties => ({
    width: "32px",
    height: "32px",
    background: active ? "#7C6AF7" : "#111218",
    border: `1px solid ${active ? "#7C6AF7" : "#1A1B26"}`,
    borderRadius: "8px",
    color: active ? "white" : "#7878A0",
    fontSize: "13px",
    cursor: "pointer",
  }),
  overlay: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    background: "#111218",
    border: "1px solid #22232E",
    borderRadius: "18px",
    padding: "24px",
    width: "100%",
    maxWidth: "440px",
  },
  modalTitle: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "15px",
    color: "#E8E8F0",
    margin: "0 0 20px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    color: "#7878A0",
    fontWeight: 500,
    marginBottom: "6px",
  },
  input: {
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
  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  checkbox: { width: "16px", height: "16px", accentColor: "#7C6AF7" },
  modalFooter: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "8px",
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
  actionBtn: {
    background: "none",
    border: "none",
    color: "#7878A0",
    cursor: "pointer",
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "6px",
  },
}

function AddUserModal({ onClose }: { onClose: () => void }) {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    email: "",
    full_name: "",
    password: "",
    is_superuser: false,
  })
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!form.email || !form.password) return
    setSaving(true)
    try {
      await UsersService.createUser({
        requestBody: {
          email: form.email,
          full_name: form.full_name,
          password: form.password,
          is_superuser: form.is_superuser,
        },
      })
      showSuccessToast("User created!")
      qc.invalidateQueries({ queryKey: ["users"] })
      onClose()
    } catch {
      showErrorToast("Failed to create user")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <p style={s.modalTitle}>Add New User</p>
        <label style={s.label}>Email *</label>
        <input
          style={s.input}
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          placeholder="user@example.com"
        />
        <label style={s.label}>Full name</label>
        <input
          style={s.input}
          value={form.full_name}
          onChange={(e) =>
            setForm((f) => ({ ...f, full_name: e.target.value }))
          }
          placeholder="Full name"
        />
        <label style={s.label}>Password *</label>
        <input
          style={s.input}
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
        />
        <div style={s.checkRow}>
          <input
            style={s.checkbox}
            type="checkbox"
            checked={form.is_superuser}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_superuser: e.target.checked }))
            }
            id="su"
          />
          <label
            htmlFor="su"
            style={{ fontSize: "13px", color: "#E8E8F0", cursor: "pointer" }}
          >
            Superuser
          </label>
        </div>
        <div style={s.modalFooter}>
          <button style={s.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            style={{
              ...s.saveBtn,
              opacity: !form.email || !form.password || saving ? 0.6 : 1,
            }}
            onClick={handleAdd}
            disabled={!form.email || !form.password || saving}
          >
            {saving ? "Adding..." : "Add User"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Admin() {
  const qc = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const navigate = useNavigate({ from: Route.fullPath })
  const { page } = Route.useSearch()
  const [showAdd, setShowAdd] = useState(false)
  const currentUser = qc.getQueryData<UserPublic>(["currentUser"])

  const { data, isLoading } = useQuery({
    queryFn: () =>
      UsersService.readUsers({ skip: (page - 1) * PER_PAGE, limit: PER_PAGE }),
    queryKey: ["users", { page }],
    placeholderData: (prev: any) => prev,
  })

  const users = data?.data ?? []
  const count = data?.count ?? 0
  const totalPages = Math.ceil(count / PER_PAGE)

  const deleteUser = async (id: string) => {
    try {
      await UsersService.deleteUser({ userId: id })
      showSuccessToast("User deleted")
      qc.invalidateQueries({ queryKey: ["users"] })
    } catch {
      showErrorToast("Failed to delete user")
    }
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.h1}>Users Management</h1>
          <p style={{ fontSize: "12px", color: "#7878A0", margin: "4px 0 0" }}>
            {count} users
          </p>
        </div>
        <button style={s.addBtn} onClick={() => setShowAdd(true)}>
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
          Add User
        </button>
      </div>

      <div
        style={{
          background: "#111218",
          border: "1px solid #1A1B26",
          borderRadius: "14px",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#7878A0",
              fontSize: "13px",
            }}
          >
            Loading users...
          </div>
        ) : (
          <table style={s.table}>
            <thead style={s.thead}>
              <tr>
                {["Full name", "Email", "Role", "Status", "Actions"].map(
                  (h) => (
                    <th key={h} style={s.th}>
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={s.tr}>
                  <td style={s.td}>
                    {user.full_name || (
                      <span style={{ color: "#4A4A6A" }}>N/A</span>
                    )}
                    {currentUser?.id === user.id && (
                      <span style={s.youTag}>You</span>
                    )}
                  </td>
                  <td style={{ ...s.td, color: "#9898B0" }}>{user.email}</td>
                  <td style={s.td}>
                    <span
                      style={s.badge(user.is_superuser ? "#FBBF24" : "#7C6AF7")}
                    >
                      {user.is_superuser ? "Superuser" : "User"}
                    </span>
                  </td>
                  <td style={s.td}>
                    <span
                      style={s.badge(user.is_active ? "#34D399" : "#F87171")}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={s.td}>
                    {currentUser?.id !== user.id && (
                      <button
                        style={{ ...s.actionBtn, color: "#F87171" }}
                        onClick={() => deleteUser(user.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={s.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              style={s.pageBtn(p === page)}
              onClick={() =>
                navigate({
                  to: "/admin",
                  search: (prev: any) => ({ ...prev, page: p }),
                })
              }
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
