import { Link } from 'react-router-dom'
import ProductCard from '../../../components/product/ProductCard'
import useReveal from '../hooks/useReveal'

export default function HotDeals({ products, loading }) {
  useReveal()

  return (
    <section id="hot-deals" className="py-20 px-4 bg-gradient-to-b from-orange-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 reveal opacity-0 translate-y-8 transition-all duration-700">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-orange-600 bg-orange-50 px-3 py-1 rounded-full mb-3">Today's Hot Deals</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Today's Maximum OFF Products</h2>
          <p className="text-gray-400 max-w-md mx-auto">Grab the biggest discounts available now!</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-10">
          {loading ? (
            <div className="col-span-full text-center py-10">Loading hot deals...</div>
          ) : (
            products.slice(0, 8).map((product, i) => (
              <div key={product.id} style={{ transitionDelay: `${(i % 3) * 100}ms` }}>
                <ProductCard product={product} />
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-10 reveal opacity-0 translate-y-8 transition-all duration-700">
          <Link
            to="/products"
            className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:from-orange-600 hover:to-orange-700 hover:shadow-3xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group"
          >
            View All Hot Deals <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
