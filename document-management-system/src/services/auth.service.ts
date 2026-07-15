import { MOCK_CURRENT_USER } from "@/lib/mock-data";
import type { User } from "@/types";

export const authService = {
  async getCurrentUser(): Promise<User> {
    return Promise.resolve(MOCK_CURRENT_USER);
  },

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    return Promise.resolve({
      user: MOCK_CURRENT_USER,
      token: "mock-jwt-token",
    });
  },
};
