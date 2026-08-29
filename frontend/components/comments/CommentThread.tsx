'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../services/userService';
import {
  useCreateComment,
  useDeleteComment,
  useTaskComments,
  useUpdateComment,
} from '../../hooks/useComments';
import Avatar from '../ui/Avatar';
import MentionTextarea from './MentionTextarea';

const MANAGE_ROLES = ['Super Admin', 'Admin', 'Project Manager'];

interface CommentThreadProps {
  taskId: number;
  users: User[];
}

export default function CommentThread({ taskId, users }: CommentThreadProps) {
  const { user: currentUser } = useAuth();
  const { data: comments, isLoading } = useTaskComments(taskId);
  const createComment = useCreateComment(taskId);
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  const [content, setContent] = useState('');
  const [mentionedIds, setMentionedIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const canManage = currentUser?.role?.name && MANAGE_ROLES.includes(currentUser.role.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await createComment.mutateAsync({ content, mentionedUserIds: mentionedIds });
    setContent('');
    setMentionedIds([]);
  };

  const startEdit = (id: number, currentContent: string) => {
    setEditingId(id);
    setEditContent(currentContent);
  };

  const saveEdit = async (id: number) => {
    if (!editContent.trim()) return;
    await updateComment.mutateAsync({ id, input: { content: editContent } });
    setEditingId(null);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="mb-6">
        <MentionTextarea
          value={content}
          onChange={setContent}
          users={users}
          mentionedIds={mentionedIds}
          onMentionedIdsChange={setMentionedIds}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!content.trim() || createComment.isPending}
            className="inline-flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <FaPaperPlane size={12} /> Comment
          </button>
        </div>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading comments...</p>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isAuthor = comment.author.id === currentUser?.id;
            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar
                  name={comment.author.fullName}
                  avatarUrl={comment.author.avatarUrl}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {comment.author.fullName}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  {editingId === comment.id ? (
                    <div className="mt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full p-2 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => saveEdit(comment.id)}
                          className="text-xs text-primary hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  )}
                  {(isAuthor || canManage) && editingId !== comment.id && (
                    <div className="flex gap-3 mt-1">
                      {isAuthor && (
                        <button
                          onClick={() => startEdit(comment.id, comment.content)}
                          className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => deleteComment.mutate(comment.id)}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-danger"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No comments yet — be the first to add one.
        </p>
      )}
    </div>
  );
}
