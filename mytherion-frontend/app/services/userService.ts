import { User } from "../types/auth";
import { parseErrorMessage } from "../utils/errorMessages";
import { API_URL } from "./apiConfig";
import apiRoutes from "../config/apiRoutes";

export interface UserUpdateData {
  username?: string;
  role?: string;
}

async function handleResponseError(response: Response, fallback: string): Promise<never> {
  let errorPayload: unknown;
  try {
    errorPayload = await response.json();
  } catch {
    try {
      errorPayload = await response.text();
    } catch {
      errorPayload = fallback;
    }
  }
  throw new Error(parseErrorMessage(errorPayload || fallback));
}

class UserService {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}${apiRoutes.users.list}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      await handleResponseError(response, "Failed to fetch users");
    }

    return response.json();
  }

  /**
   * Update user details (Admin or Owner)
   */
  async updateUser(userId: string, data: UserUpdateData): Promise<User> {
    const response = await fetch(`${API_URL}${apiRoutes.users.detail(userId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      await handleResponseError(response, "Failed to update user");
    }

    return response.json();
  }

  /**
   * Delete user (Admin or Owner)
   */
  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_URL}${apiRoutes.users.detail(userId)}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      await handleResponseError(response, "Failed to delete user");
    }
  }
}

export const userService = new UserService();
