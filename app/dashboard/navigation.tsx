'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

const links = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/runway', label: 'Financial runway' },
  { href: '/dashboard/rate-calculator', label: 'Rate calculator' },
  { href: '/dashboard/offer-analysis', label: 'Offer analysis' },
]

export default function DashboardNavigation() {
  const pathname = usePathname()

  return (
    <>
      <aside className="dashboard-sidebar hidden lg:flex" aria-label="Workspace navigation">
        <Link href="/dashboard" className="brand-mark" aria-label="RunRate overview">
          <span className="brand-bars" aria-hidden="true"><i /><i /><i /></span>
          <span className="brand-name">Run<span>Rate</span></span>
        </Link>
        <p className="nav-eyebrow">YOUR WORKSPACE</p>
        <nav className="nav-links" aria-label="Main navigation">
          {links.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`nav-link${active ? ' is-active' : ''}`}><span className="nav-dot" aria-hidden="true" />{label}</Link>
          })}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/dashboard/settings" aria-current={pathname === '/dashboard/settings' ? 'page' : undefined} className={`nav-link${pathname === '/dashboard/settings' ? ' is-active' : ''}`}><span className="nav-dot" aria-hidden="true" />Account settings</Link>
          <LogoutButton />
        </div>
      </aside>
      <nav className="mobile-navigation lg:hidden" aria-label="Main navigation">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={active ? 'mobile-nav-link is-active' : 'mobile-nav-link'}><span className="mobile-nav-mark" aria-hidden="true" />{label}</Link>
        })}
      </nav>
    </>
  )
}
