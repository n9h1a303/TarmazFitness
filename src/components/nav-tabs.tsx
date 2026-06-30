"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTheme } from "@/components/theme-provider"

const tabs = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/workout", label: "Lịch tập", icon: "💪" },
  { href: "/foods", label: "Thực đơn", icon: "🍜" },
  { href: "/profile", label: "Cá nhân", icon: "👤" },
]

export function NavTabs() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  const activeTab = tabs.find((t) => pathname.startsWith(t.href)) ?? tabs[0]

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex border-b border-border bg-background" role="tablist">
        <div className="flex items-center gap-1 px-4 h-14 max-w-4xl mx-auto w-full">
          <Link href="/" className="font-bold text-lg mr-6 text-primary">
            Tarmaz Fitness
          </Link>
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={activeTab.href === tab.href}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab.href === tab.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {tab.icon} {tab.label}
            </Link>
          ))}
          <button
            onClick={() => signOut()}
            className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm"
          >
            Đăng xuất
          </button>
          <button
            onClick={toggle}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50"
        role="tablist"
      >
        <div className="flex">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={activeTab.href === tab.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                activeTab.href === tab.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
