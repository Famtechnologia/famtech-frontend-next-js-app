// components/layout/DashboardLayout.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfileStore } from '@/lib/store/farmStore';
import {
  LayoutDashboard,
  Tractor,
  Brain,
  Map,
  CreditCard,
  ShoppingCart,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  User,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLogout } from '@/lib/api/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);
  const { user, claims, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { handleLogout } = useLogout();
  // Define the expected profile type
  interface ProfileOwner {
    firstName?: string;
    // add other fields as needed
  }
  interface Profile {
    owner?: ProfileOwner;
    // add other fields as needed
  }
  
  const { profile, loading,  } = useProfileStore() as { profile?: Profile; loading: boolean; error: unknown };

  const toggleMenu = (menuName: string) => {
    // Don't expand/collapse menus when sidebar is collapsed
    if (sidebarCollapsed) return;
    
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    );
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
    // Close all expanded menus when collapsing
    if (!sidebarCollapsed) {
      setExpandedMenus([]);
    }
  };

  const getNavItems = () => {
    const role = claims?.role || '';
    const subRole = claims?.subRole || '';

    if (role === 'farmer') {
      return [
        { 
          name: 'Dashboard', 
          href: `/farm/${subRole}`, 
          icon: LayoutDashboard,
          key: 'dashboard',
          expandable: false
        },
        { 
          name: 'Farm Operations', 
          icon: Tractor,
          key: 'farm-operations',
          expandable: true,
          children: [
            { name: 'Field Management', href: `/dashboard/farmer/${subRole}/fields` },
            { name: 'Crop Planning', href: `/dashboard/farmer/${subRole}/crops` },
            { name: 'Equipment', href: `/dashboard/farmer/${subRole}/equipment` },
            { name: 'Livestock', href: `/dashboard/farmer/${subRole}/livestock` },
          ]
        },
        { 
          name: 'AI Insights', 
          icon: Brain,
          key: 'ai-insights',
          expandable: false,
          href: `/dashboard/farmer/${subRole}/ai-insights`,
          premium: true
        },
        { 
          name: 'Mapping & Geo Tools', 
          icon: Map,
          key: 'mapping',
          expandable: false,
          href: `/dashboard/farmer/${subRole}/mapping`,
          premium: true
        },
        { 
          name: 'Financials - SmartNet', 
          icon: CreditCard,
          key: 'financials',
          expandable: true,
          children: [
            { name: 'Overview', href: `/dashboard/farmer/${subRole}/finances` },
            { name: 'Income', href: `/dashboard/farmer/${subRole}/finances/income` },
            { name: 'Expenses', href: `/dashboard/farmer/${subRole}/finances/expenses` },
            { name: 'Reports', href: `/dashboard/farmer/${subRole}/finances/reports` },
          ]
        },
        { 
          name: 'Marketplace - Famora', 
          icon: ShoppingCart,
          key: 'marketplace',
          expandable: true,
          children: [
            { name: 'Buy', href: `/dashboard/farmer/${subRole}/marketplace/buy` },
            { name: 'Sell', href: `/dashboard/farmer/${subRole}/marketplace/sell` },
            { name: 'My Orders', href: `/dashboard/farmer/${subRole}/marketplace/orders` },
          ]
        },
        { 
          name: 'Reports', 
          icon: FileText,
          key: 'reports',
          expandable: true,
          children: [
            { name: 'Production', href: `/dashboard/farmer/${subRole}/reports/production` },
            { name: 'Financial', href: `/dashboard/farmer/${subRole}/reports/financial` },
            { name: 'Analytics', href: `/dashboard/farmer/${subRole}/reports/analytics` },
          ]
        },
        { 
          name: 'Settings', 
          icon: Settings,
          key: 'settings',
          expandable: true,
          children: [
            { name: 'Profile', href: `/dashboard/farmer/${subRole}/settings/profile` },
            { name: 'Farm Settings', href: `/dashboard/farmer/${subRole}/settings/farm` },
            { name: 'Notifications', href: `/dashboard/farmer/${subRole}/settings/notifications` },
          ]
        },
        { 
          name: 'Help & Support', 
          icon: HelpCircle,
          key: 'help',
          expandable: true,
          children: [
            { name: 'Documentation', href: `/dashboard/farmer/${subRole}/help/docs` },
            { name: 'Contact Support', href: `/dashboard/farmer/${subRole}/help/contact` },
            { name: 'Training', href: `/dashboard/farmer/${subRole}/help/training` },
          ]
        },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const isActive = (href?: string) => {
    if (!href) return false;
    
    // Special case: if href is /farm/{subRole} and pathname is /farm, consider it active
    if (href.startsWith('/farm/') && pathname === '/farm') {
      return true;
    }
    
    return pathname === href;
  };

  const isParentActive = (children?: Array<{href: string}>) => {
    if (!children) return false;
    return children.some(child => pathname === child.href);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      } bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center w-full' : 'space-x-2'}`}>
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900">FAMTECH</h1>
            )}
          </div>
          
          {/* Mobile close button */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="space-y-2">
            {/* Collapse Toggle - only show on desktop/tablet */}
            <div className="hidden md:block">
              <button 
                onClick={toggleSidebarCollapse}
                className={`w-full flex items-center justify-end px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer`}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                  {sidebarCollapsed ? (
                    <PanelLeftOpen size={18} />
                  ) : (
                    <>
                      <PanelLeftClose size={18} className="mr-3" />
        
                    </>
                  )}
                </div>
              </button>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedMenus.includes(item.key);
              const itemIsActive = isActive(item.href) || isParentActive(item.children);

              return (
                <div key={item.key}>
                  {item.expandable ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.key)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                          itemIsActive
                            ? 'bg-green-50 text-green-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        } ${sidebarCollapsed ? 'justify-center' : ''}`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : ''}`}>
                          <Icon size={18} className={sidebarCollapsed ? '' : 'mr-3'} />
                          {!sidebarCollapsed && (
                            <>
                              <span>{item.name}</span>
                              {item.premium && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                  Premium
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {!sidebarCollapsed && (
                          isExpanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          )
                        )}
                      </button>
                      
                      {/* Submenu - only show when not collapsed */}
                      {!sidebarCollapsed && item.expandable && isExpanded && item.children && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive(child.href)
                                  ? 'bg-green-50 text-green-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              {child.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        itemIsActive
                          ? 'bg-green-50 text-green-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      } ${sidebarCollapsed ? 'justify-center' : ''}`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <Icon size={18} className={sidebarCollapsed ? '' : 'mr-3'} />
                      {!sidebarCollapsed && (
                        <>
                          <span>{item.name}</span>
                          {item.premium && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Premium
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* User Profile & Sign Out */}
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} mb-3`}>
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 capitalize">
                  {profile?.owner?.firstName} 
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ${
              sidebarCollapsed ? 'justify-center' : ''
            }`}
            title={sidebarCollapsed ? 'Sign out' : undefined}
          >
            <LogOut size={16} className={sidebarCollapsed ? '' : 'mr-3'} />
            {!sidebarCollapsed && 'Sign out'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
                <Menu size={24} />
              </button>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Famtech..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-64"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">{profile?.owner?.firstName}</span>
                <ChevronDown size={16} className="text-gray-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}