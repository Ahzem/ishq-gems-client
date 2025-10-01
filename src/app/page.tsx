import Header from '@/components/layout/Header'
import Hero from '@/components/sections/hero/Hero'
import NewArrivals from '@/components/sections/hero/NewArrivals'
import BirthstonesSection from '@/components/sections/hero/BirthstonesSection'
import About from '@/components/sections/hero/About'
import ReviewsSection from '@/components/sections/hero/ReviewsSection'
import PartnersSection from '@/components/sections/hero/PartnersSection'
import CallToAction from '@/components/sections/hero/CallToAction'
import Logo from '@/components/sections/hero/Logo'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import Footer from '@/components/layout/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ScrollAnimation animation="fadeIn" duration={0.8}>
          <Hero />
        </ScrollAnimation>
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
          <NewArrivals />
        </ScrollAnimation>
        <ScrollAnimation animation="scaleIn" delay={0.3} duration={0.8}>
          <BirthstonesSection />
        </ScrollAnimation>
        <ScrollAnimation animation="slideUp" delay={0.1} duration={0.8}>
          <About />
        </ScrollAnimation>
        <ScrollAnimation animation="scaleIn" delay={0.3} duration={0.8}>
          <ReviewsSection />
        </ScrollAnimation>
        <ScrollAnimation animation="slideUp" delay={0.2} duration={0.8}>
          <PartnersSection />
        </ScrollAnimation>
        <ScrollAnimation animation="fadeIn" delay={0.3} duration={0.8}>
          <CallToAction />
        </ScrollAnimation>
        <ScrollAnimation animation="fadeIn" delay={0.3} duration={0.8}>
          <Logo />
        </ScrollAnimation>
      </main>
      <Footer />
    </div>
  )
}
