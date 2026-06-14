// app/(dashboard)/page.tsx
"use client";
import { CardProps } from "@/types/general";

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  borderless = false,
}) => {
  return (
    <div className={`flex flex-col bg-white dark:bg-[#161b22] rounded-xl ${borderless ? "shadow-[0_8px_30px_rgb(0,0,0,0.03)]" : "shadow-sm border border-gray-200 dark:border-[#30363d]"} ${className}`}>
      <div className={`p-4 shrink-0 ${borderless ? "" : "border-b border-gray-200 dark:border-[#30363d]"} ${headerClassName}`}>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-[#e6edf3]">{title}</h2>
      </div>
      <div className={`flex-1 p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
export default Card
