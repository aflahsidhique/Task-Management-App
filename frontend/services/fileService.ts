import apiClient, { unwrap, API_BASE_URL } from '../lib/apiClient';
import { User } from './userService';

export interface FileAsset {
  id: number;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy: User | null;
  project: { id: number; name: string } | null;
  task: { id: number; title: string } | null;
  createdAt: string;
}

class FileService {
  static async getFiles(params?: { projectId?: number; taskId?: number }): Promise<FileAsset[]> {
    return unwrap(apiClient.get('/files', { params }));
  }

  static async upload(file: File, projectId?: number, taskId?: number): Promise<FileAsset> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('projectId', String(projectId));
    if (taskId) formData.append('taskId', String(taskId));
    return unwrap(
      apiClient.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  }

  static downloadUrl(id: number): string {
    return `${API_BASE_URL}/files/${id}/download`;
  }

  static async remove(id: number): Promise<void> {
    return unwrap(apiClient.delete(`/files/${id}`));
  }
}

export default FileService;
