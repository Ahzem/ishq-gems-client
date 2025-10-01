import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AboutIntro from '@/components/sections/aboutUs/AboutIntro'
import VisionSection from '@/components/sections/aboutUs/VisionSection'
import ComparisonTable from '@/components/sections/aboutUs/ComparisonTable'
import TrustLogos from '@/components/sections/aboutUs/TrustLogos'
import BusinessRegistration from '@/components/sections/aboutUs/BusinessRegistration'
import ContactJoinUs from '@/components/sections/aboutUs/ContactJoinUs'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { createPageMetadata } from '@/lib/metadata'

export const metadata = createPageMetadata({
  title: 'About Us - Meet the Founders | Ishq Gems',
  description: 'Meet the founders of Ishq Gems - Muhammadh Ahzem and Hamis Muhammadh. Driven by technology, backed by gemological expertise. Learn our vision to digitize Sri Lanka\'s gem heritage.',
  keywords: 'Ishq Gems founders, Sri Lankan gems, gemologist, gem marketplace, NGJA certified, gem trading platform',
})

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ScrollAnimation animation="fadeIn" duration={0.8}>
          <AboutIntro />
        </ScrollAnimation>
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
          <VisionSection />
        </ScrollAnimation>
        <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
          <ComparisonTable />
        </ScrollAnimation>
        <ScrollAnimation animation="scaleIn" delay={0.3} duration={0.8}>
          <TrustLogos />
        </ScrollAnimation>
        <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
          <BusinessRegistration />
        </ScrollAnimation>
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
          <ContactJoinUs />
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  )
} 