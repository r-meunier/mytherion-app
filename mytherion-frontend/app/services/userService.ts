import { User } from "../types/auth";
import { parseErrorMessage } from "../utils/errorMessages";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface UserUpdateData {
  username?: string;
  role?: string;
}

class UserService {
  /**
   * Get all users (Admin only)
   */
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/api/user`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(parseErrorMessage(error || "Failed to fetch users"));
    }

    return response.json();
  }

  /**
   * Update user details (Admin or Owner)
   */
  async updateUser(userId: number, data: UserUpdateData): Promise<User> {
    const response = await fetch(`${API_URL}/api/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(parseErrorMessage(error || "Failed to update user"));
    }

    return response.json();
  }

  /**
   * Delete user (Admin or Owner)
   */
  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_URL}/api/user/${userId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(parseErrorMessage(error || "Failed to delete user"));
    }
  }
}

export const userService = new UserService();
