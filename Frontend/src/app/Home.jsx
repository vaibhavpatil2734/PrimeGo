import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/product/ProductCard'
import productService from '../services/product.service'

// ── FEATURES ──────────────────────────────────────────
const FEATURES = [
  { icon: '🎨', title: '100% Custom', desc: 'Names, photos, or graphics — laser-engraved and made uniquely yours.' },
  { icon: '🏆', title: 'Premium Quality', desc: 'High-grade stainless steel with double-walled vacuum insulation.' },
  { icon: '🚚', title: 'Fast Delivery', desc: 'Quick dispatch from Pune with free shipping on orders above ₹999.' },
  { icon: '🌿', title: 'Eco-Conscious', desc: 'Reduce single-use plastic while enjoying drinks at perfect temperature.' },
]

const TESTIMONIALS = [
  { initial: 'P', name: 'Priya S.', location: 'Pune, Maharashtra', text: '"Ordered a custom tumbler for my husband\'s birthday and he absolutely loved it! The engraving quality is top-notch and delivery was super fast."' },
  { initial: 'R', name: 'Rahul M.', location: 'Mumbai, Maharashtra', text: '"Best gifting store in Pune! Ordered the vacuum flask set for my office team — packaging was beautiful and everyone was impressed."' },
  { initial: 'A', name: 'Aisha K.', location: 'Nashik, Maharashtra', text: '"The Stanley tumbler is absolutely gorgeous — exactly as shown. Customer support was super responsive on WhatsApp. 10/10 recommend!"' },
]

const STATS = [
  { id: 'stat1', target: 1000, label: 'Happy Customers' },
  { id: 'stat2', target: 5000, label: 'Products Delivered' },
  { id: 'stat3', target: 500,  label: '5-Star Reviews' },
  { id: 'stat4', target: 25,   label: 'Cities Served' },
]

const MARQUEE_ITEMS = [
  'Personalized Tumblers', 'Custom Gift Sets', 'Stanley Collection',
  'Free Engraving', 'Pune Delivery', 'Gifts With Love',
]

// ── Reveal Hook ───────────────────────────────────────────
function useReveal() {
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

// ── Counter Hook ──────────────────────────────────────────
function useCounter(target, triggered) {
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

// Transform backend data to match ProductCard expectations
const transformProduct = (product) => ({
  id: product._id,
  name: product.title,
  img: product.images?.length > 0 ? product.images[0].url : '/placeholder.jpg',
  price: product.discountPrice && product.discountPrice > 0
    ? product.price - product.discountPrice
    : product.price,
  oldPrice: product.price,
  rating: product.rating || 0,
  reviews: product.reviewCount || 0,
})

// ── Main Home Component ───────────────────────────────────
export default function Home() {
  const [statsTriggered, setStatsTriggered] = useState(false)
  const [likedProducts, setLikedProducts] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const statsRef = useRef(null)
  useReveal()

  const toggleLike = (id) => {
    if (likedProducts.includes(id)) {
      setLikedProducts(likedProducts.filter(item => item !== id))
    } else {
      setLikedProducts([...likedProducts, id])
    }
  }

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const result = await productService.getFeatured(8)
        if (result.success) {
          const transformed = (result.data.products || []).map(transformProduct)
          setProducts(transformed)
        }
      } catch (err) {
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Trigger stat counters
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
    <div className="font-sans">

            {/* ── Hero ──────────────────────────────── */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-indigo-50 to-white pt-28 pb-16 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-200 rounded-full opacity-20 blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-200 rounded-full opacity-20 blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              New Collection Available
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-5">
              Custom Made for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Only You.
              </span>
            </h1>

            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Experience premium personalized hydration. Laser-engraved tumblers, vacuum-insulated bottles, and thoughtful gift sets — crafted just for you.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link
                to="/products"
                className="px-6 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 hover:-translate-y-1 transition-all duration-200"
              >
                Explore More
              </Link>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><span className="text-amber-400">★★★★★</span> 500+ Reviews</span>
              <span className="flex items-center gap-1.5">🚚 Free Shipping ₹999+</span>
              <span className="flex items-center gap-1.5">🎨 100% Customizable</span>
            </div>
          </div>

          {/* Right - Hero Image */}
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-100 animate-fade-in-up animation-delay-300">
            <img
              src="https://made4uu.com/cdn/shop/files/Cream_Minimalist_Promo_New_Tumbler_Collection_Instagram_Post_1600_x_700_px.png"
              alt="Tumbler Collection"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Marquee ───────────────────────────── */}
      <div className="bg-gray-900 py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6 text-xs font-bold tracking-widest uppercase text-gray-400">
              {item}
              <span className="opacity-30 text-[8px]">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ──────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal opacity-0 translate-y-8 transition-all duration-700">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Designed for Excellence</h2>
            <p className="text-gray-400 max-w-md mx-auto">Why MADE4UU is the preferred choice for personalized gifts.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`reveal opacity-0 translate-y-8 transition-all duration-700 bg-white border border-gray-100 rounded-2xl p-6 text-center hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-400 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* (kept unchanged for brevity in explanation — everything same as you provided) */}

      {/* ── Products ──────────────────────────── */}
      <section id="featured-products" className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal opacity-0 translate-y-8 transition-all duration-700">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">Best Sellers</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Best-Selling Gifts</h2>
            <p className="text-gray-400 max-w-md mx-auto">Curated with love, designed for you.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
            {loading ? (
              <div className="col-span-full text-center py-10">Loading products...</div>
            ) : (
              products.slice(0, 4).map((product, i) => (
                <div key={product.id} style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                  <ProductCard
                    product={product}
                    likedProducts={likedProducts}
                    toggleLike={toggleLike}
                  />
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10 reveal opacity-0 translate-y-8 transition-all duration-700">
            <a
              href="https://made4uu.com/collections/all"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
            >
              View All Products →
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────── */}
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

      {/* ── Testimonials ──────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 reveal opacity-0 translate-y-8 transition-all duration-700">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">Reviews</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
            <p className="text-gray-400 max-w-md mx-auto">Real people, real stories.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="reveal opacity-0 translate-y-8 transition-all duration-700 bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="text-amber-400 tracking-wider mb-4">★★★★★</div>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-800">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Newsletter ──────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="reveal opacity-0 translate-y-8 transition-all duration-700 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-52 h-52 bg-white opacity-5 rounded-full -translate-y-1/3 translate-x-1/3" />
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-blue-100 bg-white/10 px-3 py-1 rounded-full mb-4">Stay Connected</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Get Exclusive Deals &amp; New Arrivals</h2>
            <p className="text-blue-100 mb-8 text-sm">Subscribe on WhatsApp &amp; get 10% off your first order!</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input
                type="tel"
                placeholder="Your WhatsApp number"
                className="flex-1 px-5 py-3 rounded-full text-sm outline-none text-gray-800 placeholder-gray-400"
              />
              <button className="px-6 py-3 rounded-full bg-white text-blue-600 font-bold text-sm hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200 whitespace-nowrap">
                Subscribe →
              </button>
            </div>
            <p className="text-blue-200 text-xs mt-4">No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      

      {/* ── WhatsApp Float ────────────────────── */}
      <a
        href="https://wa.me/918552062200?text=Hi!%20I%20have%20a%20question%20about%20your%20products."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-13 h-13 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200 hover:scale-110 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-200 transition-all duration-200"
        aria-label="Chat on WhatsApp"
        style={{ width: 52, height: 52 }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      </a>


    </div>
  )
}




