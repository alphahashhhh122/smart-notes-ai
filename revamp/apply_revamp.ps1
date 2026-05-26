# Smart Notes AI - Full Frontend Revamp
# Run from project root: powershell -ExecutionPolicy Bypass -File apply_revamp.ps1

Write-Host "Applying Smart Notes AI revamp..." -ForegroundColor Cyan

$base = "frontend\src"

# theme.tsx
@'
import { createSystem, defaultConfig } from "@chakra-ui/react"

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: { fontSize: "16px" },
    body: {
      fontFamily: "'DM Sans', sans-serif",
      fontSize: "0.9rem",
      margin: 0,
      padding: 0,
      bg: "#0A0B0F",
      color: "#E8E8F0",
      WebkitFontSmoothing: "antialiased",
    },
    "h1, h2, h3, h4": { fontFamily: "'Syne', sans-serif" },
    "::-webkit-scrollbar": { width: "5px" },
    "::-webkit-scrollbar-track": { background: "#0A0B0F" },
    "::-webkit-scrollbar-thumb": { background: "#2A2B3D", borderRadius: "10px" },
    ".main-link": { color: "#7C6AF7", fontWeight: "bold" },
  },
  theme: {
    tokens: {
      colors: {
        ui: {
          main: { value: "#7C6AF7" },
          bg: { value: "#0A0B0F" },
          surface: { value: "#111218" },
          raised: { value: "#1A1B26" },
          border: { value: "#22232E" },
          accent: { value: "#7C6AF7" },
          accentMuted: { value: "#3D3580" },
          text: { value: "#E8E8F0" },
          textMuted: { value: "#7878A0" },
          success: { value: "#34D399" },
          warning: { value: "#FBBF24" },
          danger: { value: "#F87171" },
        },
      },
      fonts: {
        heading: { value: "'Syne', sans-serif" },
        body: { value: "'DM Sans', sans-serif" },
        mono: { value: "'JetBrains Mono', monospace" },
      },
    },
  },
})
'@ | Set-Content "$base\theme.tsx" -Encoding UTF8

Write-Host "  theme.tsx" -ForegroundColor Green

# index.html - add Google Fonts
$indexPath = "frontend\index.html"
$indexContent = Get-Content $indexPath -Raw
if ($indexContent -notmatch "fonts.googleapis.com") {
    $fontLink = '<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">'
    $indexContent = $indexContent -replace '<title>', "$fontLink`n    <title>"
    $indexContent | Set-Content $indexPath -Encoding UTF8
    Write-Host "  index.html (fonts added)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Now copy the following files manually from the revamp folder:" -ForegroundColor Yellow
Write-Host "  - routes/login.tsx" -ForegroundColor White
Write-Host "  - routes/_layout.tsx" -ForegroundColor White
Write-Host "  - routes/_layout/index.tsx" -ForegroundColor White
Write-Host "  - routes/_layout/items.tsx" -ForegroundColor White
Write-Host "  - routes/_layout/ai.tsx (NEW)" -ForegroundColor White
Write-Host "  - components/Common/Sidebar.tsx" -ForegroundColor White
Write-Host ""
Write-Host "Done!" -ForegroundColor Cyan
