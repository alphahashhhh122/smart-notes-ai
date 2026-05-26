import { Box, Flex, Text, VStack } from "@chakra-ui/react"
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

const bottomItems = [
  { icon: FiSettings, label: "Settings", to: "/settings" },
]

export function Sidebar() {
  const { logout, user } = useAuth()
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <Box
      w="240px"
      minH="100vh"
      bg="#0D0E14"
      borderRight="1px solid #1A1B26"
      display="flex"
      flexDirection="column"
      py={6}
      position="sticky"
      top={0}
      flexShrink={0}
    >
      {/* Logo */}
      <Flex alignItems="center" gap={3} px={5} mb={8}>
        <Flex
          w="34px"
          h="34px"
          bg="rgba(124,106,247,0.15)"
          borderRadius="10px"
          alignItems="center"
          justifyContent="center"
          border="1px solid rgba(124,106,247,0.25)"
          flexShrink={0}
        >
          <Box as={FiZap} color="#7C6AF7" fontSize="15px" />
        </Flex>
        <Text
          fontFamily="'Syne', sans-serif"
          fontWeight="800"
          fontSize="sm"
          color="#E8E8F0"
          letterSpacing="-0.3px"
        >
          Smart Notes AI
        </Text>
      </Flex>

      {/* Nav label */}
      <Text
        px={5}
        fontSize="10px"
        fontWeight="600"
        color="#4A4A6A"
        letterSpacing="1.5px"
        textTransform="uppercase"
        mb={2}
      >
        Menu
      </Text>

      {/* Main nav */}
      <VStack gap={1} alignItems="stretch" px={3} flex={1}>
        {navItems.map((item) => {
          const isActive =
            item.to === "/"
              ? currentPath === "/"
              : currentPath.startsWith(item.to)
          return (
            <Link key={item.to} to={item.to}>
              <Flex
                alignItems="center"
                gap={3}
                px={3}
                py={2.5}
                borderRadius="10px"
                bg={isActive ? "rgba(124,106,247,0.12)" : "transparent"}
                border={
                  isActive
                    ? "1px solid rgba(124,106,247,0.2)"
                    : "1px solid transparent"
                }
                color={isActive ? "#7C6AF7" : "#7878A0"}
                _hover={{
                  bg: isActive
                    ? "rgba(124,106,247,0.15)"
                    : "rgba(255,255,255,0.04)",
                  color: isActive ? "#7C6AF7" : "#E8E8F0",
                }}
                transition="all 0.15s"
                cursor="pointer"
              >
                <Box as={item.icon} fontSize="15px" flexShrink={0} />
                <Text fontSize="sm" fontWeight={isActive ? "600" : "400"}>
                  {item.label}
                </Text>
              </Flex>
            </Link>
          )
        })}

        {user?.is_superuser && (
          <Link to="/admin">
            <Flex
              alignItems="center"
              gap={3}
              px={3}
              py={2.5}
              borderRadius="10px"
              bg={
                currentPath.startsWith("/admin")
                  ? "rgba(124,106,247,0.12)"
                  : "transparent"
              }
              border={
                currentPath.startsWith("/admin")
                  ? "1px solid rgba(124,106,247,0.2)"
                  : "1px solid transparent"
              }
              color={
                currentPath.startsWith("/admin") ? "#7C6AF7" : "#7878A0"
              }
              _hover={{
                bg: "rgba(255,255,255,0.04)",
                color: "#E8E8F0",
              }}
              transition="all 0.15s"
              cursor="pointer"
            >
              <Box as={FiUsers} fontSize="15px" flexShrink={0} />
              <Text fontSize="sm" fontWeight="400">
                Admin
              </Text>
            </Flex>
          </Link>
        )}
      </VStack>

      {/* Bottom section */}
      <Box px={3} mt={4}>
        <Box h="1px" bg="#1A1B26" mb={4} mx={2} />

        {bottomItems.map((item) => (
          <Link key={item.to} to={item.to}>
            <Flex
              alignItems="center"
              gap={3}
              px={3}
              py={2.5}
              borderRadius="10px"
              color="#7878A0"
              _hover={{
                bg: "rgba(255,255,255,0.04)",
                color: "#E8E8F0",
              }}
              transition="all 0.15s"
              cursor="pointer"
              mb={1}
            >
              <Box as={item.icon} fontSize="15px" flexShrink={0} />
              <Text fontSize="sm">{item.label}</Text>
            </Flex>
          </Link>
        ))}

        {/* User + logout */}
        <Box mt={2} px={3} py={3} bg="#111218" borderRadius="12px">
          <Text
            fontSize="xs"
            fontWeight="600"
            color="#E8E8F0"
            mb={0.5}
            noOfLines={1}
          >
            {user?.full_name || user?.email?.split("@")[0] || "User"}
          </Text>
          <Text fontSize="10px" color="#4A4A6A" noOfLines={1} mb={3}>
            {user?.email}
          </Text>
          <Flex
            alignItems="center"
            gap={2}
            color="#7878A0"
            _hover={{ color: "#F87171" }}
            cursor="pointer"
            transition="color 0.15s"
            onClick={logout}
          >
            <Box as={FiLogOut} fontSize="13px" />
            <Text fontSize="xs">Sign out</Text>
          </Flex>
        </Box>
      </Box>
    </Box>
  )
}

export default Sidebar
