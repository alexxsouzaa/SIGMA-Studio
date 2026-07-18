import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  Rocket,
  LayoutDashboard,
  Factory,
  Zap,
  Droplets,
  Tractor,
  Package,
} from 'lucide-react'

interface LandingHeroProps {
  onScrollToPlans?: () => void
}

export default function LandingHero({ onScrollToPlans }: LandingHeroProps) {
  const heroRef = useRef<HTMLElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const hero = heroRef.current
    const spot = spotlightRef.current
    if (!hero || !spot) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      spot.style.display = 'none'
      return
    }
    let raf: number | null = null
    const handleMove = (e: MouseEvent) => {
      if (raf) cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect()
        spot.style.left = `${e.clientX - r.left - 300}px`
        spot.style.top = `${e.clientY - r.top - 300}px`
        raf = null
      })
    }
    const handleLeave = () => {
      if (raf) cancelAnimationFrame(raf)
      spot.style.left = '-9999px'
    }
    hero.addEventListener('mousemove', handleMove)
    hero.addEventListener('mouseleave', handleLeave)
    return () => {
      hero.removeEventListener('mousemove', handleMove)
      hero.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <section className="landing-hero" id="hero" ref={heroRef}>
      <div className="landing-hero-grid" />
      <div className="landing-hero-spotlight" ref={spotlightRef} />
      <div className="landing-hero-inner">
        <div className="landing-hero-tag">
          <CheckCircle />
          Usado por engenheiros em mais de 47 plantas industriais
        </div>
        <div className="landing-reveal-hero visible">
          <h1>
            Pare o downtime antes
            <br />
            que ele aconte&ccedil;a,{' '}
            <span className="gradient-text">n&atilde;o depois</span>
          </h1>
        </div>
        <div className="landing-reveal-hero visible" style={{ animationDelay: '150ms' }}>
          <p>
            Monitore, analise e responda a eventos cr&iacute;ticos em tempo real. O SIGMA
            Studio unifica dispositivos, alarmes e IA em uma plataforma que seus
            t&eacute;cnicos realmente v&atilde;o usar.
          </p>
        </div>
        <div
          className="landing-reveal-hero visible landing-hero-actions"
          style={{ animationDelay: '280ms' }}
        >
          <button
            type="button"
            className="landing-btn landing-btn-primary"
            onClick={onScrollToPlans}
          >
            <Rocket />
            Come&ccedil;ar avalia&ccedil;&atilde;o
          </button>
          <Link to="/app" className="landing-btn landing-btn-secondary">
            <LayoutDashboard />
            Ver dashboard
          </Link>
        </div>
        <div
          className="landing-reveal-hero visible landing-hero-logos"
          style={{ animationDelay: '400ms' }}
        >
          <div className="landing-hero-logos-label">
            Presente em setores cr&iacute;ticos
          </div>
          <div className="landing-hero-logos-row">
            <span className="landing-hero-logo">
              <Factory />
              Manufatura
            </span>
            <span className="landing-hero-logo">
              <Zap />
              Energia
            </span>
            <span className="landing-hero-logo">
              <Droplets />
              Saneamento
            </span>
            <span className="landing-hero-logo">
              <Tractor />
              Agroneg&oacute;cio
            </span>
            <span className="landing-hero-logo">
              <Package />
              Log&iacute;stica
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
