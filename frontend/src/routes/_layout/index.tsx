import { Box, Flex, Grid, Heading, Text, VStack } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { FiCpu, FiFileText, FiPlus, FiTrendingUp } from "react-icons/fi"
import { NotesService } from "../../client"
import useAuth from "../../hooks/useAuth"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
}) {
  return (
    <Box
      bg="#111218"
      border="1px solid #1A1B26"
      borderRadius="16px"
      p={5}
      transition="all 0.2s"
      _hover={{ border: "1px solid #2A2B3D", transform: "translateY(-2px)" }}
    >
      <Flex alignItems="center" gap={3} mb={4}>
        <Flex
          w="36px"
          h="36px"
          bg={`${color}15`}
          borderRadius="10px"
          alignItems="center"
          justifyContent="center"
          border={`1px solid ${color}25`}
        >
          <Box as={icon} color={color} fontSize="16px" />
        </Flex>
        <Text fontSize="xs" color="#7878A0" fontWeight="500">
          {label}
        </Text>
      </Flex>
      <Text
        fontSize="2xl"
        fontFamily="'Syne', sans-serif"
        fontWeight="700"
        color="#E8E8F0"
      >
        {value}
      </Text>
    </Box>
  )
}

function QuickAction({
  icon,
  label,
  description,
  to,
  accent,
}: {
  icon: React.ElementType
  label: string
  description: string
  to: string
  accent: string
}) {
  return (
    <Link to={to}>
      <Box
        bg="#111218"
        border="1px solid #1A1B26"
        borderRadius="16px"
        p={5}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          border: `1px solid ${accent}40`,
          bg: `${accent}08`,
          transform: "translateY(-2px)",
        }}
      >
        <Flex
          w="40px"
          h="40px"
          bg={`${accent}15`}
          borderRadius="12px"
          alignItems="center"
          justifyContent="center"
          border={`1px solid ${accent}25`}
          mb={4}
        >
          <Box as={icon} color={accent} fontSize="18px" />
        </Flex>
        <Text
          fontFamily="'Syne', sans-serif"
          fontWeight="700"
          fontSize="sm"
          color="#E8E8F0"
          mb={1}
        >
          {label}
        </Text>
        <Text fontSize="xs" color="#7878A0" lineHeight="1.5">
          {description}
        </Text>
      </Box>
    </Link>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const { data: notesData } = useQuery({
    queryKey: ["notes-count"],
    queryFn: () => NotesService.readNotes({ limit: 1 }),
  })

  const totalNotes = notesData?.count ?? 0
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const name = user?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "there"

  return (
    <Box p={8} maxW="900px">
      {/* Header */}
      <Box mb={10}>
        <Text fontSize="sm" color="#7878A0" mb={1}>
          {greeting()},
        </Text>
        <Heading
          fontFamily="'Syne', sans-serif"
          fontWeight="800"
          fontSize="3xl"
          color="#E8E8F0"
          letterSpacing="-0.5px"
        >
          {name} ðŸ‘‹
        </Heading>
        <Text color="#4A4A6A" fontSize="sm" mt={2}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </Box>

      {/* Stats */}
      <Text
        fontSize="10px"
        fontWeight="600"
        color="#4A4A6A"
        letterSpacing="1.5px"
        textTransform="uppercase"
        mb={4}
      >
        Overview
      </Text>
      <Grid templateColumns="repeat(3, 1fr)" gap={4} mb={10}>
        <StatCard
          icon={FiFileText}
          label="Total Notes"
          value={totalNotes}
          color="#7C6AF7"
        />
        <StatCard
          icon={FiTrendingUp}
          label="This Week"
          value="Active"
          color="#34D399"
        />
        <StatCard
          icon={FiCpu}
          label="AI Queries"
          value="âˆž"
          color="#FBBF24"
        />
      </Grid>

      {/* Quick actions */}
      <Text
        fontSize="10px"
        fontWeight="600"
        color="#4A4A6A"
        letterSpacing="1.5px"
        textTransform="uppercase"
        mb={4}
      >
        Quick Actions
      </Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <QuickAction
          icon={FiPlus}
          label="Create a Note"
          description="Capture thoughts, ideas, and knowledge instantly"
          to="/items"
          accent="#7C6AF7"
        />
        <QuickAction
          icon={FiCpu}
          label="Ask AI"
          description="Query your notes with natural language questions"
          to="/ai"
          accent="#34D399"
        />
      </Grid>
    </Box>
  )
}
