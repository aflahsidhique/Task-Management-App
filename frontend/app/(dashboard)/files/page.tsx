'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { FaDownload, FaTrashAlt, FaUpload } from 'react-icons/fa';
import FileService, { FileAsset } from '../../../services/fileService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import { Table, Tbody, Td, Th, Thead, Tr } from '../../../components/ui/Table';
import LoadingDots from '../../../components/ui/LoadingDots';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    FileService.getFiles()
      .then(setFiles)
      .catch((err) => console.error('Failed to load files:', err))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await FileService.upload(file);
      setFiles((prev) => [uploaded, ...prev]);
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    await FileService.remove(id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div>
      <PageHeader
        title="Files"
        right={
          <label className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700 cursor-pointer">
            <FaUpload /> {uploading ? 'Uploading...' : 'Upload File'}
            <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        }
      />
      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingDots />
          </div>
        ) : files.length === 0 ? (
          <p className="text-sm text-gray-400">No files uploaded yet.</p>
        ) : (
          <Table>
            <Thead>
              <Th>Name</Th>
              <Th>Size</Th>
              <Th>Uploaded By</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </Thead>
            <Tbody>
              {files.map((f) => (
                <Tr key={f.id}>
                  <Td className="font-medium text-gray-900">{f.originalName}</Td>
                  <Td>{formatSize(f.sizeBytes)}</Td>
                  <Td>{f.uploadedBy?.fullName ?? '—'}</Td>
                  <Td>{new Date(f.createdAt).toLocaleDateString()}</Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <a
                        href={FileService.downloadUrl(f.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary"
                      >
                        <FaDownload size={12} />
                      </a>
                      <button onClick={() => handleDelete(f.id)} className="text-danger">
                        <FaTrashAlt size={12} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
