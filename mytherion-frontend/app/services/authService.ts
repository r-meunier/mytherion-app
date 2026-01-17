import { User, RegisterRequest, LoginRequest } from "../types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: send cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Registration failed");
    }

    return response.json();
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important: send cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Login failed");
    }

    return response.json();
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include", // Important: send cookies
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }
  }

  /**
   * Get current user info (for session validation)
   */
  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      credentials: "include", // Important: send cookies
    });

    if (!response.ok) {
      throw new Error("Not authenticated");
    }

    return response.json();
  }
}

export const authService = new AuthService();
