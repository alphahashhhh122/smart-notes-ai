import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { Toaster } from "../components/ui/toaster"
import { Sidebar } from "../components/Common/Sidebar"
import useAuth, { isLoggedIn } from "../hooks/useAuth"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
})

function Layout() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div style={{ minHeight:"100vh", background:"#0A0B0F", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"32px", height:"32px", border:"2px solid rgba(124,106,247,0.2)", borderTop:"2px solid #7C6AF7", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0A0B0F", display:"flex" }}>
      <Sidebar />
      <div style={{ flex:1, overflow:"auto", minHeight:"100vh" }}>
        <Outlet />
      </div>
      <Toaster />
    </div>
  )
}
