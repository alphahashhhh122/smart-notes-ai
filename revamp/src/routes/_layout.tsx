import { Box, Flex } from "@chakra-ui/react"
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
      <Flex minH="100vh" bg="#0A0B0F" alignItems="center" justifyContent="center">
        <Box
          w="32px"
          h="32px"
          border="2px solid rgba(124,106,247,0.2)"
          borderTop="2px solid #7C6AF7"
          borderRadius="full"
          animation="spin 0.8s linear infinite"
          style={{ animationName: "spin" }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </Flex>
    )
  }

  return (
    <Flex minH="100vh" bg="#0A0B0F">
      <Sidebar />
      <Box flex={1} overflow="auto" minH="100vh">
        <Outlet />
      </Box>
      <Toaster />
    </Flex>
  )
}
