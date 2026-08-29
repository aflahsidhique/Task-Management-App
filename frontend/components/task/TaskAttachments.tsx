'use client';

import { ChangeEvent, useRef } from 'react';
import { FaDownload, FaTrashAlt, FaUpload } from 'react-icons/fa';
import FileService from '../../services/fileService';
import { useDeleteFile, useFilesQuery, useUploadFile } from '../../hooks/useFiles';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function TaskAttachments({ taskId }: { taskId: number }) {
  const params = { taskId };
  const { data: files, isLoading } = useFilesQuery(params);
  const upload = useUploadFile(params);
  const remove = useDeleteFile(params);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await upload.mutateAsync(file);
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-3">
        <label className="inline-flex items-center gap-2 bg-primary text-white text-sm px-3 py-1.5 rounded-lg hover:bg-primary-700 cursor-pointer">
          <FaUpload size={12} /> {upload.isPending ? 'Uploading...' : 'Upload'}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={upload.isPending}
          />
        </label>
      </div>
      {upload.isError && (
        <p className="text-xs text-danger mb-2">
          {(upload.error as Error)?.message || 'Upload failed.'}
        </p>
      )}
      {isLoading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading attachments...</p>
      ) : files && files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between text-sm border border-gray-100 dark:border-slate-700 rounded-lg px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-gray-900 dark:text-gray-100 truncate">{f.originalName}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatSize(f.sizeBytes)} · {f.uploadedBy?.fullName ?? 'Unknown'}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-3">
                <a
                  href={FileService.downloadUrl(f.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  <FaDownload size={12} />
                </a>
                <button onClick={() => remove.mutate(f.id)} className="text-danger">
                  <FaTrashAlt size={12} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">No attachments yet.</p>
      )}
    </div>
  );
}
