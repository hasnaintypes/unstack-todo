import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"
import { Link } from "@tanstack/react-router"

import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import { Eye, EyeOff } from "lucide-react"

interface AuthFormProps extends React.ComponentProps<"div"> {
  type: "sign-in" | "sign-up"
}

export function AuthForm({ className, type, ...props }: AuthFormProps) {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isSignIn = type === "sign-in"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isSignIn) {
        await signIn(email, password)
        toast.success("Welcome back!")
      } else {
        // Password validation: 8+ chars, 1 uppercase, 1 lowercase, 1 digit
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
        if (!passwordRegex.test(password)) {
          throw new Error("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, and a number.")
        }
        if (!name.trim()) {
          throw new Error("Name is required for sign up.")
        }
        await signUp(email, password, name)
        toast.success("Account created successfully!")
      }
      navigate({ to: "/dashboard" })
    } catch (err: any) {
      toast.error(err.message || "An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup className="gap-4">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <h1 className="text-xl font-bold">
              {isSignIn ? "Welcome Back" : "Create an Account"}
            </h1>
            <FieldDescription>
              {isSignIn ? (
                <>
                  Don&apos;t have an account?{" "}
                  <Link to="/auth/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/auth/sign-in" className="underline underline-offset-4">
                    Sign in
                  </Link>
                </>
              )}
            </FieldDescription>
          </div>
          {!isSignIn && (
            <Field className="gap-1.5">
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </Field>
          )}
          <Field className="gap-1.5">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </Field>
          <Field className="gap-1.5">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              {isSignIn && (
                <a href="#" className="text-sm underline underline-offset-4">
                  Forgot Password?
                </a>
              )}
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="size-4 cursor-pointer" />
                ) : (
                  <Eye className="size-4 cursor-pointer" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </button>
            </div>
          </Field>
          <Field className="pt-1">
            <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
              {isLoading ? "Loading..." : isSignIn ? "Login" : "Register"}
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              type="button"
              className="h-9 cursor-pointer"
              onClick={() => toast.info("Apple Sign-in is coming soon!")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              Apple
            </Button>
            <Button
              variant="outline"
              type="button"
              className="h-9 cursor-pointer"
              onClick={() => toast.info("Google Sign-in is coming soon!")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center text-[11px] leading-tight">
        By clicking continue, you agree to our <a href="#" className="underline">Terms</a>{" "}
        and <a href="#" className="underline">Privacy</a>.
      </FieldDescription>
    </div>
  )
}
