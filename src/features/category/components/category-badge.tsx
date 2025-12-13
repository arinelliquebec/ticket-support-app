"use client";

import { Badge } from "@/components/ui/badge";

type CategoryBadgeProps = {
  name: string;
  color: string;
  className?: string;
};

export const CategoryBadge = ({
  name,
  color,
  className = "",
}: CategoryBadgeProps) => {
  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-2 font-normal px-2 py-1 ${className}`}
      style={{
        backgroundColor: `${color}15`, // 15 é a opacidade em hexadecimal (aproximadamente 8%)
        borderColor: `${color}40`, // 40 é a opacidade em hexadecimal (aproximadamente 25%)
        color: color,
      }}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </Badge>
  );
};
