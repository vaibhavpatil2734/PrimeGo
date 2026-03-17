import { TESTIMONIALS } from '../data/constants'
import { useState, useEffect } from 'react'

// Custom hook for independent typing effect per card
function useTypingEffect(startIndex, totalMessages, step = 3) {
  const [textIndex, setTextIndex] = useState(startIndex % totalMessages)
  const [charIndex, setCharIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const typingSpeed = 50
  const deletingSpeed = 30
  const pauseTime = 1200

  useEffect(() => {
    let timeout
    const testimonial = TESTIMONIALS[textIndex % totalMessages].text

    if (!deleting && charIndex <= testimonial.length) {
      timeout = setTimeout(() => {
        setDisplayText(testimonial.slice(0, charIndex))
        setCharIndex((prev) => prev + 1)
      }, typingSpeed)
    } else if (!deleting && charIndex > testimonial.length) {
      timeout = setTimeout(() => setDeleting(true), pauseTime)
    } else if (deleting && charIndex >= 0) {
      timeout = setTimeout(() => {
        setDisplayText(testimonial.slice(0, charIndex))
        setCharIndex((prev) => prev - 1)
      }, deletingSpeed)
    } else if (deleting && charIndex < 0) {
      setDeleting(false)
      setTextIndex((prev) => (prev + step) % totalMessages)
      setCharIndex(0)
    }

    return () => clearTimeout(timeout)
  }, [charIndex, deleting, textIndex, totalMessages, step])

  return { displayText, testimonial: TESTIMONIALS[textIndex % totalMessages] }
}

export default function TestimonialsTyping() {
  const visibleCardsCount = 3
  const totalMessages = TESTIMONIALS.length

  const cardEffects = Array.from({ length: visibleCardsCount }).map((_, i) =>
    useTypingEffect(i, totalMessages, visibleCardsCount)
  )

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
          Reviews
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          What Our Customers Say
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">Real people, real stories.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {cardEffects.map(({ displayText, testimonial }, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg flex flex-col justify-start hover:-translate-y-1 hover:shadow-2xl transition-transform duration-300"
          >
            {/* Circle + Name Row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {testimonial.initial}
              </div>
              <div className="font-semibold text-gray-800 text-sm md:text-base">
                {testimonial.name}
              </div>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-4 text-amber-400 text-lg">
              {[...Array(5)].map((_, idx) => (
                <span key={idx}>★</span>
              ))}
            </div>

            {/* Typing Text */}
            <p className="text-sm md:text-base text-gray-600 leading-relaxed min-h-[80px]">
              {displayText}
              <span className="blinking-cursor">|</span>
            </p>
          </div>
        ))}
      </div>

      {/* Blinking cursor */}
      <style>{`
        .blinking-cursor {
          display: inline-block;
          width: 1px;
          background-color: black;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }
      `}</style>
    </section>
  )
}