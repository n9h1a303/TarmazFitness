import { NavTabs } from "@/components/nav-tabs"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-full">
      <NavTabs />
      <main className="flex-1 pb-16 md:pb-0 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
