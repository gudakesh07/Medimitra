import React from "react";
import { cn } from "../../lib/utils";

export function Card({ children, className, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-slate-100 backdrop-blur-xs text-slate-900",
        hover && "transition-all duration-300 hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return <div className={cn("mb-4 space-y-1", className)} {...props}>{children}</div>;
}

export function CardTitle({ children, className, ...props }) {
  return <h3 className={cn("text-lg font-bold text-slate-900 tracking-tight", className)} {...props}>{children}</h3>;
}

export function CardDescription({ children, className, ...props }) {
  return <p className={cn("text-sm text-slate-500 leading-relaxed", className)} {...props}>{children}</p>;
}

export function CardContent({ children, className, ...props }) {
  return <div className={cn("space-y-4", className)} {...props}>{children}</div>;
}

export function CardFooter({ children, className, ...props }) {
  return <div className={cn("mt-6 pt-4 border-t border-slate-100 flex items-center justify-between", className)} {...props}>{children}</div>;
}
