'use client';

import { useRef, useState } from 'react';
import { User } from '../../services/userService';

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  users: User[];
  mentionedIds: number[];
  onMentionedIdsChange: (ids: number[]) => void;
  placeholder?: string;
}

/**
 * A plain textarea with a lightweight @-mention autocomplete: typing "@"
 * followed by characters opens a filtered dropdown of users; picking one
 * inserts "@Name" into the text and adds their id to mentionedIds, which
 * is what the backend actually notifies (mentions are explicit IDs, not
 * server-parsed free text).
 */
export default function MentionTextarea({
  value,
  onChange,
  users,
  mentionedIds,
  onMentionedIdsChange,
  placeholder,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [queryStart, setQueryStart] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursor = e.target.selectionStart ?? text.length;
    onChange(text);

    const uptoCursor = text.slice(0, cursor);
    const match = uptoCursor.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      setQuery(match[1]);
      setQueryStart(cursor - match[1].length - 1);
    } else {
      setQuery(null);
    }
  };

  const filtered =
    query === null
      ? []
      : users.filter((u) => u.fullName.toLowerCase().includes(query.toLowerCase())).slice(0, 5);

  const selectUser = (user: User) => {
    if (query === null) return;
    const before = value.slice(0, queryStart);
    const after = value.slice(queryStart + 1 + query.length);
    const inserted = `@${user.fullName.replace(/\s+/g, '')} `;
    onChange(`${before}${inserted}${after}`);
    if (!mentionedIds.includes(user.id)) {
      onMentionedIdsChange([...mentionedIds, user.id]);
    }
    setQuery(null);
    requestAnimationFrame(() => {
      const pos = before.length + inserted.length;
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder ?? 'Write a comment... use @ to mention someone'}
        rows={3}
        className="w-full p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      />
      {query !== null && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-64 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-card overflow-hidden">
          {filtered.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => selectUser(u)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
            >
              {u.fullName}
            </button>
          ))}
        </div>
      )}
      {mentionedIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {mentionedIds.map((id) => {
            const user = users.find((u) => u.id === id);
            if (!user) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 bg-primary-50 dark:bg-slate-700 text-primary-700 dark:text-primary-300 text-xs px-2 py-1 rounded-full"
              >
                @{user.fullName}
                <button
                  type="button"
                  onClick={() => onMentionedIdsChange(mentionedIds.filter((i) => i !== id))}
                  className="hover:text-danger"
                  aria-label={`Remove mention of ${user.fullName}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
