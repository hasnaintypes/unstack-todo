import { account } from "@/config/appwrite";

export const profileService = {
  async updateName(name: string) {
    return account.updateName(name);
  },

  async updateEmail(email: string, password: string) {
    return account.updateEmail(email, password);
  },

  async updatePassword(newPassword: string, oldPassword: string) {
    return account.updatePassword(newPassword, oldPassword);
  },
};
