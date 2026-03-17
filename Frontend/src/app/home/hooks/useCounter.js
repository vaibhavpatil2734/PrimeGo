import { useEffect, useState } from 'react'

// Hook for animated counter
export function useCounter(target, triggered) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!triggered) return
    let current = 0
    const step = target / 80
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setCount(Math.floor(current))
      if (current >= target) clearInterval(timer)
    }, 18)
    return () => clearInterval(timer)
  }, [triggered, target])
  return count
}

export default useCounter

