import type { Models } from "appwrite";

export type DatabaseQuery = string;

export interface DocumentPayload {
  [key: string]: unknown;
}

export interface DocumentResponse<T = unknown> extends Models.Document {
  data: T;
}

export interface ListDocumentsOptions {
  queries?: DatabaseQuery[];
}

export interface CreateDocumentOptions {
  data: DocumentPayload;
}

export interface UpdateDocumentOptions {
  data: DocumentPayload;
}
