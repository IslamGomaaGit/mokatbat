import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Inbox,
  Send,
  FilePlus,
  CheckSquare,
  Building2,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileSearch,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'nav.dashboard', permission: null },
  { path: '/incoming', icon: Inbox, label: 'nav.incoming', permission: 'correspondence:read' },
  { path: '/outgoing', icon: Send, label: 'nav.outgoing', permission: 'correspondence:read' },
  { path: '/create', icon: FilePlus, label: 'nav.create', permission: 'correspondence:create' },
  { path: '/reviews', icon: CheckSquare, label: 'nav.reviews', permission: 'correspondence:review' },
  { path: '/entities', icon: Building2, label: 'nav.entities', permission: 'entity:read' },
  { path: '/users', icon: Users, label: 'nav.users', permission: 'user:read' },
  { path: '/reports', icon: BarChart3, label: 'nav.reports', permission: 'report:read' },
  { path: '/audit-logs', icon: FileSearch, label: 'nav.auditLogs', permission: 'audit:read' },
  { path: '/settings', icon: Settings, label: 'nav.settings', permission: null },
];

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user } = useAuthStore();
  const { hasPermission } = usePermissions();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const filteredItems = menuItems.filter((item) => hasPermission(item.permission));

  const ChevronIcon = i18n.language === 'ar' ? ChevronRight : ChevronLeft;
  const ChevronIconCollapsed = i18n.language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <aside
      className={cn(
        'border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!collapsed && <span className="font-semibold">{t('app.name')}</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto"
          >
            {collapsed ? (
              <ChevronIconCollapsed className="h-5 w-5" />
            ) : (
              <ChevronIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start gap-3',
                    collapsed && 'justify-center px-2'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span>{t(item.label)}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

