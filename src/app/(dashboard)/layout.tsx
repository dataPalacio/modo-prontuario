'use client'

import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <Header />
      <main className="main-content animate-fade-in">
        {children}
      </main>
    </div>
  )
}
