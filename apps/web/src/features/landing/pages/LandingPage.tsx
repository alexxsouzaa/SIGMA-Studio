import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import LandingNav from '../components/LandingNav'
import LandingHero from '../components/LandingHero'
import LandingSolution from '../components/LandingSolution'
import LandingTestimonial from '../components/LandingTestimonial'
import LandingPricing from '../components/LandingPricing'
import LandingCTA from '../components/LandingCTA'
import LandingFooter from '../components/LandingFooter'

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    document.body.classList.add('landing-page')
    return () => document.body.classList.remove('landing-page')
  }, [])

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 76
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }, [])

  const handlePricingClick = useCallback(() => {
    if (isAuthenticated) {
      navigate('/app')
    } else {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  return (
    <>
      <a href="#hero" className="skip-link">
        Pular para conte&uacute;do principal
      </a>

      <LandingNav onScrollTo={scrollTo} />

      <button
        type="button"
        className="landing-theme-toggle"
        onClick={toggleTheme}
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Moon /> : <Sun />}
      </button>

      <main>
        <LandingHero onScrollToPlans={() => scrollTo('planos')} />
        <LandingSolution />
        <LandingTestimonial />
        <LandingPricing onPricingClick={handlePricingClick} />
        <LandingCTA />
      </main>

      <LandingFooter onScrollTo={scrollTo} />
    </>
  )
}
