import { useEffect, useState } from 'react'
import productService from '../../services/product.service'

// Components
import HeroSection from './components/HeroSection'
import MarqueeBanner from './components/MarqueeBanner'
import Features from './components/Features'
import FeaturedProducts from './components/FeaturedProducts'
import StatsCounter from './components/StatsCounter'
import Testimonials from './components/Testimonials'
import AboutUs from '../../pages/Aboutus'


// Transform backend data to match ProductCard expectations
const transformProduct = (product) => ({
  id: product._id,
  name: product.title,
  img: product.images?.length > 0 ? product.images[0].url : '/placeholder.jpg',
  price: product.discountPrice && product.discountPrice > 0
    ? product.price - product.discountPrice
    : product.price,
  oldPrice: product.price,
  discount: product.discountPrice && product.discountPrice > 0
    ? Math.round((product.discountPrice / product.price) * 100)
    : 0,
  rating: product.rating || 0,
  reviews: product.reviewCount || 0,
})

// Sort products by discount (highest first)
const sortByDiscount = (products) => {
  return [...products].sort((a, b) => b.discount - a.discount)
}

// ── Main Home Component ───────────────────────────────────
export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch products from backend for hot deals (high %off)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        // Fetch more products to sort by discount client-side
        const result = await productService.getAll({ limit: 20, isActive: true })
        if (result.success) {
          const transformed = (result.data.products || []).map(transformProduct)
          // Sort by discount desc, take top 8
          const hotDeals = sortByDiscount(transformed).slice(0, 8)
          setProducts(hotDeals)
        }
      } catch (err) {
        console.error('Error fetching hot deals products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="font-sans">
      {/* Hero Section */}
      <HeroSection products={products} loading={loading} />

      {/* Marquee Banner */}
      <MarqueeBanner />

      {/* Features Section */}
      <Features />

      {/* Featured Products Section */}
      <FeaturedProducts 
        products={products} 
        loading={loading}
      />

      {/* Stats Counter Section */}
      <StatsCounter />

      {/* Testimonials Section */}
      <Testimonials />
      <AboutUs />
    </div>
  )

}

