import React from "react";
import { cn } from "../../lib/utils";

export function Badge({
  children,
  className,
  variant = "default", // default, redFlag, warning, success, info, neutral
  size = "md",
  ...props
}) {
  const variants = {
    default: "bg-teal-50 text-teal-700 border-teal-200/60",
    redFlag: "bg-rose-50 text-rose-700 border-rose-200 font-semibold animate-pulse shadow-xs shadow-rose-100",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200"
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
