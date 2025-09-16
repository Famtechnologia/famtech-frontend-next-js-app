// app/(dashboard)/page.tsx
"use client";
import { CardProps } from "@/types/general";

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}) => {
  return (
     <div className={`bg-white rounded-lg shadow-sm border border-gray-200  ${className}`}>
      <div className={`p-4 border-b border-gray-200 ${headerClassName}`}>
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
};
export default Card
