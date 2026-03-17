import { MARQUEE_ITEMS } from '../data/constants'

export default function MarqueeBanner() {
  return (
    <div className="bg-gray-900 py-3 overflow-hidden relative">
      <div className="marquee flex whitespace-nowrap">
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-6 text-sm md:text-base font-extrabold tracking-wider uppercase text-gray-100"
          >
            {item}
            <span className="opacity-50 text-xs md:text-sm">◆</span>
          </span>
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-gray-900 pointer-events-none" />
      <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-gray-900 pointer-events-none" />

      <style>{`
        .marquee {
          display: inline-flex;
          animation: marquee 12s linear infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } /* Move half of duplicated content exactly */
        }
      `}</style>
    </div>
  )
}