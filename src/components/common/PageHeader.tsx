import React from "react";

interface PageHeaderProps {
  /** Main page title (rendered in the signature Famtech green). */
  title: string;
  /** Optional supporting line under the title. */
  subtitle?: string;
  /** Optional actions (buttons, badges, etc.) rendered on the right. */
  children?: React.ReactNode;
  /** Extra classes for the outer wrapper if a page needs to tweak spacing. */
  className?: string;
}

/**
 * Standard Famtech dashboard page header.
 *
 * Single source of truth for the title / subtitle / actions row used across
 * dashboard modules (Financials, Warehouse, Smart Advisory, ...). Keeping the
 * markup here means platform-wide heading tweaks are a one-file change instead
 * of an every-page find-and-replace.
 */
export default function PageHeader({
  title,
  subtitle,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-[#30363d] pb-4 mb-6 ${className}`}
    >
      <div>
        <h1 className="text-3xl font-semibold text-green-700 dark:text-green-500">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}
    </div>
  );
}
