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
     <div className={`bg-white rounded-xl ${borderless ? "shadow-[0_8px_30px_rgb(0,0,0,0.03)]" : "shadow-sm border border-gray-200"}  ${className}`}>
      <div className={`p-4 ${borderless ? "" : "border-b border-gray-200"} ${headerClassName}`}>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
export default Card
