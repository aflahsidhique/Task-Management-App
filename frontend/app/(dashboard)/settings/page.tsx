'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '../../../context/AuthContext';
import UserService from '../../../services/userService';
import AuthService from '../../../services/authService';
import PageHeader from '../../../components/layout/PageHeader';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

const THEME_OPTIONS: { value: string; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setJobTitle(user.jobTitle ?? '');
    }
  }, [user]);

  useEffect(() => setMounted(true), []);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    try {
      await UserService.updateUser(user.id, { fullName, jobTitle });
      setProfileMessage('Profile updated successfully.');
    } catch (err) {
      setProfileMessage('Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await AuthService.changePassword(currentPassword, newPassword);
      setPasswordMessage('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordMessage('Failed to change password.');
    }
  };

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card title="Profile">
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {profileMessage && <p className="text-sm text-gray-500">{profileMessage}</p>}
            <Button type="submit" text="Save Profile" />
          </form>
        </Card>
        <Card title="Change Password">
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="w-full p-3 border border-gray-200 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {passwordMessage && <p className="text-sm text-gray-500">{passwordMessage}</p>}
            <Button type="submit" text="Change Password" />
          </form>
        </Card>
        <Card title="Appearance">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Choose how SNEC looks on this device.
          </p>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  mounted && theme === option.value
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
