"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Tractor,
  Settings,
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
  Clock,
  CheckCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAssignee } from "@/lib/hooks/Assignee";
import Modal from "@/components/ui/Modal"; // adjust to your modal path
import { getNotification } from "@/lib/services/staff";
import { Notification } from "@/lib/services/taskplanner";
// --- Interface Definitions for clarity ---

interface NavChild {
  name: string;
  href: string;
  comingSoon?: boolean;
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

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AssigneeLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredMenuKey, setHoveredMenuKey] = useState<string | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAssignee();
  const pathname = usePathname();
  const router = useRouter();

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
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
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
    return [
      {
        name: "Tasks",
        icon: Tractor,
        key: "tasks",
        expandable: false,
        href: `/staffs/tasks`,
      },
      
      {
        name: "Settings",
        icon: Settings,
        key: "settings",
        expandable: false,
        href: `/staffs/settings`,
      },
    ];
  };

  const navItems = getNavItems();

  const isActive = (href?: string) => {
    if (!href) return false;
    // Special handling for dashboard link: /farm/{subRole}
    if (href.startsWith("/farm/") && pathname === href) {
      return true;
    }
    // Check if the current pathname is an exact match or a substring match for the dashboard root
    if (href.startsWith("/farm/") && pathname.startsWith("/farm/")) {
      const rootPath = href.split("/").slice(0, 3).join("/"); // /farm/{subRole}
      if (pathname === rootPath) return true;
    }
    return pathname === href;
  };

  const isParentActive = (children?: Array<{ href: string }>) => {
    if (!children) return false;
    return children.some((child) => pathname === child.href);
  };

  const activeParentItem = navItems.find((item) => item.key === hoveredMenuKey);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    const userId = user?._id;
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await getNotification(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id]);

  // Initial fetch to get the unread count
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- Dropdown Management Logic ---
  const toggleDropdown = () => {
    // Toggle the visibility state
    setIsDropdownOpen((prev) => !prev);

    // Optional: Re-fetch only when opening to get the freshest data
    if (!isDropdownOpen) {
      fetchNotifications();
    }
  };

  // Logic to close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dateFormatter = (d: string) => {
    const [hours, minutes] = d.split(":").map(Number);

    const formatted = new Date(0, 0, 0, hours, minutes).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return formatted;
  };

  // Calculate unread count (for the red dot)
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (Main Element - Z-index: 50 is fine) */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-[150] ${
          // z-50 is the max index for the main sidebar
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative border-r border-gray-200 flex flex-col h-screen`}
        onMouseLeave={
          sidebarCollapsed ? () => setHoveredMenuKey(null) : undefined
        }
      >
        {/* Standalone Collapse Button */}
        <button
          onClick={toggleSidebarCollapse}
          className="absolute right-[-12px] top-6 z-[200] hidden md:flex items-center justify-center w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md text-gray-500 hover:text-gray-700 hover:bg-gray-50 cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronRight size={14} className="rotate-180 transition-transform duration-300" />
          )}
        </button>

        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center w-full" : "space-x-2"
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
        <nav className="flex-1 px-4 py-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-2">
            {/* Nav Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isExpanded = expandedMenus.includes(item.key);
              const itemIsActive =
                isActive(item.href) || isParentActive(item.children);

              // Determine if the parent itself is "Coming Soon" or "Premium"
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
                      onMouseEnter={
                        sidebarCollapsed
                          ? () => setHoveredMenuKey(item.key)
                          : undefined
                      }
                      onClick={
                        sidebarCollapsed
                          ? item.comingSoon // If the parent is coming soon, show modal on click
                            ? () => setShowComingSoon(true)
                            : () => toggleMenu(item.key)
                          : undefined
                      }
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
                            ? "bg-green-50 text-green-700"
                            : "text-gray-700 hover:bg-gray-100"
                        } ${sidebarCollapsed ? "justify-center" : ""}`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <div
                          className={`flex items-center ${
                            sidebarCollapsed ? "justify-center" : ""
                          }`}
                        >
                          <Icon
                            size={18}
                            className={sidebarCollapsed ? "" : "mr-3"}
                          />
                          {!sidebarCollapsed && (
                            <>
                              <span>{item.name}</span>
                              {badge}
                            </>
                          )}
                        </div>
                        {!sidebarCollapsed &&
                          (isExpanded ? (
                            <ChevronDown size={16} />
                          ) : (
                            <ChevronRight size={16} />
                          ))}
                      </button>

                      {/* Normal expanded children (when sidebar is NOT collapsed) */}
                      {!sidebarCollapsed &&
                        item.expandable &&
                        isExpanded &&
                        item.children && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => {
                              // 🚀 UPDATED LOGIC: Check both parent and child comingSoon status
                              const isChildComingSoon =
                                item.comingSoon ||
                                child.comingSoon ||
                                child.href === "#";

                              return (
                                <Link
                                  key={child.href}
                                  href={isChildComingSoon ? "#" : child.href}
                                  onClick={(e) => {
                                    if (isChildComingSoon) {
                                      e.preventDefault();
                                      setShowComingSoon(true);
                                    } else {
                                      setSidebarOpen(false); // Close mobile sidebar on navigation
                                    }
                                  }}
                                  className={`block px-3 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${
                                    child.href === pathname
                                      ? "font-semibold"
                                      : ""
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    {child.name}
                                    {isChildComingSoon && (
                                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                        Soon
                                      </span>
                                    )}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  ) : (
                    <Link
                      href={item.comingSoon ? "#" : item.href || "#"}
                      onMouseEnter={
                        sidebarCollapsed && item.expandable
                          ? () => setHoveredMenuKey(item.key)
                          : undefined
                      }
                      onClick={(e) => {
                        if (item.comingSoon || item.href === "#") {
                          e.preventDefault();
                          setShowComingSoon(true);
                        } else {
                          setSidebarOpen(false); // Close mobile sidebar on navigation
                        }
                      }}
                      className={`block w-full rounded-lg text-sm font-medium transition-colors ${
                        itemIsActive
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <div
                        className={`flex items-center px-3 py-3 ${sidebarCollapsed ? "justify-center" : ""}`}
                      >
                        <Icon
                          size={18}
                          className={sidebarCollapsed ? "" : "mr-3"}
                        />
                        {!sidebarCollapsed && (
                          <>
                            <span>{item.name}</span>
                            {badge}
                          </>
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Logout */}
          <div className="border-t border-gray-200 p-4 mt-auto">
            <button
              onClick={(e) => {
                e.preventDefault();
                logout();
                router.push("/login");
              }}
              className={`flex items-center w-full px-3 py-2 text-sm text-gray-650 hover:text-gray-950 rounded-lg hover:bg-gray-100 transition-colors ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
              title={sidebarCollapsed ? "Sign out" : undefined}
            >
              <LogOut size={16} className={sidebarCollapsed ? "" : "mr-2"} />
              {!sidebarCollapsed && "Sign out"}
            </button>
          </div>
        </nav>
      </div>

      {/* Collapsed Sidebar Flyout Preview (Higher Z-index: 60) */}
      {sidebarCollapsed && activeParentItem && activeParentItem.children && (
        <div
          ref={flyoutRef}
          className="fixed left-16 top-0 h-full overflow-y-auto bg-white shadow-xl z-[160] border-l border-gray-200 transition-opacity duration-150 ease-in-out"
          style={{
            width: "200px",
            paddingTop: "64px", // Space for the top header
            paddingBottom: "64px", // Space for the bottom area
          }}
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 border-b pb-2">
              {activeParentItem.name}
            </h3>
            {activeParentItem.children.map((child) => {
              const isChildComingSoon =
                activeParentItem.comingSoon ||
                child.comingSoon ||
                child.href === "#";

              return (
                <Link
                  key={child.href}
                  href={isChildComingSoon ? "#" : child.href}
                  onClick={(e) => {
                    if (isChildComingSoon) {
                      e.preventDefault();
                      setShowComingSoon(true);
                    } else {
                      setHoveredMenuKey(null); // Close flyout on navigation
                    }
                  }}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${
                    child.href === pathname ? "font-semibold bg-gray-50" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {child.name}
                    {isChildComingSoon && (
                      <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Soon
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
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
                    disabled
                    placeholder="Search Famtech..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-34 md:w-64"
                  />
                </div>
              </div>
            </div>
            <header className="p-4 sticky top-0 z-[20]">
              <div className="flex justify-end">
                {/* 🎯 Notification Dropdown Container (Relative position for absolute dropdown) */}
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center space-x-2 md:space-x-4">
                    {/* 🔔 Bell Icon Button (Toggle on click) */}
                    <button
                      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={toggleDropdown} // ⬅️ This makes the dropdown appear
                      disabled={isLoading} // Optional: disable while initial count is loading
                    >
                      <Bell size={20} />
                      {/* Unread Indicator Dot (Always visible if count > 0) */}
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>

                    {/* 👤 Profile Dropdown */}
                    <div className="relative" ref={profileDropdownRef}>
                      <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="flex items-center space-x-2 hover:bg-gray-150 p-1.5 rounded-lg transition-colors focus:outline-none"
                      >
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <ChevronDown size={16} className="text-gray-500" />
                      </button>

                      {isProfileDropdownOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-[110] py-1 overflow-hidden">
                          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                              {user?.name || "Staff"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user?.email}
                            </p>
                          </div>
                          
                          <Link
                            href="/staffs/settings"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Settings size={16} className="mr-2 text-gray-400" />
                            Settings
                          </Link>

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setIsProfileDropdownOpen(false);
                              logout();
                              router.push("/login");
                            }}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-650 hover:text-red-750 hover:bg-red-50/50 transition-colors border-t border-gray-100 text-left"
                          >
                            <LogOut size={16} className="mr-2 text-red-500" />
                            Sign out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 📥 Notification Dropdown Content (Only visible if isDropdownOpen is TRUE) */}
                  {isDropdownOpen && (
                    <div className="absolute right-2 md:right-0 mt-3 w-70 md:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[110] overflow-hidden">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Notifications ({unreadCount})
                        </h3>
                      </div>

                      <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                        {isLoading ? (
                          <div className="p-4 text-center text-gray-500">
                            Loading notifications...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No new notifications.
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const isRead = notification.read;
                            return (
                              <Link
                                key={notification.id}
                                href={`/farm-operation?tab=planner`}
                                onClick={() => setIsDropdownOpen(false)}
                                className={`relative flex items-start gap-3 p-4 border-b border-slate-50 transition-all duration-200 ${
                                  isRead
                                    ? "bg-white hover:bg-slate-50/80 text-slate-600"
                                    : "bg-gradient-to-r from-green-50/40 to-emerald-50/10 hover:from-green-50/60 hover:to-emerald-50/20 text-slate-900 font-semibold"
                                  }`}
                                title={notification?.notification}
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                                      isRead
                                        ? "bg-slate-100 text-slate-400"
                                        : "bg-green-100 text-green-700 shadow-sm"
                                    }`}
                                  >
                                    <CheckCircle size={16} />
                                  </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm leading-snug capitalize tracking-tight ${isRead ? "text-slate-600 font-medium" : "text-slate-800 font-semibold"}`}>
                                    {notification?.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="inline-flex items-center text-[10px] text-slate-400 font-medium gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                      <Calendar size={10} />
                                      {new Date(
                                        notification?.timeline?.dueDate || null
                                      )?.toLocaleDateString()}
                                    </span>
                                    <span className="inline-flex items-center text-[10px] text-slate-400 font-medium gap-1 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                                      <Clock size={10} />
                                      {dateFormatter(
                                        notification?.timeline?.dueTime
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {!isRead && (
                                  <span className="absolute top-4 right-4 flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                  </span>
                                )}
                              </Link>
                            );
                          })
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-2 border-t text-center border-gray-100">
                          <button className="text-xs text-green-600 hover:text-green-700">
                            Mark all as read
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </header>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="p-4 md:p-6">{children}</div>
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
          We&apos;re working hard to bring this feature to you soon 🚀
        </p>
      </Modal>
    </div>
  );
}
