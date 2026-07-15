import { MOCK_DOCUMENTS } from "@/lib/mock-data";
import type { Document } from "@/types";

export const documentsService = {
  async getDocuments(): Promise<Document[]> {
    // Stub: returns mock documents, ready to swap with fetcher("/documents")
    return Promise.resolve(MOCK_DOCUMENTS.filter((d) => !d.is_deleted));
  },

  async getDocumentById(id: string): Promise<Document | undefined> {
    return Promise.resolve(MOCK_DOCUMENTS.find((d) => d.id === id));
  },

  async softDeleteDocument(id: string): Promise<boolean> {
    const doc = MOCK_DOCUMENTS.find((d) => d.id === id);
    if (doc) doc.is_deleted = true;
    return Promise.resolve(true);
  },
};
