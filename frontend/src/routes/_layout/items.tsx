import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Input,
  Text,
  Textarea,
  VStack,
  Badge,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi"
import { LuNotebook } from "react-icons/lu"
import { NotesService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/items")({
  component: NotesPage,
})

interface Note {
  id: string
  title: string
  content: string
  tags?: string
  updated_at?: string
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: Note
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
}) {
  const tags = note.tags
    ? note.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : []

  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return "just now"
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <Box
      bg="#111218"
      border="1px solid #1A1B26"
      borderRadius="16px"
      p={5}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{ border: "1px solid #2A2B3D", transform: "translateY(-2px)" }}
      position="relative"
      role="group"
    >
      {/* Action buttons */}
      <Flex
        position="absolute"
        top={4}
        right={4}
        gap={1}
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.15s"
      >
        <Box
          as="button"
          w="28px"
          h="28px"
          bg="#1A1B26"
          borderRadius="8px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="#7878A0"
          _hover={{ bg: "#22232E", color: "#7C6AF7" }}
          transition="all 0.15s"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            onEdit(note)
          }}
        >
          <Box as={FiEdit2} fontSize="12px" />
        </Box>
        <Box
          as="button"
          w="28px"
          h="28px"
          bg="#1A1B26"
          borderRadius="8px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="#7878A0"
          _hover={{ bg: "#2A1A1A", color: "#F87171" }}
          transition="all 0.15s"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            onDelete(note.id)
          }}
        >
          <Box as={FiTrash2} fontSize="12px" />
        </Box>
      </Flex>

      <Text
        fontFamily="'Syne', sans-serif"
        fontWeight="700"
        fontSize="sm"
        color="#E8E8F0"
        mb={2}
        pr={10}
        noOfLines={2}
      >
        {note.title}
      </Text>

      <Text
        fontSize="xs"
        color="#7878A0"
        lineHeight="1.6"
        noOfLines={3}
        mb={4}
      >
        {note.content}
      </Text>

      <Flex alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Flex gap={1} flexWrap="wrap">
          {tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              bg="rgba(124,106,247,0.12)"
              color="#9B8CF9"
              border="1px solid rgba(124,106,247,0.2)"
              borderRadius="6px"
              px={2}
              py={0.5}
              fontSize="10px"
              fontWeight="500"
            >
              {tag}
            </Badge>
          ))}
        </Flex>
        <Text fontSize="10px" color="#4A4A6A">
          {timeAgo(note.updated_at)}
        </Text>
      </Flex>
    </Box>
  )
}

function NoteModal({
  note,
  onClose,
}: {
  note: Note | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const isEditing = !!note?.id

  const [title, setTitle] = useState(note?.title || "")
  const [content, setContent] = useState(note?.content || "")
  const [tags, setTags] = useState(note?.tags || "")

  const createMutation = useMutation({
    mutationFn: () =>
      NotesService.createNote({ requestBody: { title, content, tags } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["notes-count"] })
      showSuccessToast("Note created!")
      onClose()
    },
    onError: () => showErrorToast("Failed to create note"),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      NotesService.updateNote({
        id: note!.id,
        requestBody: { title, content, tags },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      showSuccessToast("Note updated!")
      onClose()
    },
    onError: () => showErrorToast("Failed to update note"),
  })

  const handleSave = () => {
    if (!title.trim()) return
    if (isEditing) updateMutation.mutate()
    else createMutation.mutate()
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <Box
      position="fixed"
      inset={0}
      bg="rgba(0,0,0,0.7)"
      zIndex={100}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      backdropFilter="blur(4px)"
      onClick={onClose}
    >
      <Box
        bg="#111218"
        border="1px solid #22232E"
        borderRadius="20px"
        p={6}
        w="full"
        maxW="560px"
        boxShadow="0 25px 80px rgba(0,0,0,0.5)"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Flex alignItems="center" justifyContent="space-between" mb={6}>
          <Heading
            fontFamily="'Syne', sans-serif"
            fontWeight="700"
            fontSize="md"
            color="#E8E8F0"
          >
            {isEditing ? "Edit Note" : "New Note"}
          </Heading>
          <Box
            as="button"
            w="28px"
            h="28px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="#7878A0"
            _hover={{ color: "#E8E8F0" }}
            onClick={onClose}
          >
            <Box as={FiX} fontSize="16px" />
          </Box>
        </Flex>

        <VStack gap={4}>
          <Box w="full">
            <Text fontSize="xs" color="#7878A0" mb={2} fontWeight="500">
              Title *
            </Text>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              bg="#1A1B26"
              border="1px solid #22232E"
              borderRadius="10px"
              color="#E8E8F0"
              fontSize="sm"
              h="40px"
              _placeholder={{ color: "#4A4A6A" }}
              _focus={{
                border: "1px solid #7C6AF7",
                boxShadow: "0 0 0 3px rgba(124,106,247,0.1)",
                outline: "none",
              }}
            />
          </Box>

          <Box w="full">
            <Text fontSize="xs" color="#7878A0" mb={2} fontWeight="500">
              Content
            </Text>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              bg="#1A1B26"
              border="1px solid #22232E"
              borderRadius="10px"
              color="#E8E8F0"
              fontSize="sm"
              rows={6}
              _placeholder={{ color: "#4A4A6A" }}
              _focus={{
                border: "1px solid #7C6AF7",
                boxShadow: "0 0 0 3px rgba(124,106,247,0.1)",
                outline: "none",
              }}
              resize="vertical"
            />
          </Box>

          <Box w="full">
            <Flex alignItems="center" gap={1} mb={2}>
              <Box as={FiTag} fontSize="11px" color="#7878A0" />
              <Text fontSize="xs" color="#7878A0" fontWeight="500">
                Tags (comma separated)
              </Text>
            </Flex>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, ideas, research..."
              bg="#1A1B26"
              border="1px solid #22232E"
              borderRadius="10px"
              color="#E8E8F0"
              fontSize="sm"
              h="40px"
              _placeholder={{ color: "#4A4A6A" }}
              _focus={{
                border: "1px solid #7C6AF7",
                boxShadow: "0 0 0 3px rgba(124,106,247,0.1)",
                outline: "none",
              }}
            />
          </Box>

          <Flex gap={3} w="full" justifyContent="flex-end" mt={2}>
            <Button
              variant="ghost"
              onClick={onClose}
              h="38px"
              px={4}
              fontSize="sm"
              color="#7878A0"
              _hover={{ bg: "#1A1B26", color: "#E8E8F0" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
              disabled={!title.trim()}
              h="38px"
              px={5}
              fontSize="sm"
              fontWeight="600"
              bg="#7C6AF7"
              color="white"
              borderRadius="10px"
              _hover={{ bg: "#6B5AE6" }}
              _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
            >
              {isEditing ? "Save Changes" : "Create Note"}
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
  )
}

function NotesPage() {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [search, setSearch] = useState("")
  const [modalNote, setModalNote] = useState<Note | null | undefined>(
    undefined,
  )

  const { data, isLoading } = useQuery({
    queryKey: ["notes", search],
    queryFn: () =>
      NotesService.readNotes({ limit: 100, search: search || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => NotesService.deleteNote({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] })
      queryClient.invalidateQueries({ queryKey: ["notes-count"] })
      showSuccessToast("Note deleted")
    },
    onError: () => showErrorToast("Failed to delete note"),
  })

  const notes: Note[] = data?.data || []

  return (
    <Box p={8}>
      {/* Header */}
      <Flex alignItems="center" justifyContent="space-between" mb={8}>
        <Box>
          <Heading
            fontFamily="'Syne', sans-serif"
            fontWeight="800"
            fontSize="2xl"
            color="#E8E8F0"
            letterSpacing="-0.5px"
          >
            My Notes
          </Heading>
          <Text color="#7878A0" fontSize="sm" mt={1}>
            {data?.count ?? 0} notes
          </Text>
        </Box>
        <Button
          onClick={() => setModalNote({ id: "", title: "", content: "", tags: "" })}
          h="40px"
          px={4}
          bg="#7C6AF7"
          color="white"
          borderRadius="10px"
          fontSize="sm"
          fontWeight="600"
          _hover={{
            bg: "#6B5AE6",
            transform: "translateY(-1px)",
            boxShadow: "0 6px 20px rgba(124,106,247,0.3)",
          }}
          transition="all 0.2s"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Box as={FiPlus} fontSize="14px" />
          New Note
        </Button>
      </Flex>

      {/* Search */}
      <Box position="relative" mb={8} maxW="400px">
        <Box
          position="absolute"
          left={3}
          top="50%"
          transform="translateY(-50%)"
          color="#4A4A6A"
          pointerEvents="none"
          zIndex={1}
        >
          <Box as={FiSearch} fontSize="14px" />
        </Box>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes..."
          bg="#111218"
          border="1px solid #1A1B26"
          borderRadius="10px"
          color="#E8E8F0"
          fontSize="sm"
          h="40px"
          pl={9}
          _placeholder={{ color: "#4A4A6A" }}
          _focus={{
            border: "1px solid #7C6AF7",
            boxShadow: "0 0 0 3px rgba(124,106,247,0.1)",
            outline: "none",
          }}
        />
      </Box>

      {/* Notes Grid */}
      {isLoading ? (
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          {[...Array(6)].map((_, i) => (
            <Box
              key={i}
              bg="#111218"
              border="1px solid #1A1B26"
              borderRadius="16px"
              h="180px"
              opacity={0.5}
            />
          ))}
        </Grid>
      ) : notes.length === 0 ? (
        <Flex
          direction="column"
          alignItems="center"
          justifyContent="center"
          py={20}
          gap={4}
        >
          <Flex
            w="64px"
            h="64px"
            bg="rgba(124,106,247,0.08)"
            borderRadius="20px"
            alignItems="center"
            justifyContent="center"
            border="1px solid rgba(124,106,247,0.12)"
          >
            <Box as={LuNotebook} fontSize="28px" color="#7878A0" />
          </Flex>
          <Box textAlign="center">
            <Text
              fontFamily="'Syne', sans-serif"
              fontWeight="700"
              color="#E8E8F0"
              mb={1}
            >
              {search ? "No notes found" : "No notes yet"}
            </Text>
            <Text fontSize="sm" color="#7878A0">
              {search
                ? "Try a different search term"
                : "Create your first note to get started"}
            </Text>
          </Box>
          {!search && (
            <Button
              onClick={() =>
                setModalNote({ id: "", title: "", content: "", tags: "" })
              }
              h="38px"
              px={5}
              bg="#7C6AF7"
              color="white"
              borderRadius="10px"
              fontSize="sm"
              fontWeight="600"
              _hover={{ bg: "#6B5AE6" }}
              mt={2}
            >
              Create Note
            </Button>
          )}
        </Flex>
      ) : (
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={(n) => setModalNote(n)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </Grid>
      )}

      {/* Modal */}
      {modalNote !== undefined && (
        <NoteModal
          note={modalNote.id ? modalNote : null}
          onClose={() => setModalNote(undefined)}
        />
      )}
    </Box>
  )
}
