import { useEffect, useRef, useState } from 'react'
import { STATS } from '../data/constants'
import useCounter from '../hooks/useCounter'

function StatItem({ target, label, triggered }) {
  const count = useCounter(target, triggered)
  return (
    <div className="text-center">
      <div className="text-4xl md:text-5xl font-bold text-white leading-none mb-2">
        {count.toLocaleString()}+
      </div>
      <div className="text-sm text-white/80 font-medium">{label}</div>
    </div>
  )
}

export default function StatsCounter() {
  const [statsTriggered, setStatsTriggered] = useState(false)
  const statsRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={statsRef} className="py-20 px-4 bg-gradient-to-br from-blue-400 to-indigo-400 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
        {STATS.map((s) => (
          <StatItem key={s.id} target={s.target} label={s.label} triggered={statsTriggered} />
        ))}
      </div>
    </section>
  )
}

