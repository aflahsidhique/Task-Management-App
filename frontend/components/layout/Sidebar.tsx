'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  FaBell,
  FaCalendarAlt,
  FaChartBar,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaFolder,
  FaFolderOpen,
  FaTasks,
  FaUserShield,
  FaUsers,
} from 'react-icons/fa';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FaChartBar },
  { href: '/projects', label: 'Projects', icon: FaFolderOpen },
  { href: '/tasks', label: 'Tasks', icon: FaTasks },
  { href: '/calendar', label: 'Calendar', icon: FaCalendarAlt },
  { href: '/reports', label: 'Reports', icon: FaChartBar },
  { href: '/users', label: 'Users', icon: FaUsers },
  { href: '/roles', label: 'Roles & Permissions', icon: FaUserShield },
  { href: '/notifications', label: 'Notifications', icon: FaBell },
  { href: '/files', label: 'Files', icon: FaFolder },
  { href: '/settings', label: 'Settings', icon: FaCog },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-sidebar text-gray-300 flex flex-col h-screen sticky top-0 transition-all ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="h-9 w-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold">
          S
        </div>
        {!collapsed && <span className="text-white font-semibold text-lg">SNEC</span>}
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-active text-white'
                  : 'text-gray-400 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Icon className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 px-5 py-4 text-gray-400 hover:text-white text-sm border-t border-white/10"
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
