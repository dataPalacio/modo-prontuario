import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

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
