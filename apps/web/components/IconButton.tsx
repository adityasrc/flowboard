import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  activated?: boolean;
}

export function IconButton({
  icon,
  onClick,
  activated = false,
  className = "",
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "p-1.5 shrink-0 cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-center select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:active:scale-100 disabled:active:bg-transparent disabled:active:text-slate-700",
        activated
          ? "bg-slate-950 text-white shadow-sm ring-1 ring-slate-950"
          : "text-slate-700 hover:bg-slate-100 active:bg-slate-950 active:text-white active:scale-95",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {icon}
    </button>
  );
}