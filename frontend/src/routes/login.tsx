import { createFileRoute, redirect, Link } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import { type Body_login_login_access_token as AccessToken } from "../client"
import useAuth, { isLoggedIn } from "../hooks/useAuth"

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) throw redirect({ to: "/" })
  },
})

function Login() {
  const { loginMutation, error, resetError } = useAuth()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AccessToken>({ mode: "onBlur" })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return
    resetError()
    try { await loginMutation.mutateAsync(data) } catch {}
  }

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: "100vh", background: "#0A0B0F", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'DM Sans', sans-serif" },
    wrap: { width: "100%", maxWidth: "400px" },
    logoBox: { width: "40px", height: "40px", background: "rgba(124,106,247,0.15)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(124,106,247,0.3)", marginBottom: "12px" },
    title: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "22px", color: "#E8E8F0", margin: "0 0 4px", letterSpacing: "-0.5px" },
    subtitle: { fontSize: "13px", color: "#7878A0", margin: "0 0 28px" },
    card: { background: "#111218", border: "1px solid #22232E", borderRadius: "18px", padding: "32px" },
    cardTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "16px", color: "#E8E8F0", margin: "0 0 4px" },
    cardSub: { fontSize: "13px", color: "#7878A0", margin: "0 0 24px" },
    label: { display: "block", fontSize: "12px", color: "#7878A0", fontWeight: 500, marginBottom: "6px" },
    input: { width: "100%", height: "42px", background: "#1A1B26", border: "1px solid #22232E", borderRadius: "9px", color: "#E8E8F0", fontSize: "13px", padding: "0 12px", outline: "none", boxSizing: "border-box" },
    inputWrap: { position: "relative" },
    eyeBtn: { position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#7878A0", cursor: "pointer", fontSize: "13px" },
    error: { fontSize: "11px", color: "#F87171", marginTop: "4px" },
    forgotWrap: { display: "flex", justifyContent: "flex-end", marginBottom: "20px" },
    forgot: { fontSize: "12px", color: "#7C6AF7", textDecoration: "none" },
    btn: { width: "100%", height: "42px", background: "#7C6AF7", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: 600, cursor: "pointer" },
    bottomText: { textAlign: "center" as const, marginTop: "20px", fontSize: "13px", color: "#7878A0" },
    link: { color: "#7C6AF7", textDecoration: "none", fontWeight: 500 },
    fieldWrap: { marginBottom: "16px" },
  }

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.logoBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C6AF7" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h1 style={s.title}>Smart Notes AI</h1>
        <p style={s.subtitle}>Your intelligent knowledge base</p>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Welcome back</h2>
          <p style={s.cardSub}>Sign in to your account to continue</p>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={s.fieldWrap}>
              <label style={s.label}>Email</label>
              <input style={s.input} type="email" placeholder="you@example.com"
                {...register("username", { required: "Email is required", pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email" } })} />
              {errors.username && <p style={s.error}>{errors.username.message}</p>}
            </div>

            <div style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <div style={s.inputWrap}>
                <input style={s.input} type={showPass ? "text" : "password"} placeholder="••••••••"
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })} />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPass(!showPass)}>{showPass ? "hide" : "show"}</button>
              </div>
              {(errors.password || error) && <p style={s.error}>{errors.password?.message || "Incorrect email or password"}</p>}
            </div>

            <div style={s.forgotWrap}>
              <Link to="/recover-password" style={s.forgot}>Forgot password?</Link>
            </div>

            <button type="submit" style={{ ...s.btn, opacity: isSubmitting ? 0.7 : 1 }} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p style={s.bottomText}>
          Don't have an account?{" "}
          <Link to="/signup" style={s.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
