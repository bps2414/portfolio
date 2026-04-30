"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10 px-0" aria-label="Alternar tema">
        <div className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative w-10 h-10 px-0 overflow-hidden"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Alternar tema"
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
          theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ease-out ${
          theme === "dark" ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
