import { Link, useRouterState } from "@tanstack/react-router"
import {
  FiCpu,
  FiHome,
  FiLogOut,
  FiSettings,
  FiUsers,
  FiZap,
} from "react-icons/fi"
import { LuNotebook } from "react-icons/lu"
import useAuth from "../../hooks/useAuth"

const navItems = [
  { icon: FiHome, label: "Dashboard", to: "/" },
  { icon: LuNotebook, label: "My Notes", to: "/items" },
  { icon: FiCpu, label: "Ask AI", to: "/ai" },
]

export function Sidebar() {
  const { logout, user } = useAuth()
  const router = useRouterState()
  const currentPath = router.location.pathname

  const isActive = (to: string) =>
    to === "/" ? currentPath === "/" : currentPath.startsWith(to)

  return (
    <div
      style={{
        width: "220px",
        minHeight: "100vh",
        background: "#0D0E14",
        borderRight: "1px solid #1A1B26",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0",
        flexShrink: 0,
        position: "sticky",
        top: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "0 20px",
          marginBottom: "32px",
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
            flexShrink: 0,
          }}
        >
          <FiZap color="#7C6AF7" size={14} />
        </div>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "13px",
            color: "#E8E8F0",
            letterSpacing: "-0.3px",
          }}
        >
          Smart Notes AI
        </span>
      </div>

      <span
        style={{
          padding: "0 20px",
          fontSize: "10px",
          fontWeight: 600,
          color: "#4A4A6A",
          letterSpacing: "1.5px",
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        Menu
      </span>

      {/* Nav items */}
      <div
        style={{
          flex: 1,
          padding: "0 12px",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {navItems.map((item) => (
          <Link key={item.to} to={item.to} style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                background: isActive(item.to)
                  ? "rgba(124,106,247,0.12)"
                  : "transparent",
                border: isActive(item.to)
                  ? "1px solid rgba(124,106,247,0.2)"
                  : "1px solid transparent",
                color: isActive(item.to) ? "#7C6AF7" : "#7878A0",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <item.icon size={14} />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isActive(item.to) ? 600 : 400,
                }}
              >
                {item.label}
              </span>
            </div>
          </Link>
        ))}

        {user?.is_superuser && (
          <Link to="/admin" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "9px 12px",
                borderRadius: "8px",
                background: isActive("/admin")
                  ? "rgba(124,106,247,0.12)"
                  : "transparent",
                border: isActive("/admin")
                  ? "1px solid rgba(124,106,247,0.2)"
                  : "1px solid transparent",
                color: isActive("/admin") ? "#7C6AF7" : "#7878A0",
                cursor: "pointer",
              }}
            >
              <FiUsers size={14} />
              <span style={{ fontSize: "13px" }}>Admin</span>
            </div>
          </Link>
        )}
      </div>

      {/* Bottom */}
      <div style={{ padding: "0 12px", marginTop: "16px" }}>
        <div
          style={{ height: "1px", background: "#1A1B26", margin: "0 8px 16px" }}
        />

        <Link to="/settings" style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              borderRadius: "8px",
              color: "#7878A0",
              cursor: "pointer",
              marginBottom: "4px",
            }}
          >
            <FiSettings size={14} />
            <span style={{ fontSize: "13px" }}>Settings</span>
          </div>
        </Link>

        <div
          style={{
            padding: "12px",
            background: "#111218",
            borderRadius: "10px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#E8E8F0",
              marginBottom: "2px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.full_name || user?.email?.split("@")[0] || "User"}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#4A4A6A",
              marginBottom: "10px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user?.email}
          </div>
          <div
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              color: "#7878A0",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            <FiLogOut size={12} />
            <span>Sign out</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
