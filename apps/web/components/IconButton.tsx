import type { ButtonHTMLAttributes, ReactNode } from "react";

// Native button props ko extend kiya taaki disabled, aria-label, title sab auto-support ho jaye
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  activated?: boolean;
}

export function IconButton({
  icon,
  onClick,
  activated = false,
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button" // Prevents accidental form submission if used inside a <form>
      className={`p-1.5 m-1 cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-center select-none ${activated
          ? "bg-black text-white shadow-sm ring-1 ring-black"
          : "text-slate-700 hover:bg-slate-100 active:bg-slate-900 active:text-white active:scale-95"
        } ${className}`}
      onClick={onClick}
      {...props} // Passes down title="Pencil", aria-label, disabled, etc.
    >
      {icon}
    </button>
  );
}