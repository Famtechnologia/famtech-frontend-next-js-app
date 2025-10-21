"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProfileStore } from "@/lib/store/farmStore";
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
  Clock,
  CheckCircle,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { useLogout } from "@/lib/api/auth";
import Modal from "@/components/ui/Modal"; // adjust to your modal path
import { getNotifications, Notification } from "@/lib/services/taskplanner";
import { useAuthStore } from "@/lib/store/authStore";
// --- Interface Definitions for clarity ---

interface NavChild {
  name: string;
  href: string;
  // 💡 ADDED: Flag to mark individual sub-items as coming soon
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["dashboard"]);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // NEW STATE for collapsed sidebar flyout preview
  const [hoveredMenuKey, setHoveredMenuKey] = useState<string | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const pathname = usePathname();
  // const { handleLogout } = useLogout();

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
    const role = user?.role || "";
    const subRole = user?.role || "";

    if (role === "farmer") {
      return [
        {
          name: "Dashboard",
          href: `/dashboard`,
          icon: LayoutDashboard,
          key: "dashboard",
          expandable: false,
        },
        {
          name: "Farm Operations",
          icon: Tractor,
          key: "farm-operations",
          expandable: true,
          // Note: If you want to mark the entire section as coming soon, you'd add comingSoon: true here.
          children: [
            // Use query parameters to designate the active tab view
            { name: "Task Planner", href: `/farm-operation?tab=planner` },
            {
              name: "Crop and Livestock Records",
              href: `/farm-operation?tab=records`,
            },
            { name: "Calendar View", href: `/farm-operation?tab=calendar` },
            {
              name: "Inventory Management",
              href: `/farm-operation?tab=inventory`,
            },
          ],
        },
        {
          name: "Smart Advisory",
          icon: Brain,
          key: "Smart Advisory",
          expandable: false,
          href: `/smart-advisory`,
        },
        {
          name: "Mapping & Geo Tools",
          icon: Map,
          key: "mapping",
          expandable: false,
          href: `/dashboard/farmer/${subRole}/mapping`,
          comingSoon: true,
        },
        {
          name: "Financials - SmartNet",
          icon: CreditCard,
          key: "financials",
          expandable: true,
          comingSoon: true,
          children: [
            { name: "Overview", href: "#" },
            { name: "Income", href: "#" },
            { name: "Expenses", href: "#" },
            { name: "Reports", href: "#" },
          ],
        },
        {
          name: "Marketplace - Famora",
          icon: ShoppingCart,
          key: "marketplace",
          expandable: true,
          comingSoon: true,
          children: [
            { name: "Buy", href: "#" },
            { name: "Sell", href: "#" },
            { name: "My Orders", href: "#" },
          ],
        },
        {
          name: "Equipment Sync",
          icon: Settings,
          key: "equipment-sync",
          expandable: false,
          href: `/equipment-sync`,
          comingSoon: false,
        },
        {
          name: "Reports",
          icon: FileText,
          key: "reports",
          expandable: true,
          comingSoon: true,
          children: [
            { name: "Production", href: "#" },
            { name: "Financial", href: "#" },
            { name: "Analytics", href: "#" },
          ],
        },
        {
          name: "Settings",
          icon: Settings,
          key: "settings",
          expandable: true,
          children: [
            { name: "Profile", href: `/settings/profile` },
            { name: "Farm Settings", href: `/settings/farm-setting` },
            {
              name: "Notifications",
              href: `/dashboard/farmer/${subRole}/settings/notifications`,
              // 🚀 TARGET: SETTINGS SUB-ITEM COMING SOON
              comingSoon: true,
            },
          ],
        },
        {
          name: "Help & Support",
          icon: HelpCircle,
          key: "help",
          expandable: true,
          children: [
            {
              name: "Documentation",
              href: `/dashboard/farmer/${subRole}/help/docs`,
              // 🚀 TARGET: HELP SUB-ITEM COMING SOON
              comingSoon: true,
            },
            { name: "Contact Support", href: `/help/contact-support` },
            {
              name: "Training",
              href: `/dashboard/farmer/${subRole}/help/training`,
              // 🚀 TARGET: HELP SUB-ITEM COMING SOON
              comingSoon: true,
            },
            { name: "FAQ", href: `/help/faq` },
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

  // Reference for closing the dropdown when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching Logic ---
  // Fetch notifications ONLY when the component mounts or the user changes
  const fetchNotifications = useCallback(async () => {
    const userId = user?.id;
    if (!userId) return;

    setIsLoading(true);
    try {
      const data = await getNotifications(userId);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
        } fixed inset-y-0 left-0 z-50 ${
          // z-50 is the max index for the main sidebar
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200 overflow-y-scroll scrollbar-hide`}
        onMouseLeave={
          sidebarCollapsed ? () => setHoveredMenuKey(null) : undefined
        }
      >
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
        <nav className="flex-1 px-4 py-4 ">
          <div className="space-y-2">
            {/* Collapse Button */}
            <div className="hidden md:block">
              <button
                onClick={toggleSidebarCollapse}
                className={`w-full flex items-center justify-end px-3 py-3 rounded-lg text-sm font-medium transition-colors hover:cursor-pointer`}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <div
                  className={`flex items-center ${
                    sidebarCollapsed ? "justify-center" : ""
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

          {/* Bottom Profile/Logout */}
          <div className="border-t border-gray-200 p-4">
            <div
              className={`flex items-center ${
                sidebarCollapsed ? "justify-center" : "space-x-3"
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
              onClick={logout}
              className={`flex items-center w-ful px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ${
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
          className="fixed left-16 top-0 h-full overflow-y-auto bg-white shadow-xl z-60 border-l border-gray-200 transition-opacity duration-150 ease-in-out"
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
              // 🚀 UPDATED LOGIC: Check both parent and child comingSoon status
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
                    placeholder="Search Famtech..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm w-34 md:w-64"
                  />
                </div>
              </div>
            </div>
            <header className="bg-white p-4 sticky top-0">
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

                    {/* 👤 Profile Section (Uses props/state you provided) */}
                    <div className="flex items-center space-x-2">
                      <Link
                        href="/settings/profile"
                        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <User size={16} className="text-white" />
                      </Link>

                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                  </div>

                  {/* 📥 Notification Dropdown Content (Only visible if isDropdownOpen is TRUE) */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[999999] overflow-hidden">
                      <div className="p-4 border-b">
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
                          notifications.map((notification) => (
                            <Link
                              key={notification.id}
                              href={`/farm-operations?task=${notification.id}`}
                              onClick={() => setIsDropdownOpen(false)} // Close on click
                              className={`flex items-start p-4 hover:bg-green-50 transition-colors ${
                                notification.read
                                  ? "text-gray-500"
                                  : "bg-green-50 text-gray-900 font-medium"
                              }`}
                              title={notification?.notification}
                            >
                              <div className="flex-shrink-0 pt-1 mr-3">
                                <CheckCircle
                                  size={16}
                                  className={
                                    notification.read
                                      ? "text-gray-400"
                                      : "text-green-600"
                                  }
                                />
                              </div>
                              <div>
                                <p className="text-sm leading-snug capitalize">
                                  {notification?.title}
                                </p>
                                <div className="inline-flex items-center gap-2">
                                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(
                                      notification?.timeline?.dueDate || null
                                    )?.toLocaleDateString()}
                                  </p>
                                  <span className="text-gray-400">-</span>
                                  <p className="text-xs text-gray-400 mt-1 flex items-center">
                                    <Clock size={12} className="mr-1" />
                                    {dateFormatter(
                                      notification?.timeline?.dueTime
                                    )}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-2 border-t text-center">
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
