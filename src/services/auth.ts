import { account, ID } from "@/lib/appwrite";

export const authService = {
  async getCurrentUser() {
    try {
      return await account.get();
    } catch {
      return null;
    }
  },

  async signUp(email: string, password: string, name?: string) {
    return await account.create(ID.unique(), email, password, name);
  },

  async signIn(email: string, password: string) {
    return await account.createEmailPasswordSession(email, password);
  },

  async logout() {
    return await account.deleteSession("current");
  },
};
