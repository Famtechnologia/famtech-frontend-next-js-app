'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
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
    PanelLeftOpen,
    LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLogout } from '@/lib/api/auth';
import Modal from '@/components/ui/Modal'; // adjust to your modal path

// --- Interface Definitions for clarity ---

interface NavChild {
    name: string;
    href: string;
}

interface NavItem {
    name: string;
    icon: LucideIcon;
    key: string;
    expandable: boolean;
    href?: string;
    children?: NavChild[];
    premium?: boolean;
    comingSoon?: boolean;
}

interface ProfileOwner {
    firstName?: string;
}
interface Profile {
    owner?: ProfileOwner;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}
// --- End Interface Definitions ---


export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);
    const [showComingSoon, setShowComingSoon] = useState(false);
    
    // NEW STATE for collapsed sidebar flyout preview
    const [hoveredMenuKey, setHoveredMenuKey] = useState<string | null>(null);
    const flyoutRef = useRef<HTMLDivElement>(null);

    const { claims } = useAuth();
    const pathname = usePathname();
    const { handleLogout } = useLogout();

    const { profile } = useProfileStore() as {
        profile?: Profile;
        loading: boolean;
        error: unknown;
    };

    // Close flyout when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                flyoutRef.current && 
                !flyoutRef.current.contains(event.target as Node) &&
                sidebarCollapsed
            ) {
                setHoveredMenuKey(null);
            }
        };

        if (sidebarCollapsed) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sidebarCollapsed]);

    const toggleMenu = (menuName: string) => {
        if (sidebarCollapsed) {
            // If collapsed, clicking the menu should show the flyout preview
            setHoveredMenuKey(menuName === hoveredMenuKey ? null : menuName);
            return;
        }
        
        // If expanded, toggle the dropdown
        setExpandedMenus((prev) =>
            prev.includes(menuName)
                ? prev.filter((name) => name !== menuName)
                : [...prev, menuName]
        );
    };

    const toggleSidebarCollapse = () => {
        setSidebarCollapsed(!sidebarCollapsed);
        if (!sidebarCollapsed) {
            setExpandedMenus([]); // Collapse all menus when collapsing sidebar
            setHoveredMenuKey(null); // Clear any active flyout
        }
    };

    const getNavItems = (): NavItem[] => {
        const role = claims?.role || '';
        const subRole = claims?.subRole || '';

        if (role === 'farmer') {
            return [
                {
                    name: 'Dashboard',
                    href: `/`,
                    icon: LayoutDashboard,
                    key: 'dashboard',
                    expandable: false,
                },
                {
    name: 'Farm Operations',
    icon: Tractor,
    key: 'farm-operations',
    expandable: true,
    children: [
        // Use query parameters to designate the active tab view
        { name: 'Task Planner', href: `/farm-operation?tab=planner` }, // Simplified for the root page
        { name: 'Crop and Livestock Records', href: `/farm-operation?tab=records` },
        { name: 'Calendar View', href: `/farm-operation?tab=calendar` },
        { name: 'Inventory Management', href: `/farm-operation?tab=inventory` },
        // ... any others ...
    ],
},
                {
                    name: 'AI Insights',
                    icon: Brain,
                    key: 'ai-insights',
                    expandable: false,
                    href: `/dashboard/farmer/${subRole}/ai-insights`,
                    premium: true,
                },
                {
                    name: 'Mapping & Geo Tools',
                    icon: Map,
                    key: 'mapping',
                    expandable: false,
                    href: `/dashboard/farmer/${subRole}/mapping`,
                    premium: true,
                },
                {
                    name: 'Financials - SmartNet',
                    icon: CreditCard,
                    key: 'financials',
                    expandable: true,
                    comingSoon: true,
                    children: [
                        { name: 'Overview', href: '#' },
                        { name: 'Income', href: '#' },
                        { name: 'Expenses', href: '#' },
                        { name: 'Reports', href: '#' },
                    ],
                },
                {
                    name: 'Marketplace - Famora',
                    icon: ShoppingCart,
                    key: 'marketplace',
                    expandable: true,
                    comingSoon: true,
                    children: [
                        { name: 'Buy', href: '#' },
                        { name: 'Sell', href: '#' },
                        { name: 'My Orders', href: '#' },

                    ],
                },
                // UPDATED ITEM: Equipment Sync
                {
                    name: 'Equipment Sync',
                    icon: Settings,
                    key: 'equipment-sync',
                    expandable: false,
                    href: `/equipment-sync`,
                    comingSoon: false,
                },
                {
                    name: 'Reports',
                    icon: FileText,
                    key: 'reports',
                    expandable: true,
                    comingSoon: true,
                    children: [
                        { name: 'Production', href: '#' },
                        { name: 'Financial', href: '#' },
                        { name: 'Analytics', href: '#' },
                    ],
                },
                {
                    name: 'Settings',
                    icon: Settings,
                    key: 'settings',
                    expandable: true,
                    children: [
                        { name: 'Profile', href: `/settings/profile` },
                        { name: 'Farm Settings', href: `/settings/farm-setting` },
                        {
                            name: 'Notifications',
                            href: `/dashboard/farmer/${subRole}/settings/notifications`,
                        },
                    ],
                },
                {
                    name: 'Help & Support',
                    icon: HelpCircle,
                    key: 'help',
                    expandable: true,
                    children: [
                        { name: 'Documentation', href: `/dashboard/farmer/${subRole}/help/docs` },
                        { name: 'Contact Support', href: `/help/contact-support` },
                        { name: 'Training', href: `/dashboard/farmer/${subRole}/help/training` },
                        { name: 'FAQ', href: `/help/faq` },
                    ],
                },
            ];
        }

        return [];
    };

    const navItems = getNavItems();

    const isActive = (href?: string) => {
        if (!href) return false;
        // Special handling for dashboard link: /farm/{subRole}
        if (href.startsWith('/farm/') && pathname === href) {
            return true;
        }
        // Check if the current pathname is an exact match or a substring match for the dashboard root
        if (href.startsWith('/farm/') && pathname.startsWith('/farm/')) {
            const rootPath = href.split('/').slice(0, 3).join('/'); // /farm/{subRole}
            if (pathname === rootPath) return true;
        }
        return pathname === href;
    };

    const isParentActive = (children?: Array<{ href: string }>) => {
        if (!children) return false;
        return children.some((child) => pathname === child.href);
    };

    const activeParentItem = navItems.find(item => item.key === hoveredMenuKey);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Main Element - Z-index: 50 is fine) */}
            <div
                className={`${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } fixed inset-y-0 left-0 z-50 ${ // z-50 is the max index for the main sidebar
                    sidebarCollapsed ? 'w-16' : 'w-64'
                } bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200 overflow-y-scroll scrollbar-hide`}
                onMouseLeave={sidebarCollapsed ? () => setHoveredMenuKey(null) : undefined}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                    <div
                        className={`flex items-center ${
                            sidebarCollapsed ? 'justify-center w-full' : 'space-x-2'
                        }`}
                    >
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">F</span>
                        </div>
                        {!sidebarCollapsed && (
                            <h1 className="text-xl font-bold text-gray-900">FAMTECH</h1>
                        )}
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden">
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 ">
                    <div className="space-y-2">
                        {/* Collapse Button */}
                        <div className="hidden md:block">
                            <button
                                onClick={toggleSidebarCollapse}
                                className={`w-full flex items-center justify-end px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer`}
                                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                <div
                                    className={`flex items-center ${
                                        sidebarCollapsed ? 'justify-center' : ''
                                    }`}
                                >
                                    {sidebarCollapsed ? (
                                        <PanelLeftOpen size={18} />
                                    ) : (
                                        <PanelLeftClose size={18} className="mr-3" />
                                    )}
                                </div>
                            </button>
                        </div>

                        {/* Nav Items */}
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isExpanded = expandedMenus.includes(item.key);
                            const itemIsActive =
                                isActive(item.href) || isParentActive(item.children);

                            const badge = item.comingSoon ? (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Soon
                                </span>
                            ) : item.premium ? (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Premium
                                </span>
                            ) : null;

                            return (
                                <div key={item.key}>
                                    {item.expandable ? (
                                        <div 
                                            // Handle mouse events for flyout when collapsed
                                            onMouseEnter={sidebarCollapsed ? () => setHoveredMenuKey(item.key) : undefined}
                                            onClick={sidebarCollapsed ? () => toggleMenu(item.key) : undefined}
                                        >
                                            <button
                                                onClick={
                                                    !sidebarCollapsed
                                                        ? item.comingSoon
                                                            ? () => setShowComingSoon(true)
                                                            : () => toggleMenu(item.key)
                                                        : item.comingSoon
                                                            ? () => setShowComingSoon(true)
                                                            : undefined // Clicks on collapsed icon now managed by outer div
                                                }
                                                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                                                    itemIsActive
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                                title={sidebarCollapsed ? item.name : undefined}
                                            >
                                                <div
                                                    className={`flex items-center ${
                                                        sidebarCollapsed ? 'justify-center' : ''
                                                    }`}
                                                >
                                                    <Icon
                                                        size={18}
                                                        className={sidebarCollapsed ? '' : 'mr-3'}
                                                    />
                                                    {!sidebarCollapsed && (
                                                        <>
                                                            <span>{item.name}</span>
                                                            {badge}
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

                                            {/* Normal expanded children (when sidebar is NOT collapsed) */}
                                            {!sidebarCollapsed &&
                                                item.expandable &&
                                                isExpanded &&
                                                item.children && (
                                                    <div className="ml-6 mt-1 space-y-1">
                                                        {item.children.map((child) => (
                                                            <Link
                                                                key={child.href}
                                                                href={item.comingSoon || child.href === '#' ? '#' : child.href}
                                                                onClick={(e) => {
                                                                    if (item.comingSoon || child.href === '#') {
                                                                        e.preventDefault();
                                                                        setShowComingSoon(true);
                                                                    } else {
                                                                        setSidebarOpen(false); // Close mobile sidebar on navigation
                                                                    }
                                                                }}
                                                                className={`block px-3 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${
                                                                    child.href === pathname ? 'font-semibold' : ''
                                                                }`}
                                                            >
                                                                <span className="flex items-center gap-2">
                                                                    {child.name}
                                                                    {(item.comingSoon || child.href === '#') && (
                                                                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                                                            Soon
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.comingSoon ? '#' : item.href || '#'}
                                            onClick={(e) => {
                                                if (item.comingSoon || item.href === '#') {
                                                    e.preventDefault();
                                                    setShowComingSoon(true);
                                                } else {
                                                    setSidebarOpen(false); // Close mobile sidebar on navigation
                                                }
                                            }}
                                            className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                                                itemIsActive
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            } ${sidebarCollapsed ? 'justify-center' : ''}`}
                                            title={sidebarCollapsed ? item.name : undefined}
                                        >
                                            <Icon
                                                size={18}
                                                className={sidebarCollapsed ? '' : 'mr-3'}
                                            />
                                            {!sidebarCollapsed && (
                                                <>
                                                    <span>{item.name}</span>
                                                    {badge}
                                                </>
                                            )}
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Bottom Profile/Logout */}
                    <div className="border-t border-gray-200 p-4">
                        <div
                            className={`flex items-center ${
                                sidebarCollapsed ? 'justify-center' : 'space-x-3'
                            } mb-3`}
                        >
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
                            className={`flex items-center w-ful px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ${
                                sidebarCollapsed ? 'justify-center' : ''
                            }`}
                            title={sidebarCollapsed ? 'Sign out' : undefined}
                        >
                            <LogOut size={16} className={sidebarCollapsed ? '' : 'mr-2'} />
                            {!sidebarCollapsed && 'Sign out'}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Collapsed Sidebar Flyout Preview (Higher Z-index: 60) */}
            {sidebarCollapsed && activeParentItem && (
                <div
                    ref={flyoutRef}
                    className="fixed left-16 top-0 h-full overflow-y-auto bg-white shadow-xl z-60 border-l border-gray-200 transition-opacity duration-150 ease-in-out"
                    style={{ 
                        // Use a fixed width for the flyout preview
                        width: '200px', 
                        // Match the vertical position of the clicked item (approximate, more complex calc needed for exact position)
                        // For simplicity, we just fix it to the top.
                        paddingTop: '64px', // Space for the top header
                        paddingBottom: '64px', // Space for the bottom area
                    }}
                >
                    <div className="p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-2">
                            {activeParentItem.name}
                        </h3>
                        {activeParentItem.children?.map((child) => (
                            <Link
                                key={child.href}
                                href={activeParentItem.comingSoon || child.href === '#' ? '#' : child.href}
                                onClick={(e) => {
                                    if (activeParentItem.comingSoon || child.href === '#') {
                                        e.preventDefault();
                                        setShowComingSoon(true);
                                    } else {
                                        setHoveredMenuKey(null); // Close flyout on navigation
                                        // Optional: Close mobile sidebar if applicable, but usually flyout is only for desktop collapsed
                                    }
                                }}
                                className={`block px-3 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${
                                    child.href === pathname ? 'font-semibold bg-gray-50' : ''
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {child.name}
                                    {(activeParentItem.comingSoon || child.href === '#') && (
                                        <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                            Soon
                                        </span>
                                    )}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-6">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden mr-4"
                            >
                                <Menu size={24} />
                            </button>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search Famtech..."
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-34 md:w-64"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-4">
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                    <User size={16} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 hidden md:inline">
                                    {profile?.owner?.firstName}
                                </span>
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
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Coming soon modal */}
            <Modal
                show={showComingSoon}
                onClose={() => setShowComingSoon(false)}
                title="Feature Coming Soon"
            >
                <p className="text-center text-gray-600 text-base">
                    We’re working hard to bring this feature to you soon 🚀
                </p>
            </Modal>
        </div>
    );
} 