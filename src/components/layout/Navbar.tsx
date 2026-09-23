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
  Star,
  Menu,
  X,
  ExternalLink,
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
  const isHealthy = status === "Healthy";
  const isWarning = status === "Warning";

  const statusDotClass = isHealthy
    ? "bg-emerald-500"
    : isWarning
    ? "bg-amber-500"
    : "bg-rose-500";

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Countries", href: "/countries" },
    { label: "Indicators", href: "/indicators" },
    { label: "Compare", href: "/compare" },
    { label: "Pipeline", href: "/pipeline" },
    { label: "Methodology", href: "/methodology" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Status */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground text-background shadow-subtle group-hover:scale-105 transition-transform duration-200">
              <Activity className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-foreground text-sm sm:text-base font-sans">
                  Global Development Pulse
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-surface border border-border px-2 py-0.5 text-[10px] font-mono font-medium text-muted-foreground">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass} animate-pulse`} />
                  {status}
                </span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Links (Clean Minimalist Segment) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "text-foreground bg-surface border border-border/80 shadow-subtle"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-hover/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Master GitHub Button + Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* GitHub Master Action Button */}
          <a
            href="https://github.com/gxammad/Global-Development-Pulse"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-surface-hover hover:border-accent-blue/40 text-foreground transition-all duration-200 shadow-subtle hover:shadow-card"
          >
            <Github className="h-4 w-4 text-foreground group-hover:rotate-6 transition-transform duration-200 shrink-0" />
            <span className="text-xs font-semibold tracking-tight hidden md:inline font-sans">
              gxammad/Global-Development-Pulse
            </span>
            <span className="text-xs font-semibold tracking-tight md:hidden">
              Repo
            </span>
            <div className="flex items-center gap-1 pl-1.5 border-l border-border text-[11px] font-mono text-muted-foreground group-hover:text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="hidden sm:inline">Star</span>
            </div>
          </a>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors shadow-subtle"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            className="flex lg:hidden h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:text-foreground"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-surface/95 backdrop-blur-md px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                }`}
              >
                <span>{item.label}</span>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-accent-blue" />}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
