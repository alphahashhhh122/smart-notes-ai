import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { FiPlus, FiSearch, FiTrash2, FiSend, FiCpu, FiBookOpen } from "react-icons/fi"
import { z } from "zod"

import { type NotePublic, NotesService, AiService } from "@/client"
import PendingItems from "@/components/Pending/PendingItems"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination.tsx"

const notesSearchSchema = z.object({
  page: z.number().catch(1),
  search: z.string().catch(""),
})

const PER_PAGE = 6

function getNotesQueryOptions({
  page,
  search,
}: {
  page: number
  search: string
}) {
  return {
    queryFn: () =>
      NotesService.readNotes({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        search: search || undefined,
      }),
    queryKey: ["notes", { page, search }],
  }
}

export const Route = createFileRoute("/_layout/items")({
  component: Notes,
  validateSearch: (search) => notesSearchSchema.parse(search),
})

function NoteForm({ editingNote }: { editingNote?: NotePublic }) {
  const queryClient = useQueryClient()

  const [title, setTitle] = useState(editingNote?.title ?? "")
  const [content, setContent] = useState(editingNote?.content ?? "")
  const [tags, setTags] = useState(editingNote?.tags ?? "")

  const createMutation = useMutation({
    mutationFn: () =>
      NotesService.createNote({
        requestBody: {
          title,
          content,
          tags,
        },
      }),
    onSuccess: () => {
      setTitle("")
      setContent("")
      setTags("")
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      NotesService.updateNote({
        id: editingNote!.id,
        requestBody: {
          title,
          content,
          tags,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  const isEditing = Boolean(editingNote)

  return (
    <Card.Root borderWidth="1px" rounded="xl" shadow="sm" mb={6}>
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <Heading size="md">
            {isEditing ? "Edit note" : "Create a new note"}
          </Heading>

          <Input
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Write your note content here..."
            value={content}
            minH="120px"
            onChange={(e) => setContent(e.target.value)}
          />

          <Input
            placeholder="Tags, comma separated. Example: ai, fastapi, backend"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <Button
            alignSelf="flex-start"
            disabled={!title || !content}
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={() =>
              isEditing ? updateMutation.mutate() : createMutation.mutate()
            }
          >
            <FiPlus />
            {isEditing ? "Update note" : "Add note"}
          </Button>
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

function NoteCard({ note }: { note: NotePublic }) {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: () => NotesService.deleteNote({ id: note.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
    },
  })

  if (isEditing) {
    return (
      <Box>
        <NoteForm editingNote={note} />
        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
          Cancel edit
        </Button>
      </Box>
    )
  }

  const tagList =
    note.tags
      ?.split(",")
      .map((tag) => tag.trim())
      .filter(Boolean) ?? []

  return (
    <Card.Root borderWidth="1px" rounded="xl" shadow="sm" h="100%">
      <Card.Body>
        <VStack align="stretch" gap={3}>
          <Flex justify="space-between" align="flex-start" gap={3}>
            <Heading size="md">{note.title}</Heading>
            <HStack>
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorPalette="red"
                loading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
              >
                <FiTrash2 />
              </Button>
            </HStack>
          </Flex>

          <Text color="gray.700" whiteSpace="pre-wrap">
            {note.content}
          </Text>

          {tagList.length > 0 && (
            <HStack wrap="wrap">
              {tagList.map((tag) => (
                <Badge key={tag} variant="subtle">
                  {tag}
                </Badge>
              ))}
            </HStack>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

function NotesGrid() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { page, search } = Route.useSearch()
  const [searchInput, setSearchInput] = useState(search)

  const { data, isLoading, isPlaceholderData } = useQuery({
    ...getNotesQueryOptions({ page, search }),
    placeholderData: (prevData) => prevData,
  })

  const setPage = (page: number) => {
    navigate({
      to: "/items",
      search: (prev) => ({ ...prev, page }),
    })
  }

  const applySearch = () => {
    navigate({
      to: "/items",
      search: () => ({ page: 1, search: searchInput }),
    })
  }

  const notes = data?.data.slice(0, PER_PAGE) ?? []
  const count = data?.count ?? 0

  if (isLoading) {
    return <PendingItems />
  }

  return (
    <VStack align="stretch" gap={5}>
      <Flex gap={3}>
        <Input
          placeholder="Search by title, content, or tags..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applySearch()
          }}
        />
        <Button onClick={applySearch}>
          <FiSearch />
          Search
        </Button>
      </Flex>

      {notes.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Content>
            <EmptyState.Indicator>
              <FiSearch />
            </EmptyState.Indicator>
            <VStack textAlign="center">
              <EmptyState.Title>No notes found</EmptyState.Title>
              <EmptyState.Description>
                Create a note or try a different search.
              </EmptyState.Description>
            </VStack>
          </EmptyState.Content>
        </EmptyState.Root>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
          {notes.map((note) => (
            <Box key={note.id} opacity={isPlaceholderData ? 0.5 : 1}>
              <NoteCard note={note} />
            </Box>
          ))}
        </SimpleGrid>
      )}

      <Flex justifyContent="flex-end" mt={2}>
        <PaginationRoot
          count={count}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <Flex>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </Flex>
        </PaginationRoot>
      </Flex>
    </VStack>
  )
}

function AskMyNotes() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAsk = async () => {
    if (!question.trim()) return

    setIsLoading(true)
    setError(null)
    setAnswer(null)
    setSources([])

    try {
      const response = await AiService.askNotes({
        requestBody: {
          question: question.trim(),
        },
      })
      setAnswer(response.answer)
      setSources(response.sources || [])
    } catch (err: any) {
      setError(
        err.message ||
          "An unexpected error occurred while consulting your knowledge base."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card.Root
      borderWidth="1px"
      borderColor="purple.200"
      bg="purple.50/30"
      backdropFilter="blur(8px)"
      rounded="xl"
      shadow="md"
      mb={6}
    >
      <Card.Body>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between">
            <HStack gap={2}>
              <Box color="purple.600" fontSize="xl" display="flex" alignItems="center">
                <FiCpu />
              </Box>
              <Heading size="md" color="purple.950">
                Ask My Notes AI
              </Heading>
            </HStack>
            <Badge colorPalette="purple" variant="subtle">
              FastAPI + RAG MVP
            </Badge>
          </HStack>
          
          <Text fontSize="sm" color="purple.900/80">
            Ask any question. The AI will inspect your tags, titles, and note contents to formulate an answer using only your knowledge base.
          </Text>

          <Flex gap={3}>
            <Input
              placeholder="e.g. What did I write about FastAPI deployment?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              borderColor="purple.200"
              _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk()
              }}
            />
            <Button
              colorPalette="purple"
              onClick={handleAsk}
              loading={isLoading}
              disabled={!question.trim()}
            >
              <FiSend />
              Ask AI
            </Button>
          </Flex>

          {error && (
            <Box
              p={3}
              bg="red.50"
              color="red.800"
              rounded="md"
              fontSize="sm"
              borderLeftWidth="4px"
              borderLeftColor="red.500"
            >
              {error}
            </Box>
          )}

          {answer && (
            <Card.Root variant="subtle" bg="white" shadow="sm" p={4} rounded="lg" borderLeftWidth="4px" borderLeftColor="purple.500">
              <VStack align="stretch" gap={3}>
                <Heading size="xs" color="purple.950" textTransform="uppercase" letterSpacing="wider">
                  AI Answer
                </Heading>
                <Text color="gray.800" whiteSpace="pre-wrap" fontSize="md" lineHeight="tall">
                  {answer}
                </Text>
                
                {sources.length > 0 && (
                  <VStack align="stretch" gap={2} mt={2} pt={3} borderTopWidth="1px" borderTopColor="gray.100">
                    <Heading size="xs" color="gray.500">
                      Sources Cited
                    </Heading>
                    <HStack wrap="wrap" gap={2}>
                      {sources.map((src) => (
                        <Badge key={src.id} colorPalette="purple" variant="surface" size="sm" cursor="help" title={src.snippet}>
                          <HStack gap={1}>
                            <Box display="flex" alignItems="center">
                              <FiBookOpen />
                            </Box>
                            <Text>{src.title}</Text>
                          </HStack>
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </Card.Root>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  )
}

function Notes() {
  return (
    <Container maxW="7xl" py={10}>
      <VStack align="stretch" gap={6}>
        <Box>
          <Heading size="2xl">Smart Notes</Heading>
          <Text color="gray.600" mt={2}>
            Save notes, tag them, search across them, and ask AI questions
            from your own knowledge base.
          </Text>
        </Box>

        <AskMyNotes />
        <NoteForm />
        <NotesGrid />
      </VStack>
    </Container>
  )
}