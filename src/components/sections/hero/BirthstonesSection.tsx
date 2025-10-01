'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Calendar, Gem, Star, ShoppingCart, ChevronLeft, ChevronRight, Sparkles, Crown, Heart, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import CursorReactive, { ParallaxBackground } from '@/components/common/CursorReactive'
import ScrollAnimation from '@/components/animations/ScrollAnimation'

// Comprehensive birthstone data based on the Gem Society reference
const birthstoneData = {
  january: {
    name: 'January',
    modern: [{
      name: 'Garnet',
      color: 'Deep Red',
      hardness: '6.5-7.5',
      symbolism: 'Protection, vitality, and love. Believed to shield the wearer from injury and bring light to dark hours.',
      properties: 'Depending on the type of garnet, you can choose from red, purplish, green, yellow, and orange options.',
      images: [
        '/images/birthstones/January/Garnet-1.webp',
        '/images/birthstones/January/Garnet-2.webp',
        '/images/birthstones/January/Garnet-3.webp',
        '/images/birthstones/January/Garnet-4.webp'
      ],
      gradient: 'from-red-600 via-red-500 to-red-700'
    }],
    traditional: [{
      name: 'Garnet',
      color: 'Deep Red',
      hardness: '6.5-7.5',
      symbolism: 'Protection, vitality, and love. Believed to shield the wearer from injury and bring light to dark hours.',
      properties: 'Depending on the type of garnet, you can choose from red, purplish, green, yellow, and orange options.',
      images: [
        '/images/birthstones/January/Garnet-2.webp',
        '/images/birthstones/January/Garnet-4.webp',
        '/images/birthstones/January/Garnet-1.webp'
      ],
      gradient: 'from-red-600 via-red-500 to-red-700'
    }]
  },
  february: {
    name: 'February',
    modern: [{
      name: 'Amethyst',
      color: 'Purple',
      hardness: '7',
      symbolism: 'Spirituality, mental clarity, and healing. Associated with royalty and believed to promote wisdom.',
      properties: 'Crystalline quartz in colors ranging from pale lilac to deep reddish purple with excellent durability.',
      images: [
        '/images/birthstones/February/Amethyst-1.webp',
        '/images/birthstones/February/Amethyst-2.webp',
        '/images/birthstones/February/Amethyst-3.webp',
        '/images/birthstones/February/Amethyst-4.webp',
        '/images/birthstones/February/Amethyst-5.webp',
        '/images/birthstones/February/Amethyst-6.webp',
        '/images/birthstones/February/Amethyst-7.webp'
      ],
      gradient: 'from-purple-600 via-purple-500 to-purple-700'
    }],
    traditional: [{
      name: 'Amethyst',
      color: 'Purple',
      hardness: '7',
      symbolism: 'Spirituality, mental clarity, and healing. Associated with royalty and believed to promote wisdom.',
      properties: 'Crystalline quartz in colors ranging from pale lilac to deep reddish purple with excellent durability.',
      images: [
        '/images/birthstones/February/Amethyst-3.webp',
        '/images/birthstones/February/Amethyst-5.webp',
        '/images/birthstones/February/Amethyst-7.webp',
        '/images/birthstones/February/Amethyst-1.webp'
      ],
      gradient: 'from-purple-600 via-purple-500 to-purple-700'
    }]
  },
  march: {
    name: 'March',
    modern: [{
      name: 'Aquamarine',
      color: 'Blue to Blue-Green',
      hardness: '7.5-8',
      symbolism: 'Marital happiness and superior intellect. Named after seawater, thought to protect seafarers.',
      properties: 'Member of the beryl family with light color saturation, readily available and moderately priced.',
      images: [
        '/images/birthstones/March/Aquamarine-1.webp',
        '/images/birthstones/March/Aquamarine-2.webp',
        '/images/birthstones/March/Aquamarine-3.webp'
      ],
      gradient: 'from-blue-400 via-cyan-400 to-blue-500'
    }],
    traditional: [{
      name: 'Bloodstone',
      color: 'Dark Green with Red Spots',
      hardness: '6.5-7',
      symbolism: 'Courage, wisdom, and noble sacrifice. Believed to have healing properties and bring good fortune.',
      properties: 'Dark green chalcedony with distinctive red iron oxide inclusions resembling drops of blood.',
      images: [
        '/images/birthstones/March/Bloodstone-1.webp',
        '/images/birthstones/March/Bloodstone-2.webp'
      ],
      gradient: 'from-green-700 via-green-600 to-red-600'
    }]
  },
  april: {
    name: 'April',
    modern: [{
      name: 'Diamond',
      color: 'Colorless to Fancy Colors',
      hardness: '10',
      symbolism: 'Strength and eternal love. Associated with invincibility and clarity of thought.',
      properties: 'The hardest natural material, prized for brilliance and fire. Available in full rainbow of colors.',
      images: [
        '/images/birthstones/April/Diamond-1.webp',
        '/images/birthstones/April/Diamond-2.webp',
        '/images/birthstones/April/Diamond-3.webp',
        '/images/birthstones/April/Diamond-4.webp',
        '/images/birthstones/April/Diamond-5.webp',
        '/images/birthstones/April/Diamond-6.webp'
      ],
      gradient: 'from-gray-200 via-white to-gray-300'
    }],
    traditional: [{
      name: 'Diamond',
      color: 'Colorless to Fancy Colors',
      hardness: '10',
      symbolism: 'Strength and eternal love. Associated with invincibility and clarity of thought.',
      properties: 'The hardest natural material, prized for brilliance and fire. Available in full rainbow of colors.',
      images: [
        '/images/birthstones/April/Diamond-3.webp',
        '/images/birthstones/April/Diamond-5.webp',
        '/images/birthstones/April/Diamond-1.webp',
        '/images/birthstones/April/Diamond-6.webp'
      ],
      gradient: 'from-gray-200 via-white to-gray-300'
    }]
  },
  may: {
    name: 'May',
    modern: [{
      name: 'Emerald',
      color: 'Deep Green',
      hardness: '7.5-8',
      symbolism: 'Heightened intelligence and objective thinking. Promotes healing and allows prediction of the future.',
      properties: 'Member of beryl family, one of the "Big Four" gems. Known for inclusions that add character.',
      images: [
        '/images/birthstones/May/Emerald-1.webp',
        '/images/birthstones/May/Emerald-2.webp',
        '/images/birthstones/May/Emerald-3.webp',
        '/images/birthstones/May/Emerald-4.webp',
        '/images/birthstones/May/Emerald-5.webp',
        '/images/birthstones/May/Emerald-6.webp'
      ],
      gradient: 'from-emerald-600 via-emerald-500 to-green-600'
    }],
    traditional: [{
      name: 'Emerald',
      color: 'Deep Green',
      hardness: '7.5-8',
      symbolism: 'Heightened intelligence and objective thinking. Promotes healing and allows prediction of the future.',
      properties: 'Member of beryl family, one of the "Big Four" gems. Known for inclusions that add character.',
      images: [
        '/images/birthstones/May/Emerald-4.webp',
        '/images/birthstones/May/Emerald-6.webp',
        '/images/birthstones/May/Emerald-2.webp',
        '/images/birthstones/May/Emerald-1.webp'
      ],
      gradient: 'from-emerald-600 via-emerald-500 to-green-600'
    }]
  },
  june: {
    name: 'June',
    modern: [{
      name: 'Alexandrite',
      color: 'Color-Changing',
      hardness: '8.5',
      symbolism: 'Balance, joy, and good fortune. Known for its remarkable color-changing properties.',
      properties: 'Rare variety of chrysoberyl that changes color from green in daylight to red in incandescent light.',
      images: [
        '/images/birthstones/June/Alexandrite-1.webp',
        '/images/birthstones/June/Alexandrite-2.webp',
        '/images/birthstones/June/Alexandrite-3.webp',
        '/images/birthstones/June/Alexandrite-4.webp'
      ],
      gradient: 'from-green-500 via-purple-500 to-red-500'
    }],
    traditional: [{
      name: 'Pearl',
      color: 'White to Various Colors',
      hardness: '2.5-4.5',
      symbolism: 'Purity, wisdom, and divine connection. Associated with tears from heaven and carried by dragons.',
      properties: 'Organic gem formed in mollusks, available in white, black, gold, silver, and various pastels.',
      images: [
        '/images/birthstones/June/Pearl-1.webp',
        '/images/birthstones/June/Pearl-2.webp',
        '/images/birthstones/June/Pearl-3.webp',
        '/images/birthstones/June/Pearl-4.webp'
      ],
      gradient: 'from-gray-100 via-white to-gray-200'
    }]
  },
  july: {
    name: 'July',
    modern: [{
      name: 'Ruby',
      color: 'Red',
      hardness: '9',
      symbolism: 'Physicality, strength, and passion. Thought to increase stamina and calm anger.',
      properties: 'Red variety of corundum, one of the most expensive gemstones with record prices over $1M per carat.',
      images: [
        '/images/birthstones/July/Ruby-1.webp',
        '/images/birthstones/July/Ruby-2.webp',
        '/images/birthstones/July/Ruby-3.webp',
        '/images/birthstones/July/Ruby-4.webp',
        '/images/birthstones/July/Ruby-5.webp',
        '/images/birthstones/July/Ruby-6.webp',
        '/images/birthstones/July/Ruby-7.webp',
        '/images/birthstones/July/Ruby-8.webp',
        '/images/birthstones/July/Ruby-9.webp'
      ],
      gradient: 'from-red-700 via-red-600 to-pink-600'
    }],
    traditional: [{
      name: 'Ruby',
      color: 'Red',
      hardness: '9',
      symbolism: 'Physicality, strength, and passion. Thought to increase stamina and calm anger.',
      properties: 'Red variety of corundum, one of the most expensive gemstones with record prices over $1M per carat.',
      images: [
        '/images/birthstones/July/Ruby-5.webp',
        '/images/birthstones/July/Ruby-7.webp',
        '/images/birthstones/July/Ruby-2.webp',
        '/images/birthstones/July/Ruby-9.webp',
        '/images/birthstones/July/Ruby-1.webp'
      ],
      gradient: 'from-red-700 via-red-600 to-pink-600'
    }]
  },
  august: {
    name: 'August',
    modern: [{
      name: 'Peridot',
      color: 'Yellow-Green',
      hardness: '6.5-7',
      symbolism: 'Protection during night hours. Associated with the sun and believed to repel evil spirits.',
      properties: 'Always green with unique yellowish overtone, often with brownish appearance in some stones.',
      images: [
        '/images/birthstones/August/Peridot-1.webp',
        '/images/birthstones/August/Peridot-2.webp',
        '/images/birthstones/August/Peridot-3.webp',
        '/images/birthstones/August/Peridot-4.webp',
        '/images/birthstones/August/Peridot-5.webp'
      ],
      gradient: 'from-lime-500 via-green-400 to-yellow-500'
    }, {
      name: 'Spinel',
      color: 'Various Colors',
      hardness: '8',
      symbolism: 'Revitalization, encouragement, and hope. Believed to calm stress and replenish energy.',
      properties: 'Recent modern addition, available in vibrant colors including red, pink, blue, and lavender.',
      images: [
        '/images/birthstones/August/Spinel-1.webp',
        '/images/birthstones/August/Spinel-2.webp'
      ],
      gradient: 'from-pink-500 via-red-400 to-purple-500'
    }],
    traditional: [{
      name: 'Sardonyx',
      color: 'Banded Brown and White',
      hardness: '6.5-7',
      symbolism: 'Strength, protection, and eloquence. Believed to bring happiness in marriage and relationships.',
      properties: 'Variety of onyx with alternating bands of sard (reddish-brown) and onyx (white or black).',
      images: [
        '/images/birthstones/August/Sardonyx-1.webp',
        '/images/birthstones/August/Sardonyx-2.webp'
      ],
      gradient: 'from-amber-700 via-orange-600 to-red-700'
    }]
  },
  september: {
    name: 'September',
    modern: [{
      name: 'Sapphire',
      color: 'Blue (and all colors except red)',
      hardness: '9',
      symbolism: 'Protection, spiritual wisdom, and divine favor. Considered highly spiritual stones worn by priests.',
      properties: 'Corundum in all colors except red, can exhibit natural asterism in form of six-rayed star.',
      images: [
        '/images/birthstones/September/Sapphire-1.webp',
        '/images/birthstones/September/Sapphire-2.webp',
        '/images/birthstones/September/Sapphire-3.webp',
        '/images/birthstones/September/Sapphire-4.webp',
        '/images/birthstones/September/Sapphire-5.webp'
      ],
      gradient: 'from-blue-700 via-blue-600 to-indigo-600'
    }],
    traditional: [{
      name: 'Sapphire',
      color: 'Blue (and all colors except red)',
      hardness: '9',
      symbolism: 'Protection, spiritual wisdom, and divine favor. Considered highly spiritual stones worn by priests.',
      properties: 'Corundum in all colors except red, can exhibit natural asterism in form of six-rayed star.',
      images: [
        '/images/birthstones/September/Sapphire-3.webp',
        '/images/birthstones/September/Sapphire-5.webp',
        '/images/birthstones/September/Sapphire-1.webp',
        '/images/birthstones/September/Sapphire-2.webp'
      ],
      gradient: 'from-blue-700 via-blue-600 to-indigo-600'
    }]
  },
  october: {
    name: 'October',
    modern: [{
      name: 'Tourmaline',
      color: 'Various Colors',
      hardness: '7-7.5',
      symbolism: 'Creativity, compassion, and healing. Each color carries specific metaphysical properties.',
      properties: 'Available in virtually every color, often with multiple colors in single crystal (watermelon tourmaline).',
      images: [
        '/images/birthstones/October/Tourmaline-1.webp',
        '/images/birthstones/October/Tourmaline-2.webp',
        '/images/birthstones/October/Tourmaline-3.webp'
      ],
      gradient: 'from-pink-500 via-green-500 to-blue-500'
    }],
    traditional: [{
      name: 'Opal',
      color: 'Various with Play-of-Color',
      hardness: '5.5-6.5',
      symbolism: 'Light, magic, and healing. Associated with good luck and believed to make wearer invisible.',
      properties: 'Unique patterns with play-of-color phenomenon, each stone distinctly individual and delicate.',
      images: [
        '/images/birthstones/October/Opal-1.webp',
        '/images/birthstones/October/Opal-2.webp',
        '/images/birthstones/October/Opal-3.webp'
      ],
      gradient: 'from-orange-400 via-pink-400 to-blue-400'
    }]
  },
  november: {
    name: 'November',
    modern: [{
      name: 'Golden Topaz',
      color: 'Golden Yellow',
      hardness: '8',
      symbolism: 'Wealth, abundance, and mystical ability to attract gold. Associated with prosperity.',
      properties: 'Natural golden variety of topaz, prized for its warm color and excellent clarity.',
      images: [
        '/images/birthstones/November/Golden%20Topaz-1.webp',
        '/images/birthstones/November/Golden%20Topaz-2.webp',
        '/images/birthstones/November/Golden%20Topaz-3.webp'
      ],
      gradient: 'from-yellow-500 via-amber-500 to-orange-500'
    }, {
      name: 'Citrine',
      color: 'Yellow to Orange',
      hardness: '7',
      symbolism: 'Healing, happiness, and stress relief. Associated with stomach ailments and insomnia relief.',
      properties: 'Yellow variety of crystalline quartz, many commercial stones are heat-treated amethyst.',
      images: [
        '/images/birthstones/November/Citrine-1.webp',
        '/images/birthstones/November/Citrine-2.webp'
      ],
      gradient: 'from-yellow-400 via-orange-400 to-amber-500'
    }],
    traditional: [{
      name: 'Topaz',
      color: 'Various Colors',
      hardness: '8',
      symbolism: 'Wealth, abundance, and mystical ability to attract gold. Associated with prosperity.',
      properties: 'Available in many colors, traditionally associated with golden yellow varieties.',
      images: [
        '/images/birthstones/November/Topaz-1.webp',
        '/images/birthstones/November/Topaz-2.webp'
      ],
      gradient: 'from-blue-400 via-cyan-400 to-teal-500'
    }]
  },
  december: {
    name: 'December',
    modern: [{
      name: 'Blue Zircon',
      color: 'Blue',
      hardness: '7.5',
      symbolism: 'Wisdom, honor, and wealth. One of the oldest minerals on Earth with spiritual significance.',
      properties: 'Natural zircon with brilliant luster and fire, often confused with cubic zirconia.',
      images: [
        '/images/birthstones/December/Blue%20Zircon-1.webp',
        '/images/birthstones/December/Blue%20Zircon-2.webp'
      ],
      gradient: 'from-blue-500 via-cyan-500 to-teal-500'
    }, {
      name: 'Blue Topaz',
      color: 'Blue',
      hardness: '8',
      symbolism: 'Wealth and abundance. Different blue shades (London, Swiss, Sky Blue) carry specific meanings.',
      properties: 'Most blue topaz is treated colorless topaz, available in London Blue, Swiss Blue, and Sky Blue.',
      images: [
        '/images/birthstones/December/Blue%20Topaz-1.webp',
        '/images/birthstones/December/Blue%20Topaz-2.webp',
        '/images/birthstones/December/Blue%20Topaz-3.webp',
        '/images/birthstones/December/Blue%20Topaz-4.webp',
        '/images/birthstones/December/Blue%20Topaz-5.webp',
        '/images/birthstones/December/Blue%20Topaz-6.webp'
      ],
      gradient: 'from-blue-400 via-sky-400 to-cyan-400'
    }, {
      name: 'Tanzanite',
      color: 'Blue to Purple',
      hardness: '6-7',
      symbolism: 'Transformation, spiritual awakening, and communication with higher realms.',
      properties: 'Recent modern addition, found only in Tanzania with pleochroic properties showing different colors.',
      images: [
        '/images/birthstones/December/Tanzanite-1.webp',
        '/images/birthstones/December/Tanzanite-2.webp'
      ],
      gradient: 'from-blue-600 via-purple-500 to-indigo-600'
    }],
    traditional: [{
      name: 'Turquoise',
      color: 'Blue-Green',
      hardness: '5-6',
      symbolism: 'Protection, healing, and connection to the natural world. Sacred to many cultures.',
      properties: 'Copper aluminum phosphate mineral, often with matrix patterns, less expensive than modern options.',
      images: ['/images/birthstones/December/Turquoise-1.webp'],
      gradient: 'from-cyan-500 via-teal-500 to-blue-500'
    }, {
      name: 'Lapis Lazuli',
      color: 'Deep Blue',
      hardness: '5-6',
      symbolism: 'Wisdom, truth, and royal power. Associated with divine favor and spiritual insight.',
      properties: 'Rock composed primarily of lazurite with gold pyrite flecks, prized since antiquity.',
      images: ['/images/birthstones/December/Lapis%20Lazuli-1.webp'],
      gradient: 'from-blue-800 via-blue-700 to-indigo-700'
    }]
  }
}

const monthNames = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
] as const

type MonthKey = typeof monthNames[number]

export default function BirthstonesSection() {
  const [selectedMonth, setSelectedMonth] = useState<MonthKey>(() => {
    const currentMonth = new Date().getMonth()
    return monthNames[currentMonth]
  })
  const [selectedStoneIndex, setSelectedStoneIndex] = useState(0)
  const [stoneType, setStoneType] = useState<'modern' | 'traditional'>('modern')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const currentMonthData = birthstoneData[selectedMonth]
  const currentStones = currentMonthData[stoneType]
  const selectedStone = currentStones[selectedStoneIndex]
  
  // Filter out any empty or invalid image URLs
  const currentImages = selectedStone.images.filter(img => img && img.trim() !== '')
  const hasMultipleImages = currentImages.length > 1
  
  // Fallback image if no valid images found
  const fallbackImage = '/images/gem-placeholder.svg'
  const displayImages = currentImages.length > 0 ? currentImages : [fallbackImage]

  const handleMonthChange = (month: MonthKey) => {
    setSelectedMonth(month)
    setSelectedStoneIndex(0)
    setStoneType('modern')
    setCurrentImageIndex(0)
  }

  // Auto-transition effect for multiple images
  useEffect(() => {
    if (!hasMultipleImages || displayImages.length <= 1) {
      setCurrentImageIndex(0)
      return
    }

    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        prevIndex === displayImages.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000) // Change image every 4 seconds

    return () => clearInterval(interval)
  }, [hasMultipleImages, displayImages.length])

  // Reset image index when stone changes
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [selectedStone])

  // Ensure currentImageIndex is within bounds
  const safeImageIndex = Math.min(currentImageIndex, displayImages.length - 1)

  const handleBuyStone = () => {
    // Placeholder for buy functionality
    console.log(`Buying ${selectedStone.name} for ${currentMonthData.name}`)
    // TODO: Implement actual buy functionality
  }

  const nextMonth = () => {
    const currentIndex = monthNames.indexOf(selectedMonth)
    const nextIndex = (currentIndex + 1) % monthNames.length
    handleMonthChange(monthNames[nextIndex])
  }

  const prevMonth = () => {
    const currentIndex = monthNames.indexOf(selectedMonth)
    const prevIndex = currentIndex === 0 ? monthNames.length - 1 : currentIndex - 1
    handleMonthChange(monthNames[prevIndex])
  }

  return (
    <section className="py-16 sm:py-20 lg:py-28 relative overflow-hidden bg-gradient-to-br from-background via-secondary/5 to-background">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <ParallaxBackground strength={0.4}>
          <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl animate-pulse"></div>
        </ParallaxBackground>
        <ParallaxBackground strength={-0.3}>
          <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-l from-accent/3 to-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </ParallaxBackground>
      </div>

      <div className="container mx-auto px-3 sm:px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollAnimation animation="fadeIn" duration={0.8}>
            <div className="text-center mb-8 sm:mb-12 lg:mb-16 xl:mb-20 luxury-fade-in">
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
                <div className="relative">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse"></div>
                </div>
                <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 px-2">
                Your <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Birthstone</span> Journey
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
                Discover the gemstone that celebrates your birth month. Each stone carries its own unique beauty, 
                symbolism, and mystical properties passed down through generations.
              </p>
            </div>
          </ScrollAnimation>

          {/* Month Navigation */}
          <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
            <div className="mb-8 sm:mb-12 lg:mb-16">
              {/* Mobile Month Selector */}
              <div className="block sm:hidden mb-6">
                <div className="flex items-center justify-between bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                  <button 
                    onClick={prevMonth}
                    className="p-2 rounded-full hover:bg-primary/10 transition-colors duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-primary" />
                  </button>
                  
                  <div className="text-center">
                    <div className="font-serif text-xl font-bold text-foreground capitalize">
                      {currentMonthData.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date().getMonth() === monthNames.indexOf(selectedMonth) ? 'Current Month' : 'Birthstone'}
                    </div>
                  </div>
                  
                  <button 
                    onClick={nextMonth}
                    className="p-2 rounded-full hover:bg-primary/10 transition-colors duration-300"
                  >
                    <ChevronRight className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>

              {/* Desktop Month Grid */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
                {monthNames.map((month) => {
                  const isCurrentMonth = new Date().getMonth() === monthNames.indexOf(month)
                  const isSelected = selectedMonth === month
                  
                  return (
                    <CursorReactive
                      key={month}
                      enableTilt={true}
                      maxRotation={3}
                      enableScale={true}
                      scaleAmount={1.02}
                    >
                      <button
                        onClick={() => handleMonthChange(month)}
                        className={cn(
                          "relative w-full p-3 sm:p-4 rounded-xl transition-all duration-300 text-center group",
                          isSelected
                            ? "bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary shadow-lg"
                            : "bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/40 hover:bg-card/80"
                        )}
                      >
                        {isCurrentMonth && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse">
                            <div className="absolute inset-0 bg-accent rounded-full animate-ping"></div>
                          </div>
                        )}
                        
                        <div className="font-serif font-bold text-sm sm:text-base capitalize mb-1">
                          {birthstoneData[month].name}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {birthstoneData[month].modern[0].name}
                        </div>
                      </button>
                    </CursorReactive>
                  )
                })}
              </div>
            </div>
          </ScrollAnimation>

          {/* Main Birthstone Display */}
          <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 mb-8 sm:mb-12">
              {/* Stone Image and Info */}
              <div className="relative">
                <CursorReactive
                  className="group relative"
                  enableTilt={true}
                  maxRotation={8}
                  enableScale={true}
                  scaleAmount={1.02}
                >
                  <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border border-border/50 shadow-2xl">
                    {/* Stone Image */}
                    <div className="relative w-full h-full">
                      <Image
                        src={displayImages[safeImageIndex] || fallbackImage}
                        alt={`${selectedStone.name} - Image ${safeImageIndex + 1}`}
                        fill
                        className="object-cover transition-all duration-1000 group-hover:scale-110"
                        priority
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement
                          if (target.src !== fallbackImage) {
                            target.src = fallbackImage
                          }
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div className={cn(
                        "absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500",
                        `bg-gradient-to-br ${selectedStone.gradient}`
                      )}></div>
                      
                      {/* Floating Elements */}
                      <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full animate-float-slow">
                          <Sparkles className="w-4 h-4 text-white/60 m-2" />
                        </div>
                        <div className="absolute bottom-6 left-6 w-6 h-6 bg-white/15 rounded-full animate-float-delayed">
                          <Star className="w-3 h-3 text-white/50 m-1.5" />
                        </div>
                        <div className="absolute top-1/2 right-8 w-4 h-4 bg-white/10 rounded-full animate-pulse-slow"></div>
                      </div>
                    </div>
                    
                    {/* Stone Type Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="bg-background/90 backdrop-blur-sm text-foreground px-4 py-2 rounded-full border border-border/50 shadow-lg">
                        <span className="font-bold text-sm capitalize">{stoneType}</span>
                      </div>
                    </div>
                    
                    {/* Hardness Badge */}
                    <div className="absolute bottom-6 right-6">
                      <div className={cn(
                        "text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm",
                        `bg-gradient-to-r ${selectedStone.gradient}`
                      )}>
                        <span className="font-bold text-sm">Hardness: {selectedStone.hardness}</span>
                      </div>
                    </div>

                    {/* Image Indicators */}
                    {hasMultipleImages && displayImages.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-2 rounded-full border border-border/50 shadow-lg">
                          {displayImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={cn(
                                "w-2 h-2 rounded-full transition-all duration-300",
                                currentImageIndex === index
                                  ? `bg-gradient-to-r ${selectedStone.gradient} scale-125`
                                  : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
                              )}
                            />
                          ))}
                          <div className="ml-2 text-xs text-muted-foreground font-medium">
                            {safeImageIndex + 1}/{displayImages.length}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl opacity-60"></div>
                  <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-2xl opacity-40"></div>
                </CursorReactive>
              </div>

              {/* Stone Details */}
              <div className="space-y-6 sm:space-y-8">
                {/* Stone Name and Type Selector */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                      {selectedStone.name}
                    </h3>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-white text-sm font-bold",
                      `bg-gradient-to-r ${selectedStone.gradient}`
                    )}>
                      {currentMonthData.name}
                    </div>
                  </div>

                  {/* Modern/Traditional Toggle */}
                  <div className="flex gap-2 mb-6">
                    <button
                      onClick={() => {
                        setStoneType('modern')
                        setSelectedStoneIndex(0)
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        stoneType === 'modern'
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      Modern
                    </button>
                    <button
                      onClick={() => {
                        setStoneType('traditional')
                        setSelectedStoneIndex(0)
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        stoneType === 'traditional'
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      Traditional
                    </button>
                  </div>

                  {/* Multiple Stones Selector */}
                  {currentStones.length > 1 && (
                    <div className="flex gap-2 mb-6">
                      {currentStones.map((stone, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedStoneIndex(index)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 border",
                            selectedStoneIndex === index
                              ? "bg-primary/20 text-primary border-primary"
                              : "bg-card/50 text-muted-foreground border-border/50 hover:border-primary/40"
                          )}
                        >
                          {stone.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stone Properties */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      `bg-gradient-to-r ${selectedStone.gradient}`
                    )}></div>
                    <div>
                      <div className="font-semibold text-foreground">Color</div>
                      <div className="text-sm text-muted-foreground">{selectedStone.color}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                    <Gem className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-semibold text-foreground">Hardness</div>
                      <div className="text-sm text-muted-foreground">{selectedStone.hardness} on Mohs Scale</div>
                    </div>
                  </div>
                </div>

                {/* Symbolism */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-primary" />
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground">Symbolism & Meaning</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {selectedStone.symbolism}
                  </p>
                </div>

                {/* Properties */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-foreground">Properties</h4>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {selectedStone.properties}
                  </p>
                </div>

                {/* Buy Button */}
                <div className="pt-6">
                  <CursorReactive
                    enableTilt={true}
                    maxRotation={3}
                    enableScale={true}
                    scaleAmount={1.02}
                  >
                    <button
                      onClick={handleBuyStone}
                      className={cn(
                        "group w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full font-bold text-base shadow-2xl transition-all duration-300 text-white",
                        `bg-gradient-to-r ${selectedStone.gradient} hover:shadow-[0_0_30px_rgba(var(--primary),0.4)]`
                      )}
                    >
                      <ShoppingCart className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                      <span>Buy {selectedStone.name}</span>
                    </button>
                  </CursorReactive>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Additional Info Section */}
          <ScrollAnimation animation="slideUp" delay={0.3} duration={0.8}>
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-primary/20 backdrop-blur-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                    Why Choose Your Birthstone?
                  </h3>
                </div>
                <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-sm sm:text-base">
                  Birthstones have been cherished for millennia, believed to bring good fortune, protection, and enhanced 
                  spiritual connection to those born in their respective months. Whether you choose the modern or traditional 
                  stone, each carries the accumulated wisdom and beauty of generations who have treasured these natural wonders.
                </p>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse-slow opacity-60"></div>
      <div className="absolute bottom-10 left-10 w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full blur-xl animate-pulse-slow opacity-60" style={{ animationDelay: '1s' }}></div>
    </section>
  )
}
