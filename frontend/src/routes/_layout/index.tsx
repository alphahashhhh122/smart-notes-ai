import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FiCpu, FiFileText, FiPlus, FiTrendingUp } from "react-icons/fi"
import { NotesService } from "../../client"
import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {
  const { user } = useAuth()
  const { data: notesData } = useQuery({
    queryKey: ["notes-count"],
    queryFn: () => NotesService.readNotes({ limit: 1 }),
  })

  const totalNotes = notesData?.count ?? 0
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  }
  const name = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"

  return (
    <div style={{ padding: "40px", maxWidth: "860px" }}>
      <div style={{ marginBottom: "40px" }}>
        <p style={{ fontSize: "13px", color: "#7878A0", margin: "0 0 4px" }}>{greeting()},</p>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "28px", color: "#E8E8F0", margin: "0 0 6px", letterSpacing: "-0.5px" }}>{name} 👋</h1>
        <p style={{ fontSize: "12px", color: "#4A4A6A", margin: 0 }}>{new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}</p>
      </div>

      <p style={{ fontSize: "10px", fontWeight: 600, color: "#4A4A6A", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>Overview</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "40px" }}>
        {[
          { icon: FiFileText, label: "Total Notes", value: totalNotes, color: "#7C6AF7" },
          { icon: FiTrendingUp, label: "Status", value: "Active", color: "#34D399" },
          { icon: FiCpu, label: "AI Queries", value: "∞", color: "#FBBF24" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#111218", border: "1px solid #1A1B26", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "34px", height: "34px", background: `${stat.color}15`, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${stat.color}25` }}>
                <stat.icon size={15} color={stat.color} />
              </div>
              <span style={{ fontSize: "11px", color: "#7878A0" }}>{stat.label}</span>
            </div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "22px", color: "#E8E8F0" }}>{stat.value}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: "10px", fontWeight: 600, color: "#4A4A6A", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px" }}>Quick Actions</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
        {[
          { icon: FiPlus, label: "Create a Note", desc: "Capture thoughts, ideas, and knowledge instantly", to: "/items", color: "#7C6AF7" },
          { icon: FiCpu, label: "Ask AI", desc: "Query your notes with natural language questions", to: "/ai", color: "#34D399" },
        ].map((action) => (
          <Link key={action.to} to={action.to} style={{ textDecoration: "none" }}>
            <div style={{ background: "#111218", border: "1px solid #1A1B26", borderRadius: "14px", padding: "20px", cursor: "pointer" }}>
              <div style={{ width: "38px", height: "38px", background: `${action.color}15`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${action.color}25`, marginBottom: "14px" }}>
                <action.icon size={17} color={action.color} />
              </div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "13px", color: "#E8E8F0", margin: "0 0 4px" }}>{action.label}</p>
              <p style={{ fontSize: "11px", color: "#7878A0", margin: 0, lineHeight: 1.5 }}>{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
