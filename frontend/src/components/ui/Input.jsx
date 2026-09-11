import React from "react";
import { cn } from "../../lib/utils";

export function Input({
  className,
  type = "text",
  label,
  error,
  helperText,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        type={type}
        className={cn(
          "w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400",
          "transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
          error && "border-rose-300 focus:ring-rose-500 focus:border-rose-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  className,
  label,
  error,
  helperText,
  rows = 3,
  ...props
}) {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={cn(
          "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 resize-none",
          "transition duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
          error && "border-rose-300 focus:ring-rose-500 focus:border-rose-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
    </div>
  );
}
