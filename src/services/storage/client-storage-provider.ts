import { SaveFileParams, SaveFileResult, StorageProvider } from "./types";

export class ClientStorageProvider implements StorageProvider {
  async saveFile(params: SaveFileParams): Promise<SaveFileResult> {
    const response = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveFile", params }),
    });
    if (!response.ok) throw new Error("Failed to save file");
    return response.json();
  }

  getFileUrl(path: string): string {
    return `/api/files?action=getFileUrl&path=${encodeURIComponent(path)}`;
  }

  async getFile(path: string): Promise<Buffer> {
    const response = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getFile", params: { path } }),
    });
    if (!response.ok) throw new Error("Failed to get file");
    return Buffer.from(await response.arrayBuffer());
  }

  async deleteFile(path: string): Promise<void> {
    const response = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "deleteFile", params: { path } }),
    });
    if (!response.ok) throw new Error("Failed to delete file");
  }
}
