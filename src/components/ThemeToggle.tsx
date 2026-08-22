import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle({ variant = "navbar" }: { variant?: "navbar" | "mobile" }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className={
        variant === "navbar"
          ? "grid h-9 w-9 place-items-center rounded-full border border-brand-dark/10 bg-white/70 text-brand-dark backdrop-blur transition-colors hover:border-brand-orange/30 hover:text-brand-orange-dark dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:text-white"
          : "flex w-full items-center justify-between rounded-xl border border-brand-dark/10 bg-white px-4 py-3 text-left dark:border-white/10 dark:bg-white/5"
      }
    >
      <span className={variant === "mobile" ? "flex items-center gap-2 text-sm font-medium" : "sr-only"}>
        {variant === "mobile" && (isDark ? "Dark Mode" : "Light Mode")}
      </span>
      {isDark ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
      {variant === "mobile" && (
        <span className="rounded-full bg-brand-dark px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-brand-dark">
          {isDark ? "🌙 Dark" : "☀️ Light"}
        </span>
      )}
    </button>
  );
}
