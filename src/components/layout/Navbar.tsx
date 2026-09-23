"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Globe2,
  BarChart3,
  GitCompare,
  Terminal,
  FileText,
  Sun,
  Moon,
  Github,
  Menu,
  X
} from "lucide-react";
import { useTheme } from "@/components/theme/ThemeProvider";
import type { PipelineHealth } from "@/types";

interface NavbarProps {
  health?: PipelineHealth | null;
}

export function Navbar({ health }: NavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const status = health?.status || "Healthy";
  const statusColor =
    status === "Healthy"
      ? "bg-emerald-500"
      : status === "Warning"
      ? "bg-amber-500"
      : "bg-rose-500";

  const navItems = [
    { label: "Countries", href: "/countries", icon: Globe2 },
    { label: "Indicators", href: "/indicators", icon: BarChart3 },
    { label: "Compare", href: "/compare", icon: GitCompare },
    { label: "Pipeline", href: "/pipeline", icon: Terminal },
    { label: "Methodology", href: "/methodology", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-border shadow-sm group-hover:border-accent-blue/50 transition-colors">
              <Activity className="h-5 w-5 text-accent-blue" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-foreground text-sm sm:text-base">
                  Global Development Pulse
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2 py-0.5 text-[11px] font-mono font-medium text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusColor} animate-pulse`} />
                  {status}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? "bg-surface text-foreground font-semibold border border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Pipeline quick pill on desktop */}
          <Link
            href="/pipeline"
            className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors font-mono"
          >
            <span>Run: Every 8h</span>
            <span className="text-border">|</span>
            <span className="text-emerald-500 font-medium">11.2k records</span>
          </Link>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* GitHub Repo */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="hidden sm:flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
          >
            <Github className="h-4 w-4" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? "bg-surface text-foreground font-semibold border border-border"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
