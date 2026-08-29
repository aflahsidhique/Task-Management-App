'use client';

import { useEffect, useState } from 'react';
import { FaBell, FaChevronDown, FaEnvelope, FaSearch } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import Dropdown from '../ui/Dropdown';
import ThemeToggle from '../ui/ThemeToggle';
import NotificationService from '../../services/notificationService';

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    NotificationService.getUnreadCount()
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0));
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2 bg-surface dark:bg-slate-800 rounded-lg px-3 py-2 w-80">
        <FaSearch className="text-gray-400" />
        <input
          type="text"
          placeholder="Search projects, tasks, users..."
          className="bg-transparent outline-none text-sm w-full dark:text-gray-100 dark:placeholder:text-gray-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer">
          <FaBell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-danger text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="relative text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer">
          <FaEnvelope size={18} />
        </div>

        {user && (
          <Dropdown
            trigger={
              <div className="flex items-center gap-2">
                <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="sm" />
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.fullName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role?.name}
                  </div>
                </div>
                <FaChevronDown className="text-gray-400" size={12} />
              </div>
            }
          >
            <a
              href="/settings"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Settings
            </a>
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-50 dark:hover:bg-slate-800"
            >
              Log out
            </button>
          </Dropdown>
        )}
      </div>
    </header>
  );
};

export default Topbar;
