import type { ReactNode } from 'react'
import DashboardNavigation from './navigation'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dashboard-layout">
      <DashboardNavigation />
      <div className="dashboard-content">{children}</div>
    </div>
  )
}
