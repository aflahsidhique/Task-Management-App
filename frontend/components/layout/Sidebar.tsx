'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '../../store/uiStore';
import { useAuth } from '../../context/AuthContext';
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

const navItems: {
  href: string;
  label: string;
  icon: typeof FaChartBar;
  requiredPermission?: string;
}[] = [
  { href: '/dashboard', label: 'Dashboard', icon: FaChartBar },
  { href: '/projects', label: 'Projects', icon: FaFolderOpen },
  { href: '/tasks', label: 'Tasks', icon: FaTasks },
  { href: '/calendar', label: 'Calendar', icon: FaCalendarAlt },
  { href: '/reports', label: 'Reports', icon: FaChartBar, requiredPermission: 'view_reports' },
  { href: '/users', label: 'Users', icon: FaUsers, requiredPermission: 'manage_users' },
  {
    href: '/roles',
    label: 'Roles & Permissions',
    icon: FaUserShield,
    requiredPermission: 'manage_roles',
  },
  { href: '/notifications', label: 'Notifications', icon: FaBell },
  { href: '/files', label: 'Files', icon: FaFolder },
  { href: '/settings', label: 'Settings', icon: FaCog },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const { hasPermission } = useAuth();

  // Dynamic menu: an item only appears when the current user's role
  // (admin-configurable via Role.permissions) grants the permission it
  // requires — items with no requiredPermission are open to everyone.
  const visibleNavItems = navItems.filter(
    (item) => !item.requiredPermission || hasPermission(item.requiredPermission),
  );

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

      <nav className="flex-1 px-3 space-y-1 items-start overflow-y-auto">
        {visibleNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
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
        onClick={toggleSidebar}
        className="flex items-center gap-2 px-5 py-4 text-gray-400 hover:text-white text-sm border-t border-white/10"
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
};

export default Sidebar;
