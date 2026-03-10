import type { Models } from "appwrite";

export interface User extends Models.User<Models.Preferences> {
  email: string;
  name: string;
}

export interface AuthFormData {
  email: string;
  password: string;
  name?: string;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  name: string;
}

export interface AuthError extends Error {
  code?: string;
  message: string;
}
