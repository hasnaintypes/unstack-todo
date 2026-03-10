import { Client, Account, Databases, Storage } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint) {
  throw new Error(
    "Missing VITE_APPWRITE_ENDPOINT environment variable. " +
      "Please check your .env file and ensure it contains a valid Appwrite endpoint URL."
  );
}

if (!projectId) {
  throw new Error(
    "Missing VITE_APPWRITE_PROJECT_ID environment variable. " +
      "Please check your .env file and ensure it contains a valid Appwrite project ID."
  );
}

export const client = new Client();

client.setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query } from "appwrite";
