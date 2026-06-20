import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Scroll-reveal for a container: every element with [data-reveal] inside it
 * fades + rises into view as the section scrolls in, staggered. Respects
 * prefers-reduced-motion (shows everything instantly).
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const items = root.querySelectorAll<HTMLElement>('[data-reveal]')
    if (items.length === 0) return

    if (prefersReduced) {
      gsap.set(items, { opacity: 1, y: 0 })
      return
    }

    const ctx = gsap.context(() => {
      gsap.from(items, {
        opacity: 0,
        y: 36,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: root,
          start: 'top 78%',
        },
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return ref
}

/** Subtle parallax: element drifts as it scrolls through the viewport. */
export function useParallax<T extends HTMLElement>(amount = 60) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReduced) return

    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -amount,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, el)

    return () => ctx.revert()
  }, [amount])

  return ref
}
