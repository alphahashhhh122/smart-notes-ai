import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { UsersService, type UserUpdateMe, type UpdatePassword } from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"

export const Route = createFileRoute("/_layout/settings")({
  component: SettingsPage,
})

const s: Record<string, React.CSSProperties> = {
  page: { padding: "32px", fontFamily: "'DM Sans', sans-serif", color: "#E8E8F0", maxWidth: "700px" },
  h1: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "22px", color: "#E8E8F0", margin: "0 0 28px", letterSpacing: "-0.5px" },
  tabs: { display: "flex", gap: "4px", marginBottom: "28px", background: "#111218", border: "1px solid #1A1B26", borderRadius: "10px", padding: "4px" },
  tab: (active: boolean): React.CSSProperties => ({ padding: "8px 18px", borderRadius: "7px", fontSize: "13px", fontWeight: active ? 600 : 400, color: active ? "#E8E8F0" : "#7878A0", background: active ? "#1A1B26" : "transparent", border: "none", cursor: "pointer", transition: "all 0.15s" }),
  card: { background: "#111218", border: "1px solid #1A1B26", borderRadius: "14px", padding: "24px", marginBottom: "16px" },
  cardTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "14px", color: "#E8E8F0", margin: "0 0 6px" },
  cardSub: { fontSize: "12px", color: "#7878A0", margin: "0 0 20px" },
  label: { display: "block", fontSize: "11px", color: "#7878A0", fontWeight: 500, marginBottom: "6px" },
  input: { width: "100%", height: "40px", background: "#1A1B26", border: "1px solid #22232E", borderRadius: "8px", color: "#E8E8F0", fontSize: "13px", padding: "0 12px", outline: "none", boxSizing: "border-box" as const, marginBottom: "14px" },
  row: { display: "flex", gap: "10px", marginTop: "4px" },
  btn: { height: "36px", padding: "0 18px", background: "#7C6AF7", color: "white", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  ghostBtn: { height: "36px", padding: "0 16px", background: "transparent", border: "1px solid #22232E", borderRadius: "8px", color: "#7878A0", fontSize: "13px", cursor: "pointer" },
  dangerBtn: { height: "36px", padding: "0 18px", background: "rgba(248,113,113,0.1)", color: "#F87171", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
  error: { fontSize: "11px", color: "#F87171", marginTop: "-10px", marginBottom: "10px" },
  successMsg: { fontSize: "12px", color: "#34D399", marginTop: "8px" },
  infoRow: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1A1B26" },
  infoLabel: { fontSize: "12px", color: "#7878A0" },
  infoValue: { fontSize: "13px", color: "#E8E8F0", fontWeight: 500 },
  badge: { padding: "2px 10px", background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "20px", fontSize: "11px", color: "#34D399" },
  confirmOverlay: { position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  confirmBox: { background: "#111218", border: "1px solid #22232E", borderRadius: "16px", padding: "28px", maxWidth: "400px", width: "90%" },
}

function ProfileTab() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [editing, setEditing] = useState(false)
  const { register, handleSubmit, reset, formState: { isSubmitting, isDirty, errors } } = useForm<UserUpdateMe>({
    defaultValues: { full_name: user?.full_name || "", email: user?.email || "" }
  })
  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) => UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => { showSuccessToast("Profile updated!"); setEditing(false); qc.invalidateQueries() },
    onError: () => showErrorToast("Failed to update profile"),
  })
  const onSubmit: SubmitHandler<UserUpdateMe> = (data) => mutation.mutate(data)

  return (
    <div>
      <div style={s.card}>
        <p style={s.cardTitle}>Account Info</p>
        <p style={s.cardSub}>Your account details and role</p>
        <div style={s.infoRow}>
          <span style={s.infoLabel}>Account type</span>
          <span style={user?.is_superuser ? s.badge : { ...s.badge, background: "rgba(124,106,247,0.1)", borderColor: "rgba(124,106,247,0.2)", color: "#9B8CF9" }}>
            {user?.is_superuser ? "Admin" : "User"}
          </span>
        </div>
        <div style={{ ...s.infoRow, borderBottom: "none" }}>
          <span style={s.infoLabel}>Account status</span>
          <span style={s.badge}>{user?.is_active ? "Active" : "Inactive"}</span>
        </div>
      </div>

      <div style={s.card}>
        <p style={s.cardTitle}>Personal Information</p>
        <p style={s.cardSub}>Update your name and email address</p>
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <label style={s.label}>Full name</label>
            <input style={s.input} {...register("full_name", { maxLength: 30 })} placeholder="Your name" />
            <label style={s.label}>Email</label>
            <input style={s.input} type="email" {...register("email", { required: "Email required" })} />
            {errors.email && <p style={s.error}>{errors.email.message}</p>}
            <div style={s.row}>
              <button type="submit" style={{ ...s.btn, opacity: (!isDirty || isSubmitting) ? 0.6 : 1 }} disabled={!isDirty || isSubmitting}>
                {isSubmitting ? "Saving..." : "Save changes"}
              </button>
              <button type="button" style={s.ghostBtn} onClick={() => { reset(); setEditing(false) }}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Full name</span>
              <span style={s.infoValue}>{user?.full_name || "Not set"}</span>
            </div>
            <div style={{ ...s.infoRow, borderBottom: "none" }}>
              <span style={s.infoLabel}>Email</span>
              <span style={s.infoValue}>{user?.email}</span>
            </div>
            <div style={{ marginTop: "16px" }}>
              <button style={s.btn} onClick={() => setEditing(true)}>Edit profile</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PasswordTab() {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { register, handleSubmit, reset, watch, formState: { isSubmitting, errors } } = useForm<{ current_password: string; new_password: string; confirm: string }>()
  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) => UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => { showSuccessToast("Password updated!"); reset() },
    onError: () => showErrorToast("Current password incorrect"),
  })
  const onSubmit = (data: { current_password: string; new_password: string; confirm: string }) => {
    mutation.mutate({ current_password: data.current_password, new_password: data.new_password })
  }

  return (
    <div style={s.card}>
      <p style={s.cardTitle}>Change Password</p>
      <p style={s.cardSub}>Use a strong password with at least 8 characters</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label style={s.label}>Current password</label>
        <input style={s.input} type="password" {...register("current_password", { required: "Required" })} />
        {errors.current_password && <p style={s.error}>{errors.current_password.message}</p>}
        <label style={s.label}>New password</label>
        <input style={s.input} type="password" {...register("new_password", { required: "Required", minLength: { value: 8, message: "Min 8 characters" } })} />
        {errors.new_password && <p style={s.error}>{errors.new_password.message}</p>}
        <label style={s.label}>Confirm new password</label>
        <input style={s.input} type="password" {...register("confirm", { validate: v => v === watch("new_password") || "Passwords don't match" })} />
        {errors.confirm && <p style={s.error}>{errors.confirm.message}</p>}
        <button type="submit" style={{ ...s.btn, opacity: isSubmitting ? 0.6 : 1 }} disabled={isSubmitting}>
          {isSubmitting ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  )
}

function DangerTab() {
  const { user, logout } = useAuth()
  const { showErrorToast } = useCustomToast()
  const [confirm, setConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await UsersService.deleteUserMe()
      logout()
    } catch { showErrorToast("Failed to delete account"); setDeleting(false) }
  }

  return (
    <div>
      <div style={s.card}>
        <p style={s.cardTitle}>Delete Account</p>
        <p style={s.cardSub}>Permanently delete your account and all your notes. This cannot be undone.</p>
        <button style={s.dangerBtn} onClick={() => setConfirm(true)}>Delete my account</button>
      </div>

      {confirm && (
        <div style={s.confirmOverlay} onClick={() => setConfirm(false)}>
          <div style={s.confirmBox} onClick={e => e.stopPropagation()}>
            <p style={{ ...s.cardTitle, fontSize: "16px", marginBottom: "8px" }}>Are you absolutely sure?</p>
            <p style={{ fontSize: "13px", color: "#7878A0", marginBottom: "20px" }}>
              This will permanently delete the account for <strong style={{ color: "#E8E8F0" }}>{user?.email}</strong> and all associated notes.
            </p>
            <div style={s.row}>
              <button style={s.dangerBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button style={s.ghostBtn} onClick={() => setConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState("profile")
  const tabs = [
    { id: "profile", label: "My Profile" },
    { id: "password", label: "Password" },
    { id: "danger", label: "Danger Zone" },
  ]
  if (!user) return null

  return (
    <div style={s.page}>
      <h1 style={s.h1}>Settings</h1>
      <div style={s.tabs}>
        {tabs.map(t => (
          <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
        ))}
      </div>
      {tab === "profile" && <ProfileTab />}
      {tab === "password" && <PasswordTab />}
      {tab === "danger" && <DangerTab />}
    </div>
  )
}
