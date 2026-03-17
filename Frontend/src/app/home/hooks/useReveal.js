import { useEffect } from 'react'

// Hook for reveal animations using IntersectionObserver
export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting)
          e.target.classList.add('opacity-100', 'translate-y-0')
      }),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
}

export default useReveal

