import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { useState, useRef, useEffect } from "react"
import { FiCpu, FiSend, FiUser } from "react-icons/fi"
import { AiService } from "../../client"

export const Route = createFileRoute("/_layout/ai")({
  component: AiChatPage,
})

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: Array<{ id: string; title: string; snippet: string }>
}

const SUGGESTIONS = [
  "Summarize all my notes",
  "What topics have I written about?",
  "Find my notes about work",
  "What ideas do I have?",
]

function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return

    const userMsg: Message = { role: "user", content: question }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsLoading(true)

    try {
      const response = await AiService.askNotes({ requestBody: { question } })
      const assistantMsg: Message = {
        role: "assistant",
        content: response.answer,
        sources: response.sources,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process your question. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => sendMessage(input)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Flex direction="column" h="100vh" p={8} pb={4}>
      {/* Header */}
      <Box mb={6}>
        <Flex alignItems="center" gap={3} mb={2}>
          <Flex
            w="36px"
            h="36px"
            bg="rgba(52,211,153,0.12)"
            borderRadius="10px"
            alignItems="center"
            justifyContent="center"
            border="1px solid rgba(52,211,153,0.2)"
          >
            <Box as={FiCpu} color="#34D399" fontSize="16px" />
          </Flex>
          <Heading
            fontFamily="'Syne', sans-serif"
            fontWeight="800"
            fontSize="2xl"
            color="#E8E8F0"
            letterSpacing="-0.5px"
          >
            Ask AI
          </Heading>
        </Flex>
        <Text color="#7878A0" fontSize="sm">
          Ask anything about your notes using natural language
        </Text>
      </Box>

      {/* Chat area */}
      <Box
        flex={1}
        overflow="auto"
        mb={4}
        pr={2}
      >
        {messages.length === 0 ? (
          <Box py={8}>
            {/* Empty state */}
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              mb={12}
              gap={3}
            >
              <Flex
                w="64px"
                h="64px"
                bg="rgba(52,211,153,0.08)"
                borderRadius="20px"
                alignItems="center"
                justifyContent="center"
                border="1px solid rgba(52,211,153,0.12)"
              >
                <Box as={FiCpu} fontSize="28px" color="#34D399" />
              </Flex>
              <Box textAlign="center">
                <Text
                  fontFamily="'Syne', sans-serif"
                  fontWeight="700"
                  color="#E8E8F0"
                  fontSize="lg"
                  mb={1}
                >
                  What would you like to know?
                </Text>
                <Text fontSize="sm" color="#7878A0" maxW="400px">
                  I can answer questions based on your notes, find connections,
                  and summarize information for you.
                </Text>
              </Box>
            </Flex>

            {/* Suggestions */}
            <Text
              fontSize="10px"
              fontWeight="600"
              color="#4A4A6A"
              letterSpacing="1.5px"
              textTransform="uppercase"
              mb={3}
              textAlign="center"
            >
              Try asking
            </Text>
            <Flex gap={2} flexWrap="wrap" justifyContent="center" maxW="600px" mx="auto">
              {SUGGESTIONS.map((s) => (
                <Box
                  key={s}
                  as="button"
                  onClick={() => sendMessage(s)}
                  px={4}
                  py={2}
                  bg="#111218"
                  border="1px solid #1A1B26"
                  borderRadius="20px"
                  fontSize="xs"
                  color="#9878A0"
                  _hover={{
                    border: "1px solid rgba(52,211,153,0.3)",
                    color: "#34D399",
                    bg: "rgba(52,211,153,0.05)",
                  }}
                  transition="all 0.15s"
                  cursor="pointer"
                >
                  {s}
                </Box>
              ))}
            </Flex>
          </Box>
        ) : (
          <VStack gap={4} alignItems="stretch" maxW="720px">
            {messages.map((msg, i) => (
              <Flex
                key={i}
                gap={3}
                alignItems="flex-start"
                flexDirection={msg.role === "user" ? "row-reverse" : "row"}
              >
                {/* Avatar */}
                <Flex
                  w="30px"
                  h="30px"
                  borderRadius="8px"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  bg={
                    msg.role === "user"
                      ? "rgba(124,106,247,0.15)"
                      : "rgba(52,211,153,0.12)"
                  }
                  border={
                    msg.role === "user"
                      ? "1px solid rgba(124,106,247,0.25)"
                      : "1px solid rgba(52,211,153,0.2)"
                  }
                  mt={0.5}
                >
                  <Box
                    as={msg.role === "user" ? FiUser : FiCpu}
                    fontSize="13px"
                    color={msg.role === "user" ? "#7C6AF7" : "#34D399"}
                  />
                </Flex>

                {/* Bubble */}
                <Box maxW="85%">
                  <Box
                    bg={msg.role === "user" ? "rgba(124,106,247,0.1)" : "#111218"}
                    border={
                      msg.role === "user"
                        ? "1px solid rgba(124,106,247,0.2)"
                        : "1px solid #1A1B26"
                    }
                    borderRadius={
                      msg.role === "user"
                        ? "16px 4px 16px 16px"
                        : "4px 16px 16px 16px"
                    }
                    px={4}
                    py={3}
                  >
                    <Text
                      fontSize="sm"
                      color="#E8E8F0"
                      lineHeight="1.7"
                      whiteSpace="pre-wrap"
                    >
                      {msg.content}
                    </Text>
                  </Box>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <Box mt={2}>
                      <Text
                        fontSize="10px"
                        color="#4A4A6A"
                        fontWeight="600"
                        letterSpacing="1px"
                        textTransform="uppercase"
                        mb={1.5}
                      >
                        Sources
                      </Text>
                      <Flex gap={2} flexWrap="wrap">
                        {msg.sources.map((src) => (
                          <Box
                            key={src.id}
                            px={3}
                            py={1.5}
                            bg="#0D0E14"
                            border="1px solid #1A1B26"
                            borderRadius="8px"
                            maxW="200px"
                          >
                            <Text
                              fontSize="xs"
                              color="#9B8CF9"
                              fontWeight="500"
                              noOfLines={1}
                            >
                              {src.title}
                            </Text>
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  )}
                </Box>
              </Flex>
            ))}

            {/* Loading */}
            {isLoading && (
              <Flex gap={3} alignItems="flex-start">
                <Flex
                  w="30px"
                  h="30px"
                  borderRadius="8px"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  bg="rgba(52,211,153,0.12)"
                  border="1px solid rgba(52,211,153,0.2)"
                >
                  <Box as={FiCpu} fontSize="13px" color="#34D399" />
                </Flex>
                <Box
                  bg="#111218"
                  border="1px solid #1A1B26"
                  borderRadius="4px 16px 16px 16px"
                  px={4}
                  py={3}
                >
                  <Flex gap={1} alignItems="center">
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        w="6px"
                        h="6px"
                        bg="#34D399"
                        borderRadius="full"
                        opacity={0.6}
                        style={{
                          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </Flex>
                </Box>
              </Flex>
            )}
            <div ref={bottomRef} />
          </VStack>
        )}
      </Box>

      {/* Input */}
      <Box maxW="720px">
        <Flex
          gap={2}
          bg="#111218"
          border="1px solid #22232E"
          borderRadius="14px"
          p={2}
          _focusWithin={{
            border: "1px solid rgba(52,211,153,0.4)",
            boxShadow: "0 0 0 3px rgba(52,211,153,0.08)",
          }}
          transition="all 0.2s"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your notes..."
            bg="transparent"
            border="none"
            color="#E8E8F0"
            fontSize="sm"
            _placeholder={{ color: "#4A4A6A" }}
            _focus={{ outline: "none", boxShadow: "none" }}
            flex={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            w="36px"
            h="36px"
            minW="36px"
            bg="#34D399"
            borderRadius="10px"
            p={0}
            _hover={{ bg: "#2DC48A" }}
            _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
            transition="all 0.15s"
          >
            <Box as={FiSend} fontSize="14px" color="white" />
          </Button>
        </Flex>
        <Text fontSize="10px" color="#4A4A6A" textAlign="center" mt={2}>
          Answers are based on your notes only
        </Text>
      </Box>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Flex>
  )
}
