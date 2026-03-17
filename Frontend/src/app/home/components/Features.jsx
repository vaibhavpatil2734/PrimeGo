import { FEATURES } from '../data/constants'
import { motion } from 'framer-motion'

export default function Features() {

  // Detect if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const cardVariants = {
    hiddenLeft: { opacity: 0, x: isMobile ? -50 : -20 + 'vw' },  // small offset on mobile
    hiddenRight: { opacity: 0, x: isMobile ? 50 : 20 + 'vw' },   // small offset on mobile
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: { 
        duration: 0.4,
        ease: 'easeOut',
        delay: custom * 0.1
      }
    })
  }

  return (
    <section className="relative py-20 px-4 bg-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-3">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Designed for Excellence
          </h2>
          <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
            Why MADE4UU is the preferred choice for personalized gifts. Quality, creativity, and customer satisfaction are our top priorities.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.slice(0,4).map((f, i) => {
            const initialVariant = i % 2 === 0 ? 'hiddenLeft' : 'hiddenRight'
            return (
              <motion.div
                key={i}
                custom={i}
                variants={cardVariants}
                initial={initialVariant}
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 text-center shadow-lg cursor-pointer hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-500"
              >
                <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 text-white text-3xl shadow-xl">
                  {f.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}