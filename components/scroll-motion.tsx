'use client'

import { useEffect } from 'react'

export function ScrollMotion() {
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealTargets = document.querySelectorAll<HTMLElement>('main section, main article, main .motion-card, main img')
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((target) => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' })

    revealTargets.forEach((target, index) => {
      if (target.closest('[role="dialog"]')) return
      target.classList.add('scroll-reveal')
      if (target.matches('article, .motion-card')) target.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 75}ms`)
      observer.observe(target)
    })

    return () => observer.disconnect()
  }, [])

  return null
}
