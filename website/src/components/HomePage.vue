<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { Search, MapPin, User, Heart, ShoppingCart, Star, Clock, Percent, Home, ChevronRight, Filter, Bell, Menu, X, Plus, Minus, Check, AlertCircle, Sparkles, Zap, Gift,Loader2  } from 'lucide-vue-next'


const API_KEY = "BEZHK7iMmhfnXgrL50JIQOdjLqJJBTPUMw3ugHNeDX6H7NpsOpBzNWie"

async function fetchRandomImage(query) {
  const res = await fetch(`https://api.pexels.com/v1/search?query=food,south indian${encodeURIComponent(query)}&per_page=50`, {
    headers: { Authorization: API_KEY }
  })
  const data = await res.json()
  if (data.photos?.length) {
    const randomPhoto = data.photos[Math.floor(Math.random() * data.photos.length)]
    return randomPhoto.src.medium
  }
  return null
}

onMounted(async () => {
  for (const product of allProducts.value) {
    const url = await fetchRandomImage(product.image)
    if (url) product.image = url
  }
})



// State
const locationLoading = ref(false) // add this for location loading status
const location = ref('Detecting location...')
const searchQuery = ref('')
const isLocationDetected = ref(false)
const currentUser = ref(null)
const cartItems = ref([])
const favoriteItems = ref(new Set())
const isLoading = ref(false)
const showMobileMenu = ref(false)
const showNotifications = ref(false)
const selectedCategory = ref('all')
const sortBy = ref('popular')
const currentPage = ref(1)
const itemsPerPage = 8

// Toast state
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Offers
const offers = ref([
  { id: 1, title: '60% OFF', subtitle: 'UPTO ₹120', description: 'On all orders above ₹299', gradient: 'from-slate-800 via-slate-700 to-slate-900', icon: Percent, code: 'SAVE60', validUntil: '2024-12-31', isNew: true },
  { id: 2, title: 'BUY 1 GET 1', subtitle: 'FREE', description: 'On selected biryanis', gradient: 'from-emerald-600 via-emerald-700 to-emerald-900', icon: Gift, code: 'BOGO', validUntil: '2024-11-30', isNew: false },
  { id: 3, title: 'FLAT ₹100 OFF', subtitle: 'NEW USER', description: 'On your first order', gradient: 'from-violet-600 via-violet-700 to-violet-900', icon: Sparkles, code: 'WELCOME100', validUntil: '2024-12-15', isNew: true },
  { id: 4, title: 'FLASH DEAL', subtitle: '⚡ 2 HOURS', description: '40% off on all desserts', gradient: 'from-orange-500 via-orange-600 to-orange-700', icon: Zap, code: 'FLASH40', validUntil: '2024-08-10T23:59:59', isNew: true, isFlash: true }
])

const categories = ref([
  { id: 'all', name: 'All Items', icon: '🍽️', count: '30+ items', color: 'bg-gray-50 border-gray-200 hover:bg-gray-100' },
  { id: 'south-indian', name: 'South Indian', icon: '🥥', count: '11 items', color: 'bg-amber-50 border-amber-200 hover:bg-amber-100' },
  { id: 'குழம்பு வகைகள்', name: 'குழம்பு வகைகள்', icon: '🍲', count: '4 items', color: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
  { id: 'ரசம் வகைகள்', name: 'ரசம் வகைகள்', icon: '🥣', count: '4 items', color: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
  { id: 'கூட்டு/பொரியல் வகைகள்', name: 'கூட்டு/பொரியல் வகைகள்', icon: '🥗', count: '4 items', color: 'bg-green-50 border-green-200 hover:bg-green-100' }
])


// Products
const allProducts = ref([
  { id: 1, name: 'Drumstick Sambar', description: 'Traditional South Indian lentil stew with drumstick and aromatic spices', price: 25, originalPrice: 30, rating: 4.6, reviewCount: 120, time: '10-15 mins', image: 'sambar,southindian,curry', isVeg: true, discount: 17, category: 'south-indian', tags: ['vegetarian', 'traditional', 'comfort food'], calories: 150, serves: '1 person', customizable: false },
  { id: 2, name: 'Kalyana Sambar', description: 'Special wedding-style sambar rich in spices and flavor', price: 25, originalPrice: 30, rating: 4.7, reviewCount: 95, time: '10-15 mins', image: 'indian,curry,lentil', isVeg: true, discount: 17, category: 'south-indian', tags: ['special', 'vegetarian', 'flavourful'], calories: 155, serves: '1 person', customizable: false },
  { id: 3, name: 'Kadhamba Sambar', description: 'Mixed vegetable sambar with a medley of flavors', price: 25, originalPrice: 30, rating: 4.5, reviewCount: 85, time: '10-15 mins', image: 'vegetable,curry,indian', isVeg: true, discount: 17, category: 'south-indian', tags: ['vegetable', 'healthy', 'vegetarian'], calories: 160, serves: '1 person', customizable: false },
  { id: 4, name: 'Vattha Kuzhambu', description: 'Tangy tamarind-based kuzhambu with aromatic spices', price: 25, originalPrice: 30, rating: 4.6, reviewCount: 105, time: '8-12 mins', image: 'tamarind,curry,southindian', isVeg: true, discount: 17, category: 'south-indian', tags: ['tangy', 'traditional', 'vegetarian'], calories: 140, serves: '1 person', customizable: false },
  { id: 5, name: 'Mor Kuzhambu', description: 'Buttermilk-based curry with a light tangy taste', price: 25, originalPrice: 30, rating: 4.5, reviewCount: 90, time: '8-12 mins', image: 'buttermilk,curry,indianfood', isVeg: true, discount: 17, category: 'south-indian', tags: ['light', 'vegetarian', 'cooling'], calories: 130, serves: '1 person', customizable: false },
  { id: 6, name: 'Tomato Kuzhambu', description: 'Spicy and tangy tomato-based curry', price: 25, originalPrice: 30, rating: 4.4, reviewCount: 78, time: '8-12 mins', image: 'tomato,curry,indianfood', isVeg: true, discount: 17, category: 'south-indian', tags: ['tangy', 'spicy', 'vegetarian'], calories: 135, serves: '1 person', customizable: false },
  { id: 7, name: 'Paruppu Rasam', description: 'Lentil-based rasam with mild spices', price: 25, originalPrice: 30, rating: 4.5, reviewCount: 88, time: '7-10 mins', image: 'rasam,indianfood,lentil', isVeg: true, discount: 17, category: 'south-indian', tags: ['comfort food', 'vegetarian', 'mild'], calories: 120, serves: '1 person', customizable: false },
  { id: 8, name: 'Pepper Rasam', description: 'Spicy rasam made with black pepper for a soothing flavor', price: 25, originalPrice: 30, rating: 4.6, reviewCount: 92, time: '7-10 mins', image: 'pepper,rasam,spicy', isVeg: true, discount: 17, category: 'south-indian', tags: ['spicy', 'soothing', 'vegetarian'], calories: 125, serves: '1 person', customizable: false },
  { id: 9, name: 'Tomato Rasam', description: 'Tangy tomato-based rasam with aromatic spices', price: 25, originalPrice: 30, rating: 4.5, reviewCount: 81, time: '7-10 mins', image: 'tomato,rasam,indiancurry', isVeg: true, discount: 17, category: 'south-indian', tags: ['tangy', 'spicy', 'vegetarian'], calories: 130, serves: '1 person', customizable: false },
  { id: 10, name: 'Garlic Rasam', description: 'Rasam infused with garlic for a unique flavor', price: 25, originalPrice: 30, rating: 4.6, reviewCount: 85, time: '7-10 mins', image: 'garlic,indianfood,spices', isVeg: true, discount: 17, category: 'south-indian', tags: ['garlic', 'spicy', 'vegetarian'], calories: 128, serves: '1 person', customizable: false },
  { id: 11, name: 'Baby Corn Rasam', description: 'Unique rasam with baby corn and spices', price: 25, originalPrice: 30, rating: 4.4, reviewCount: 70, time: '7-10 mins', image: 'corn,indianfood,vegetable', isVeg: true, discount: 17, category: 'south-indian', tags: ['unique', 'vegetarian', 'spicy'], calories: 135, serves: '1 person', customizable: false },
  // குழம்பு வகைகள்
  { id: 1, name: 'பாரம்பரிய சாம்பார்', description: 'பாரம்பரிய முறையில் தயாரிக்கப்பட்ட சாம்பார், காய்கறிகளுடன்', price: 25, originalPrice: 30, rating: 4.6, reviewCount: 120, time: '10-15 நிமிடங்கள்', image: 'sambar,tamilfood,southindian', isVeg: true, discount: 17, category: 'குழம்பு வகைகள்', tags: ['சைவம்', 'பாரம்பரியம்', 'சுவையானது'], calories: 150, serves: '1 பேர்', customizable: false },
  { id: 2, name: 'வத்தக்குழம்பு', description: 'புளிப்பும் காரமும் நிறைந்த வத்தக்குழம்பு', price: 25, originalPrice: 30, rating: 4.5, reviewCount: 95, time: '10-15 நிமிடங்கள்', image: 'tamarind,curry,traditional', isVeg: true, discount: 17, category: 'குழம்பு வகைகள்', tags: ['புளிப்பு', 'காரம்', 'சைவம்'], calories: 145, serves: '1 பேர்', customizable: false },
  { id: 3, name: 'மோர் குழம்பு', description: 'தயிர் மற்றும் மசாலாவுடன் சுவையான மோர் குழம்பு', price: 25, originalPrice: 30, rating: 4.5, reviewCount: 88, time: '8-12 நிமிடங்கள்', image: 'yogurt,curry,indianfood', isVeg: true, discount: 17, category: 'குழம்பு வகைகள்', tags: ['சைவம்', 'தயிர்', 'இளஞ்சுவை'], calories: 130, serves: '1 பேர்', customizable: false },
  { id: 4, name: 'கடம்பக் குழம்பு', description: 'பல்வேறு காய்கறிகளுடன் தயாரிக்கப்படும் கடம்பக் குழம்பு', price: 25, originalPrice: 30, rating: 4.4, reviewCount: 80, time: '8-12 நிமிடங்கள்', image: 'mixedvegetable,curry,southindian', isVeg: true, discount: 17, category: 'குழம்பு வகைகள்', tags: ['காய்கறி', 'சைவம்', 'பாரம்பரியம்'], calories: 155, serves: '1 பேர்', customizable: false },

  // ரசம் வகைகள்
  { id: 5, name: 'பருப்பு ரசம்', description: 'பருப்பும் மசாலாவும் கலந்து தயாரிக்கப்பட்ட ரசம்', price: 25, originalPrice: 30, rating: 4.6, reviewCount: 110, time: '7-10 நிமிடங்கள்', image: 'dal,rasam,southindian', isVeg: true, discount: 17, category: 'ரசம் வகைகள்', tags: ['சைவம்', 'மிதமான காரம்', 'பாரம்பரியம்'], calories: 120, serves: '1 பேர்', customizable: false },
  { id: 6, name: 'மிளகு ரசம்', description: 'மிளகுத்தூள் மற்றும் மசாலா கலந்த காரமான ரசம்', price: 25, originalPrice: 30, rating: 4.7, reviewCount: 98, time: '7-10 நிமிடங்கள்', image: 'blackpepper,soup,indianfood', isVeg: true, discount: 17, category: 'ரசம் வகைகள்', tags: ['காரம்', 'சைவம்', 'ஆரோக்கியம்'], calories: 125, serves: '1 பேர்', customizable: false },
  { id: 7, name: 'தக்காளி ரசம்', description: 'புதிய தக்காளியுடன் தயாரிக்கப்படும் ரசம்', price: 25, originalPrice: 30, rating: 4.5, reviewCount: 85, time: '7-10 நிமிடங்கள்', image: 'tomatosoup,rasam,tangy', isVeg: true, discount: 17, category: 'ரசம் வகைகள்', tags: ['தக்காளி', 'புளிப்பு', 'சைவம்'], calories: 130, serves: '1 பேர்', customizable: false },
  { id: 8, name: 'பூண்டு ரசம்', description: 'பூண்டு சுவையுடன் காரமான ரசம்', price: 25, originalPrice: 30, rating: 4.4, reviewCount: 70, time: '7-10 நிமிடங்கள்', image: 'garlic,soup,spicy', isVeg: true, discount: 17, category: 'ரசம் வகைகள்', tags: ['பூண்டு', 'காரம்', 'சைவம்'], calories: 128, serves: '1 பேர்', customizable: false },

  // கூட்டு / பொரியல் வகைகள்
  { id: 9, name: 'உளுந்தங்காய் கூட்டு', description: 'உளுந்தங்காயும் தேங்காயும் சேர்த்து தயாரிக்கும் கூட்டு', price: 30, originalPrice: 35, rating: 4.6, reviewCount: 90, time: '10-15 நிமிடங்கள்', image: 'ridgegourd,coconut,curry', isVeg: true, discount: 14, category: 'கூட்டு/பொரியல் வகைகள்', tags: ['சைவம்', 'தேங்காய்', 'பாரம்பரியம்'], calories: 140, serves: '1 பேர்', customizable: false },
  { id: 10, name: 'பீன்ஸ் பொரியல்', description: 'புதிய பீன்ஸுடன் சுவையான பொரியல்', price: 30, originalPrice: 35, rating: 4.5, reviewCount: 75, time: '10-15 நிமிடங்கள்', image: 'greenbeans,stirfry,vegetable', isVeg: true, discount: 14, category: 'கூட்டு/பொரியல் வகைகள்', tags: ['சைவம்', 'ஆரோக்கியம்', 'காய்கறி'], calories: 135, serves: '1 பேர்', customizable: false },
  { id: 11, name: 'கோசு பொரியல்', description: 'மென்மையான கோசுவுடன் எளிய பொரியல்', price: 30, originalPrice: 35, rating: 4.4, reviewCount: 68, time: '8-12 நிமிடங்கள்', image: 'cabbage,stirfry,indianfood', isVeg: true, discount: 14, category: 'கூட்டு/பொரியல் வகைகள்', tags: ['சைவம்', 'எளிமை', 'காய்கறி'], calories: 125, serves: '1 பேர்', customizable: false },
  { id: 12, name: 'கேரட் கூட்டு', description: 'கேரட் மற்றும் தேங்காயுடன் சுவையான கூட்டு', price: 30, originalPrice: 35, rating: 4.5, reviewCount: 80, time: '8-12 நிமிடங்கள்', image: 'carrot,coconut,curry', isVeg: true, discount: 14, category: 'கூட்டு/பொரியல் வகைகள்', tags: ['சைவம்', 'தேங்காய்', 'காய்கறி'], calories: 130, serves: '1 பேர்', customizable: false }
])


// Computed
const filteredProducts = computed(() => {
  let filtered = allProducts.value
  if (selectedCategory.value !== 'all') filtered = filtered.filter(p => p.category === selectedCategory.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(tag => tag.includes(q)))
  }
  switch (sortBy.value) {
    case 'price-low': filtered.sort((a, b) => a.price - b.price); break
    case 'price-high': filtered.sort((a, b) => b.price - a.price); break
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break
    case 'time': filtered.sort((a, b) => parseInt(a.time) - parseInt(b.time)); break
    default: filtered.sort((a, b) => b.reviewCount - a.reviewCount)
  }
  return filtered
})

const paginatedProducts = computed(() => filteredProducts.value.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage))
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const cartCount = computed(() => cartItems.value.reduce((t, i) => t + i.quantity, 0))
const cartTotal = computed(() => cartItems.value.reduce((t, i) => t + i.price * i.quantity, 0))

// Methods
const showToastMessage = (message, type = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 3000)
}


const detectLocation = async () => {
  if (!navigator.geolocation) {
    location.value = 'Select your location'
    showToastMessage('Geolocation not supported by this browser', 'error')
    return
  }

  locationLoading.value = true
  location.value = 'Detecting...'
  isLoading.value = true

  try {
    const position = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })
    )

    const { latitude, longitude } = position.coords

    // Call OpenStreetMap Nominatim reverse geocoding API
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    )
    const data = await response.json()

    if (data && data.display_name) {
      location.value = data.display_name
      isLocationDetected.value = true
      showToastMessage('Location detected successfully!', 'success')
    } else {
      location.value = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
      isLocationDetected.value = true
      showToastMessage('Location detected (no address found)', 'warning')
    }
  } catch (error) {
    location.value = 'Select your location'
    isLocationDetected.value = false
    showToastMessage('Could not detect location. Please select manually.', 'error')
  } finally {
    locationLoading.value = false
    isLoading.value = false
  }
}



const toggleFavorite = id => {
  favoriteItems.value.has(id) ? (favoriteItems.value.delete(id), showToastMessage('Removed from favorites', 'info')) : (favoriteItems.value.add(id), showToastMessage('Added to favorites!', 'success'))
}

const addToCart = (product, qty = 1) => {
  const item = cartItems.value.find(i => i.id === product.id)
  if (item) item.quantity += qty
  else cartItems.value.push({ ...product, quantity: qty })
  showToastMessage(`${product.name} added to cart!`, 'success')
}

const removeFromCart = id => {
  cartItems.value = cartItems.value.filter(i => i.id !== id)
  showToastMessage('Item removed from cart', 'info')
}

const updateCartQuantity = (id, qty) => qty <= 0 ? removeFromCart(id) : (cartItems.value.find(i => i.id === id).quantity = qty)
const selectCategory = id => { selectedCategory.value = id; currentPage.value = 1 }
const loadMore = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const copyOfferCode = code => navigator.clipboard.writeText(code).then(() => showToastMessage(`Code ${code} copied!`, 'success'))

// Watchers
watch(searchQuery, () => currentPage.value = 1)

onMounted(async () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 800, easing: 'ease-out-cubic', once: true, offset: 50, delay: 100 })
  }
  await nextTick()
})
</script>


<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 relative">
    <!-- Toast Notification -->
    <Transition enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showToast" class="fixed top-4 right-4 z-[100] max-w-sm">
        <div :class="{
            'bg-emerald-500': toastType === 'success',
            'bg-red-500': toastType === 'error',
            'bg-blue-500': toastType === 'info'
          }" class="text-white px-6 py-4 rounded-2xl shadow-lg flex items-center space-x-3">
          <Check v-if="toastType === 'success'" class="w-5 h-5" />
          <AlertCircle v-else class="w-5 h-5" />
          <span class="font-medium">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>

    <!-- Enhanced Header -->
    <header class="sticky top-0 z-50 backdrop-blur-xl bg-white/90 border-b border-gray-100 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4" data-aos="fade-right">
            <div class="relative">
              <div
                class="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center shadow-xl shadow-gray-900/25 ring-2 ring-white">
                <span class="text-white font-bold text-xl tracking-tight">MS</span>
              </div>
              <div
                class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-white shadow-lg animate-pulse">
              </div>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 tracking-tight">MS Kitchen</h1>
              <p class="text-sm text-gray-500 font-medium">Premium Takeaway</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Desktop Navigation -->
            <div class="hidden lg:flex items-center space-x-4">
              <button @click="showNotifications = !showNotifications"
                class="relative p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 group">
                <Bell class="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                <span
                  class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">3</span>
              </button>

              <button class="relative p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 group"
                @click="() => {}">
                <Heart :class="favoriteItems.size > 0 ? 'text-red-500' : 'text-gray-600'"
                  class="w-6 h-6 group-hover:scale-110 transition-all duration-200" />
                <span v-if="favoriteItems.size > 0"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{{
                  favoriteItems.size }}</span>
              </button>

              <button class="relative p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 group">
                <ShoppingCart class="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
                <span v-if="cartCount > 0"
                  class="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">{{
                  cartCount }}</span>
              </button>

              <div class="w-px h-8 bg-gray-200"></div>

              <button
                class="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5 transform">
                Sign In
              </button>
            </div>

            <!-- Mobile Menu Button -->
            <button @click="showMobileMenu = !showMobileMenu"
              class="lg:hidden w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg shadow-gray-900/20 hover:shadow-xl transition-all duration-300">
              <Menu v-if="!showMobileMenu" class="w-6 h-6 text-white" />
              <X v-else class="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-1"
          enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
          <div v-show="showMobileMenu"
            class="lg:hidden mt-4 p-4 bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100">
            <div class="flex flex-col space-y-3">
              <button class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span class="font-medium text-gray-900">Favorites</span>
                <div class="flex items-center space-x-2">
                  <Heart class="w-5 h-5 text-red-500" />
                  <span class="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">{{ favoriteItems.size }}</span>
                </div>
              </button>
              <button class="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <span class="font-medium text-gray-900">Cart</span>
                <div class="flex items-center space-x-2">
                  <ShoppingCart class="w-5 h-5 text-gray-600" />
                  <span class="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{{ cartCount }}</span>
                </div>
              </button>
              <button
                class="w-full p-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-8">
      <!-- Enhanced Location & Search Section -->
      <div class="mb-12" data-aos="fade-up">
        <div class="flex items-center justify-between mb-8 ">
          <div class="flex items-center space-x-3 cursor-pointer group" @click="detectLocation">
            <div
              class="relative w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:from-gray-200 group-hover:to-gray-300 transition-all duration-300">
              <MapPin :class="locationLoading ? 'animate-pulse' : ''" class="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900 flex items-center space-x-2">
                <span>Deliver to</span>
                <Sparkles v-if="isLocationDetected && !locationLoading" class="w-4 h-4 text-emerald-500" />
                <!-- Show loader next to text when loading -->
                <Loader2 v-if="locationLoading" class="w-4 h-4 text-gray-600 animate-spin" />
              </p>
              <p class="text-sm text-gray-600 font-medium">{{ location }}</p>
            </div>
            <ChevronRight
              class="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
          </div>


          <div class="lg:hidden">
            <button class="relative p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <ShoppingCart class="w-6 h-6 text-gray-700" />
              <span v-if="cartCount > 0"
                class="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">{{
                cartCount }}</span>
            </button>
          </div>
        </div>

        <!-- Enhanced Search Bar -->
        <div class="relative max-w-2xl mx-auto mb-6">
          <div class="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
            <Search class="w-5 h-5 text-gray-400" />
          </div>
          <input v-model="searchQuery" type="text" placeholder="Search for dishes, cuisines, restaurants..."
            class="w-full pl-16 pr-32 py-6 rounded-3xl border border-gray-200 focus:ring-4 focus:ring-gray-900/10 focus:border-gray-900 outline-none text-gray-700 placeholder-gray-400 bg-white shadow-sm hover:shadow-md transition-all duration-300 text-lg font-medium">
          <div class="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
            <select v-model="sortBy"
              class="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-xl border-0 outline-none hover:bg-gray-200 transition-colors">
              <option value="popular">Popular</option>
              <option value="rating">Rating</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="time">Delivery Time</option>
            </select>
            <button class="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Filter class="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <!-- Enhanced Offers Section -->
      <div class="mb-16" data-aos="fade-up" data-aos-delay="100">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight flex items-center space-x-3">
            <span>Exclusive Offers</span>
            <Sparkles class="w-8 h-8 text-yellow-500 animate-pulse" />
          </h2>
          <button class="text-gray-600 hover:text-gray-900 font-semibold flex items-center space-x-2 group">
            <span>View All</span>
            <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div class="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          <div v-for="(offer, index) in offers" :key="offer.id" :data-aos="'fade-right'"
            :data-aos-delay="100 * (index + 1)" @click="copyOfferCode(offer.code)"
            :class="`bg-gradient-to-br ${offer.gradient}`"
            class="relative flex-shrink-0 w-80 h-48 rounded-3xl p-8 text-white shadow-xl cursor-pointer transform hover:scale-[1.02] transition-all duration-500 hover:shadow-2xl overflow-hidden group">
            <!-- Animated background pattern -->
            <div class="absolute inset-0 opacity-10">
              <div class="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl"></div>
              <div class="absolute top-4 right-4 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
              <div class="absolute bottom-4 left-4 w-20 h-20 bg-white/5 rounded-full animate-pulse delay-300"></div>
            </div>

            <!-- New/Flash badge -->
            <div v-if="offer.isNew || offer.isFlash" class="absolute top-4 left-4 z-10">
              <div :class="offer.isFlash ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'"
                class="px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                {{ offer.isFlash ? '⚡ FLASH' : '✨ NEW' }}
              </div>
            </div>

            <div class="relative z-10 flex justify-between items-start h-full">
              <div class="flex flex-col justify-between h-full">
                <div>
                  <h3 class="text-2xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300">{{
                    offer.title }}</h3>
                  <p class="text-lg font-semibold opacity-90 mb-1">{{ offer.subtitle }}</p>
                  <p class="text-sm opacity-80 font-medium mb-3">{{ offer.description }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <code
                    class="bg-white/20 px-3 py-1 rounded-lg text-sm font-mono font-bold backdrop-blur-sm">{{ offer.code }}</code>
                  <span class="text-xs opacity-70">Tap to copy</span>
                </div>
              </div>
              <div
                class="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:rotate-12 transition-transform duration-500">
                <component :is="offer.icon" class="w-8 h-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Categories -->
      <div class="mb-16" data-aos="fade-up" data-aos-delay="200">
        <h2 class="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Browse Categories</h2>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          <div v-for="(category, index) in categories" :key="category.id" :data-aos="'fade-up'"
            :data-aos-delay="50 * (index + 1)" @click="selectCategory(category.id)" :class="[
              category.color,
              selectedCategory === category.id ? 'ring-2 ring-gray-900 bg-opacity-100' : ''
            ]"
            class="flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:-translate-y-1">
            <div
              class="w-16 h-16 rounded-2xl bg-white/60 backdrop-blur-sm flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
              {{ category.icon }}
            </div>
            <h3 class="text-sm font-bold text-center mb-2 text-gray-900">{{ category.name }}</h3>
            <p class="text-xs text-gray-600 font-medium">{{ category.count }}</p>
          </div>
        </div>
      </div>

      <!-- Enhanced Products Grid -->
      <div class="mb-16" data-aos="fade-up" data-aos-delay="300">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-bold text-gray-900 tracking-tight">
            {{selectedCategory === 'all' ? 'Popular Dishes' : categories.find(c => c.id === selectedCategory)?.name ||
            'Dishes' }}
            <span class="text-xl text-gray-500 font-normal ml-2">({{ filteredProducts.length }} items)</span>
          </h2>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">Page {{ currentPage }} of {{ totalPages }}</span>
            <button class="text-gray-600 hover:text-gray-900 font-semibold flex items-center space-x-2 group">
              <span>View All</span>
              <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-8">
          <div v-for="(product, index) in paginatedProducts" :key="product.id" :data-aos="'fade-up'"
            :data-aos-delay="100 * ((index % 4) + 1)"
            class="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 group hover:-translate-y-2">
            <!-- Enhanced Image Container -->
            <div class="relative overflow-hidden">
              <img :src="product.image" :alt="product.name"
                class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy">

              <!-- Enhanced Overlay Gradient -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              </div>

              <!-- Veg/Non-veg Indicator -->
              <div class="absolute top-4 left-4 z-10">
                <div :class="product.isVeg ? 'bg-emerald-500 shadow-emerald-500/25' : 'bg-red-500 shadow-red-500/25'"
                  class="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg">
                  <div class="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>

              <!-- Discount Badge -->
              <div v-if="product.discount"
                class="absolute top-4 right-4 z-10 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg backdrop-blur-sm">
                {{ product.discount }}% OFF
              </div>

              <!-- Tags -->
              <div class="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1">
                <span v-for="tag in product.tags.slice(0, 2)" :key="tag"
                  class="bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded-lg backdrop-blur-sm">
                  {{ tag }}
                </span>
              </div>

              <!-- Enhanced Favorite Button -->
              <button @click="toggleFavorite(product.id)"
                class="absolute bottom-4 right-4 z-10 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg hover:bg-white transition-all duration-300 group/fav hover:scale-110">
                <Heart :class="favoriteItems.has(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-700'"
                  class="w-5 h-5 group-hover/fav:scale-110 transition-all duration-200" />
              </button>
            </div>

            <!-- Enhanced Content -->
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-bold text-xl text-gray-900 group-hover:text-gray-700 transition-colors flex-1 pr-2">{{
                  product.name }}</h3>
                <div v-if="product.customizable"
                  class="text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-1 rounded-lg">
                  Customizable
                </div>
              </div>

              <p class="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{{ product.description }}</p>

              <!-- Enhanced Stats Row -->
              <div class="flex items-center justify-between mb-4 text-sm">
                <div class="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-xl">
                  <Star class="w-4 h-4 fill-emerald-500 text-emerald-500" />
                  <span class="font-bold text-emerald-700">{{ product.rating }}</span>
                  <span class="text-emerald-600">({{ product.reviewCount }})</span>
                </div>
                <div class="flex items-center space-x-2 text-gray-500">
                  <Clock class="w-4 h-4" />
                  <span class="font-medium">{{ product.time }}</span>
                </div>
              </div>

              <!-- Additional Info -->
              <div class="flex items-center justify-between mb-6 text-xs text-gray-500">
                <span>🔥 {{ product.calories }} cal</span>
                <span>👥 {{ product.serves }}</span>
              </div>

              <!-- Enhanced Price & Add Section -->
              <div class="flex items-center justify-between">
                <div class="flex flex-col">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="text-2xl font-bold text-gray-900">₹{{ product.price }}</span>
                    <span v-if="product.originalPrice > product.price"
                      class="text-sm text-gray-400 line-through font-medium">₹{{ product.originalPrice }}</span>
                  </div>
                  <span v-if="product.originalPrice > product.price" class="text-xs text-emerald-600 font-medium">
                    Save ₹{{ product.originalPrice - product.price }}
                  </span>
                </div>

                <!-- Cart Controls or Add Button -->
                <div v-if="cartItems.find(item => item.id === product.id)" class="flex items-center space-x-2">
                  <button
                    @click="updateCartQuantity(product.id, cartItems.find(item => item.id === product.id).quantity - 1)"
                    class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Minus class="w-4 h-4 text-gray-600" />
                  </button>
                  <span class="text-lg font-bold text-gray-900 min-w-[2rem] text-center">
                    {{cartItems.find(item => item.id === product.id).quantity}}
                  </span>
                  <button
                    @click="updateCartQuantity(product.id, cartItems.find(item => item.id === product.id).quantity + 1)"
                    class="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center hover:bg-gray-800 transition-colors">
                    <Plus class="w-4 h-4" />
                  </button>
                </div>

                <button v-else @click="addToCart(product)"
                  class="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold text-sm rounded-2xl transition-all duration-300 hover:from-gray-800 hover:to-gray-700 hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5 active:scale-95">
                  ADD +
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Pagination/Load More -->
        <div class="flex flex-col items-center space-y-4" data-aos="fade-up" data-aos-delay="400">
          <div v-if="currentPage < totalPages" class="text-center">
            <button @click="loadMore"
              class="px-12 py-4 border-2 border-gray-300 text-gray-700 rounded-3xl font-bold transition-all duration-300 hover:border-gray-900 hover:bg-gray-900 hover:text-white hover:shadow-lg hover:-translate-y-1">
              Load More Dishes
            </button>
          </div>

          <!-- Pagination Info -->
          <div v-if="totalPages > 1" class="flex items-center space-x-4">
            <!-- <button @click="currentPage = Math.max(1, currentPage - 1)" :disabled="currentPage === 1"
              class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button> -->

            <div class="flex items-center space-x-2">
              <button v-for="page in Math.min(totalPages, 5)" :key="page" @click="currentPage = page"
                :class="page === currentPage ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="w-10 h-10 rounded-xl flex items-center justify-center font-medium transition-colors">
                {{ page }}
              </button>
              <span v-if="totalPages > 5" class="text-gray-400">...</span>
            </div>

            <!-- <button @click="currentPage = Math.min(totalPages, currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button> -->
          </div>
        </div>
      </div>

      <!-- Cart Summary (when items present) -->
      <div v-if="cartItems.length > 0" class="mb-16 sticky bottom-24 lg:bottom-8 z-40" data-aos="slide-up">
        <div class="bg-white/95 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center">
                <ShoppingCart class="w-6 h-6 text-white" />
              </div>
              <div>
                <p class="font-bold text-gray-900">{{ cartCount }} items in cart</p>
                <p class="text-sm text-gray-600">Total: ₹{{ cartTotal }}</p>
              </div>
            </div>

            <button
              class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 shadow-emerald-500/25">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Enhanced Mobile Navigation -->
    <div
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200 px-6 py-4 z-50">
      <div class="flex items-center justify-around max-w-md mx-auto">
        <button class="flex flex-col items-center py-2 text-gray-900 transition-colors">
          <div
            class="w-12 h-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center mb-1 shadow-lg">
            <Home class="w-6 h-6 text-white" />
          </div>
          <span class="text-xs font-bold">Home</span>
        </button>

        <button class="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
          <div
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-1 hover:bg-gray-200 transition-colors">
            <Search class="w-6 h-6" />
          </div>
          <span class="text-xs font-medium">Search</span>
        </button>

        <button class="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors relative">
          <div
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-1 hover:bg-gray-200 transition-colors">
            <Heart :class="favoriteItems.size > 0 ? 'text-red-500' : ''" class="w-6 h-6" />
          </div>
          <span v-if="favoriteItems.size > 0"
            class="absolute -top-1 right-4 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{{
            favoriteItems.size }}</span>
          <span class="text-xs font-medium">Favorites</span>
        </button>

        <button class="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors relative">
          <div
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-1 hover:bg-gray-200 transition-colors">
            <ShoppingCart class="w-6 h-6" />
          </div>
          <span v-if="cartCount > 0"
            class="absolute -top-1 right-4 w-5 h-5 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">{{
            cartCount }}</span>
          <span class="text-xs font-medium">Cart</span>
        </button>

        <button class="flex flex-col items-center py-2 text-gray-500 hover:text-gray-900 transition-colors">
          <div
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-1 hover:bg-gray-200 transition-colors">
            <User class="w-6 h-6" />
          </div>
          <span class="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom animations */
@keyframes shimmer {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}

.animate-shimmer {
  background: linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px);
  background-size: 200px;
  animation: shimmer 1.5s infinite;
}

/* Enhanced transitions */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus styles for accessibility */
button:focus-visible,
input:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>