import { Client, Account, Databases, Storage } from "appwrite";
import { env } from "./env";

export const client = new Client();

client.setEndpoint(env.VITE_APPWRITE_ENDPOINT).setProject(env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query } from "appwrite";
