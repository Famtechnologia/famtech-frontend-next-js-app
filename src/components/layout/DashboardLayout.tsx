"use client";

import { useState, useRef, useEffect, useCallback, Fragment } from "react";
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
  BarrelIcon,
  X,
  Bell,
  ChevronRight,
  ChevronDown,
  User,
  LucideIcon,
  Clock,
  CheckCircle,
  Calendar,
  StoreIcon,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// import { useLogout } from "@/lib/api/auth";
import Modal from "@/components/ui/Modal"; // adjust to your modal path
import { getNotifications, Notification } from "@/lib/services/taskplanner";
import FloatingChatbot from "./FloatingChatbot";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
  // 💡 ADDED: section grouping + optional sub-brand label
  section?: string;
  subBrand?: string;
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
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // NEW STATE for collapsed sidebar flyout preview
  const [hoveredMenuKey, setHoveredMenuKey] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const pathname = usePathname();
  // const { handleLogout } = useLogout();

  const { setId } = useProfileStore() as {
    loading: boolean;
    error: unknown;
    setId: (id: string) => void;
  };

  useEffect(() => {
    if (user?.farmProfile) {
      setId(user?.farmProfile);
    }
  }, [user?.farmProfile, setId]);

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
        // ───────── OPERATIONS ─────────
        {
          name: "Dashboard",
          href: `/dashboard`,
          icon: LayoutDashboard,
          key: "dashboard",
          expandable: false,
          section: "Operations",
        },
        {
          name: "Farm Operations",
          icon: Tractor,
          key: "farm-operations",
          expandable: true,
          section: "Operations",
          children: [
            // Use query parameters to designate the active tab view
            { name: "Task Planner", href: `/farm-operation?tab=planner` },
            { name: "Calendar View", href: `/farm-operation?tab=calendar` },
            {
              name: "Crop and Livestock Records",
              href: `/farm-operation?tab=records`,
            },
            {
              name: "Staff Management",
              href: `/farm-operation?tab=staff`,
            },
          ],
        },
        {
          name: "Inventory Management",
          href: `/inventory`,
          icon: StoreIcon,
          key: "inventory",
          expandable: false,
          section: "Operations",
        },
        {
          name: "Warehouse",
          icon: BarrelIcon,
          key: "warehouse",
          expandable: false,
          href: `/warehouse`,
          section: "Operations",
        },

        // ───────── INSIGHTS ─────────
        {
          name: "Smart Advisory",
          icon: Brain,
          key: "Smart Advisory",
          expandable: false,
          href: `/smart-advisory`,
          section: "Insights",
        },
        {
          name: "Reports",
          icon: FileText,
          key: "reports",
          expandable: false,
          href: "/reports",
          section: "Insights",
        },
        {
          name: "Mapping & Geo Tools",
          icon: Map,
          key: "mapping",
          expandable: false,
          href: `/dashboard/farmer/${subRole}/mapping`,
          comingSoon: true,
          section: "Insights",
        },

        // ───────── BUSINESS ─────────
        {
          name: "Financials",
          subBrand: "SmartNet",
          icon: CreditCard,
          key: "financials",
          expandable: true,
          comingSoon: true,
          section: "Business",
          children: [
            { name: "Overview", href: "#" },
            { name: "Income", href: "#" },
            { name: "Expenses", href: "#" },
            { name: "Reports", href: "#" },
          ],
        },
        {
          name: "Marketplace",
          subBrand: "Famora",
          icon: ShoppingCart,
          key: "marketplace",
          expandable: true,
          comingSoon: true,
          section: "Business",
          children: [
            { name: "Buy", href: "#" },
            { name: "Sell", href: "#" },
            { name: "My Orders", href: "#" },
          ],
        },
        {
          name: "Equipment Sync",
          icon: Cpu,
          key: "equipment-sync",
          expandable: false,
          href: `/equipment-sync`,
          comingSoon: true,
          section: "Business",
        },

        // ───────── ACCOUNT ─────────
        {
          name: "Settings",
          icon: Settings,
          key: "settings",
          expandable: true,
          section: "Account",
          children: [
            { name: "Profile", href: `/settings/profile` },
            { name: "Farm Settings", href: `/settings/farm-setting` },
            {
              name: "Notifications",
              href: `/dashboard/farmer/${subRole}/settings/notifications`,
              comingSoon: true,
            },
          ],
        },
        {
          name: "Help & Support",
          icon: HelpCircle,
          key: "help",
          expandable: true,
          section: "Account",
          children: [
            {
              name: "Documentation",
              href: `/dashboard/farmer/${subRole}/help/docs`,
              comingSoon: true,
            },
            { name: "Contact Support", href: `/help/contact-support` },
            {
              name: "Training",
              href: `/dashboard/farmer/${subRole}/help/training`,
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
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // --- Data Fetching Logic ---
  // Fetch notifications ONLY when the component mounts or the user changes
  const fetchNotifications = useCallback(async () => {
    const userId = user?._id;
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
  }, [user?._id]);

  // Initial fetch to get the unread count
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // --- Dropdown Management Logic ---
  const toggleDropdown = () => {
    // Toggle the visibility state
    setIsDropdownOpen((prev) => !prev);
    
    // Close profile dropdown when opening notifications
    setIsProfileDropdownOpen(false);

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
    <div className="flex h-screen bg-gray-50 dark:bg-[#0d1117]">
      {/* Sidebar (Main Element - Z-index: 50 is fine) */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-[150] ${
          // z-50 is the max index for the main sidebar
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-white dark:bg-[#161b22] shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative border-r border-gray-200 dark:border-[#30363d] flex flex-col`}
        onMouseLeave={
          sidebarCollapsed ? () => setHoveredMenuKey(null) : undefined
        }
      >
        {/* Standalone Collapse Button */}
        <button
          onClick={toggleSidebarCollapse}
          className="absolute right-[-12px] top-6 z-[200] hidden md:flex items-center justify-center w-6 h-6 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded-full shadow-md text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-[#e6edf3] hover:bg-gray-50 dark:hover:bg-[#1c2128] cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronRight size={14} className="rotate-180 transition-transform duration-300" />
          )}
        </button>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-[#30363d]">
          <div
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center w-full" : "space-x-2"
            }`}
          >
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#e6edf3]">FAMTECH</h1>
            )}
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${sidebarCollapsed ? "px-1.5" : "px-4"} py-4 overflow-y-auto scrollbar-hide`}>
          <div className="space-y-2">
            {/* Nav Items */}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = expandedMenus.includes(item.key);
              const itemIsActive =
                isActive(item.href) || isParentActive(item.children);

              // Section header: show when this item starts a new section
              const prevSection = index > 0 ? navItems[index - 1].section : undefined;
              const startsNewSection = !!item.section && item.section !== prevSection;

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

              // Label (name + optional smaller sub-brand)
              const label = (
                <span className="truncate">
                  {item.name}
                  {item.subBrand && (
                    <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-[#6e7681]">
                      {item.subBrand}
                    </span>
                  )}
                </span>
              );

              return (
                <Fragment key={item.key}>
                  {/* Section header (expanded) / divider (collapsed) */}
                  {startsNewSection &&
                    (sidebarCollapsed ? (
                      index > 0 && (
                        <div className="my-2 mx-2 border-t border-gray-200 dark:border-[#30363d]" />
                      )
                    ) : (
                      <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-[#6e7681] select-none">
                        {item.section}
                      </p>
                    ))}

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
                        className={`w-full flex items-center justify-between ${
                          sidebarCollapsed ? "px-2" : "px-3"
                        } py-3 rounded-lg text-sm font-medium transition-colors border-l-4 ${
                          itemIsActive
                            ? "bg-green-50 dark:bg-[#1a3a2a] text-green-700 dark:text-[#4ade80] font-semibold border-green-600 dark:border-[#4ade80]"
                            : item.comingSoon
                              ? "text-gray-400 dark:text-[#6e7681] hover:bg-gray-50 dark:hover:bg-[#1c2128] border-transparent"
                              : "text-gray-700 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#1c2128] border-transparent"
                        } ${sidebarCollapsed ? "justify-center" : ""}`}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <div
                          className={`flex items-center min-w-0 ${
                            sidebarCollapsed ? "justify-center" : ""
                          }`}
                        >
                          <Icon
                            size={18}
                            className={sidebarCollapsed ? "" : "mr-3 shrink-0"}
                          />
                          {!sidebarCollapsed && (
                            <>
                              {label}
                              {badge}
                            </>
                          )}
                        </div>
                        {!sidebarCollapsed &&
                          (isExpanded ? (
                            <ChevronDown size={16} className="shrink-0" />
                          ) : (
                            <ChevronRight size={16} className="shrink-0" />
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
                                  className={`block px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-[#1c2128] ${
                                    isChildComingSoon
                                      ? "text-gray-400 dark:text-[#6e7681]"
                                      : "text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#e6edf3]"
                                  } ${
                                    child.href === pathname
                                      ? "font-semibold text-green-700 dark:text-[#4ade80]"
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
                      className={`block w-full rounded-lg text-sm font-medium transition-colors border-l-4 ${
                        itemIsActive
                          ? "bg-green-50 dark:bg-[#1a3a2a] text-green-700 dark:text-[#4ade80] font-semibold border-green-600 dark:border-[#4ade80]"
                          : item.comingSoon
                            ? "text-gray-400 dark:text-[#6e7681] hover:bg-gray-50 dark:hover:bg-[#1c2128] border-transparent"
                            : "text-gray-700 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#1c2128] border-transparent"
                      }`}
                      title={sidebarCollapsed ? item.name : undefined}
                    >
                      <div
                        className={`flex items-center min-w-0 ${
                          sidebarCollapsed ? "px-2 py-3 justify-center" : "px-3 py-3"
                        }`}
                      >
                        <Icon
                          size={18}
                          className={sidebarCollapsed ? "" : "mr-3 shrink-0"}
                        />
                        {!sidebarCollapsed && (
                          <>
                            {label}
                            {badge}
                          </>
                        )}
                      </div>
                    </Link>
                  )}
                </Fragment>
              );
            })}
          </div>
        </nav>

        {/* Pinned Sign Out Section */}
        <div className={`border-t border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] ${sidebarCollapsed ? "p-1.5" : "p-4"}`}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center ${
              sidebarCollapsed ? "px-2 justify-center" : "px-3"
            } py-3 rounded-lg text-sm font-medium transition-colors border-l-4 border-transparent text-gray-650 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#1c2128] hover:text-gray-950 dark:hover:text-[#e6edf3]`}
            title={sidebarCollapsed ? "Sign out" : undefined}
          >
            <div
              className={`flex items-center min-w-0 ${
                sidebarCollapsed ? "justify-center" : ""
              }`}
            >
              <LogOut
                size={18}
                className={sidebarCollapsed ? "" : "mr-3 shrink-0"}
              />
              {!sidebarCollapsed && <span>Sign out</span>}
            </div>
          </button>
        </div>
      </div>

      {/* Collapsed Sidebar Flyout Preview (Higher Z-index: 60) */}
      {sidebarCollapsed && activeParentItem && activeParentItem.children && (
        <div
          ref={flyoutRef}
          className="fixed left-16 top-0 h-full overflow-y-auto bg-white dark:bg-[#161b22] shadow-xl z-[160] border-l border-gray-200 dark:border-[#30363d] transition-opacity duration-150 ease-in-out"
          style={{
            width: "200px",
            paddingTop: "64px", // Space for the top header
            paddingBottom: "64px", // Space for the bottom area
          }}
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-[#e6edf3] mb-2 border-b dark:border-[#30363d] pb-2">
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
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-50 dark:hover:bg-[#1c2128] ${
                    isChildComingSoon
                      ? "text-gray-400 dark:text-[#6e7681]"
                      : "text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#e6edf3]"
                  } ${child.href === pathname ? "font-semibold bg-gray-50 dark:bg-[#1a3a2a] text-green-700 dark:text-[#4ade80]" : ""}`}
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
        <header className="bg-white dark:bg-[#161b22] shadow-sm border-b border-gray-200 dark:border-[#30363d]">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4"
              >
                <Menu size={24} />
              </button>
              {/*   <div className="flex items-center space-x-4">
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
              </div>*/}
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <ThemeToggle />
              {/* 🎯 Notification Dropdown Container */}
              <div className="relative" ref={dropdownRef}>
                {/* 🔔 Bell Icon Button (Toggle on click) */}
                <button
                  className="relative p-2 text-gray-600 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#e6edf3] hover:bg-gray-100 dark:hover:bg-[#1c2128] rounded-lg transition-colors"
                  onClick={toggleDropdown}
                  disabled={isLoading}
                >
                  <Bell size={20} />
                  {/* Unread Indicator Dot */}
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* 📥 Notification Dropdown Content */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-70 md:w-80 bg-white dark:bg-[#161b22] rounded-xl shadow-2xl border border-gray-100 dark:border-[#30363d] z-[110] overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-[#30363d]">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-[#e6edf3]">
                        Notifications ({unreadCount})
                      </h3>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-[#30363d]">
                      {isLoading ? (
                        <div className="p-4 text-center text-gray-500 dark:text-[#8b949e]">
                          Loading notifications...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-[#8b949e]">
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
                                  ? "bg-white dark:bg-[#161b22] hover:bg-slate-50/80 dark:hover:bg-[#1c2128] text-slate-600 dark:text-[#8b949e]"
                                  : "bg-gradient-to-r from-green-50/40 to-emerald-50/10 dark:from-[#1a3a2a]/40 dark:to-[#1a3a2a]/10 hover:from-green-50/60 hover:to-emerald-50/20 dark:hover:from-[#1a3a2a]/60 dark:hover:to-[#1a3a2a]/20 text-slate-900 dark:text-[#e6edf3] font-semibold"
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
                      <div className="p-2 border-t text-center border-gray-100 dark:border-[#30363d]">
                        <button className="text-xs text-green-600 hover:text-green-700">
                          Mark all as read
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 👤 Profile Dropdown Section */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen((prev) => !prev);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center space-x-1 focus:outline-none hover:opacity-90 transition-opacity cursor-pointer p-1"
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center overflow-hidden border border-green-600/10 hover:scale-105 transition-transform">
                    {user?.profileImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} className="text-white" />
                    )}
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-500 dark:text-[#8b949e] transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-[#161b22] rounded-xl shadow-xl border border-gray-100 dark:border-[#30363d] py-1.5 z-[110] transition-all">
                    {/* User Info Header in Dropdown */}
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-[#30363d]">
                      <p className="text-[10px] text-gray-400 dark:text-[#6e7681] uppercase font-semibold tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-[#e6edf3] truncate">
                        {user?.email || "Farmer"}
                      </p>
                    </div>

                    <Link
                      href="/settings/profile"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors"
                    >
                      <User size={16} className="mr-2.5 text-gray-400 dark:text-[#6e7681]" />
                      View Profile
                    </Link>

                    <Link
                      href="/settings/farm-setting"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-[#8b949e] hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors"
                    >
                      <Settings size={16} className="mr-2.5 text-gray-400 dark:text-[#6e7681]" />
                      Settings
                    </Link>

                    <div className="border-t border-gray-100 dark:border-[#30363d] my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={16} className="mr-2.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-[#0d1117]">
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
          We’re working hard to bring this feature to you soon 🚀
        </p>
      </Modal>

      {/* Logout confirmation modal */}
      <Modal
        show={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Confirm Sign Out"
      >
        <div className="space-y-6">
          <p className="text-gray-650 text-base leading-relaxed">
            Are you sure you want to sign out of your Famtech account? You will need to log in again to access your dashboard.
          </p>
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowLogoutConfirm(false);
                logout();
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-750 rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </Modal>
      <FloatingChatbot />
    </div>
  );
}
