import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Link, createFileRoute, redirect } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiZap } from "react-icons/fi"

import { type Body_login_login_access_token as AccessToken } from "../client"
import { Field } from "../components/ui/field"
import { PasswordInput } from "../components/ui/password-input"
import useAuth, { isLoggedIn } from "../hooks/useAuth"

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
  },
})

function Login() {
  const { loginMutation, error, resetError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return
    resetError()
    try {
      await loginMutation.mutateAsync(data)
    } catch {
      // error handled by useAuth
    }
  }

  return (
    <Box
      minH="100vh"
      bg="#0A0B0F"
      position="relative"
      overflow="hidden"
    >
      {/* Background effects */}
      <Box
        position="absolute"
        top="-200px"
        left="-200px"
        w="600px"
        h="600px"
        borderRadius="full"
        style={{ background: "radial-gradient(circle, rgba(124,106,247,0.12) 0%, transparent 70%)" }}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-100px"
        right="-100px"
        w="400px"
        h="400px"
        borderRadius="full"
        style={{ background: "radial-gradient(circle, rgba(124,106,247,0.08) 0%, transparent 70%)" }}
        pointerEvents="none"
      />

      <Container maxW="420px" py={0}>
        <Flex minH="100vh" alignItems="center" justifyContent="center">
          <Box w="full">
            {/* Logo */}
            <VStack gap={2} mb={10} alignItems="flex-start">
              <Flex
                w="44px"
                h="44px"
                style={{ background: "rgba(124,106,247,0.15)" }}
                borderRadius="12px"
                alignItems="center"
                justifyContent="center"
                border="1px solid rgba(124,106,247,0.3)"
                mb={2}
              >
                <Box as={FiZap} color="#7C6AF7" fontSize="20px" />
              </Flex>
              <Heading
                fontSize="2xl"
                fontFamily="'Syne', sans-serif"
                fontWeight="800"
                color="#E8E8F0"
                letterSpacing="-0.5px"
              >
                Smart Notes AI
              </Heading>
              <Text color="#7878A0" fontSize="sm">
                Your intelligent knowledge base
              </Text>
            </VStack>

            {/* Card */}
            <Box
              bg="#111218"
              border="1px solid #22232E"
              borderRadius="20px"
              p={8}
              boxShadow="0 20px 60px rgba(0,0,0,0.4)"
            >
              <Heading
                fontSize="lg"
                fontFamily="'Syne', sans-serif"
                fontWeight="700"
                color="#E8E8F0"
                mb={1}
              >
                Welcome back
              </Heading>
              <Text color="#7878A0" fontSize="sm" mb={7}>
                Sign in to your account to continue
              </Text>

              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack gap={5}>
                  <Field
                    label="Email"
                    invalid={!!errors.username}
                    errorText={errors.username?.message}
                  >
                    <Input
                      id="username"
                      {...register("username", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address",
                        },
                      })}
                      placeholder="you@example.com"
                      type="email"
                      bg="#1A1B26"
                      border="1px solid #22232E"
                      borderRadius="10px"
                      color="#E8E8F0"
                      fontSize="sm"
                      h="44px"
                      px={4}
                      _placeholder={{ color: "#4A4A6A" }}
                      _focus={{
                        border: "1px solid #7C6AF7",
                        boxShadow: "0 0 0 3px rgba(124,106,247,0.15)",
                        outline: "none",
                      }}
                      _hover={{ border: "1px solid #3A3B4E" }}
                    />
                  </Field>

                  <Field
                    label="Password"
                    invalid={!!errors.password || !!error}
                    errorText={
                      errors.password?.message ||
                      (error ? "Invalid email or password" : undefined)
                    }
                  >
                    <PasswordInput
                      id="password"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                      })}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      bg="#1A1B26"
                      border="1px solid #22232E"
                      borderRadius="10px"
                      color="#E8E8F0"
                      fontSize="sm"
                      h="44px"
                      _placeholder={{ color: "#4A4A6A" }}
                      _focus={{
                        border: "1px solid #7C6AF7",
                        boxShadow: "0 0 0 3px rgba(124,106,247,0.15)",
                        outline: "none",
                      }}
                      _hover={{ border: "1px solid #3A3B4E" }}
                    />
                  </Field>

                  <Flex w="full" justifyContent="flex-end" mt={-2}>
                    <Link to="/recover-password">
                      <Text
                        fontSize="xs"
                        color="#7C6AF7"
                        _hover={{ color: "#9B8CF9" }}
                        cursor="pointer"
                      >
                        Forgot password?
                      </Text>
                    </Link>
                  </Flex>

                  <Button
                    type="submit"
                    w="full"
                    h="44px"
                    bg="#7C6AF7"
                    color="white"
                    borderRadius="10px"
                    fontSize="sm"
                    fontWeight="600"
                    loading={isSubmitting}
                    _hover={{
                      bg: "#6B5AE6",
                      transform: "translateY(-1px)",
                      boxShadow: "0 8px 20px rgba(124,106,247,0.3)",
                    }}
                    _active={{ transform: "translateY(0)" }}
                    transition="all 0.2s"
                    mt={1}
                  >
                    Sign in
                  </Button>
                </VStack>
              </form>
            </Box>

            <Text textAlign="center" mt={6} fontSize="sm" color="#7878A0">
              Don't have an account?{" "}
              <Link to="/signup">
                <Text
                  as="span"
                  color="#7C6AF7"
                  fontWeight="500"
                  _hover={{ color: "#9B8CF9" }}
                  cursor="pointer"
                >
                  Sign up
                </Text>
              </Link>
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}



