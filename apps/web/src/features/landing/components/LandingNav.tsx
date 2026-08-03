import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'

interface LandingNavProps {
  onScrollTo: (id: string) => void
}

export default function LandingNav({ onScrollTo }: LandingNavProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    onScrollTo(id)
    setMenuOpen(false)
  }

  return (
    <nav className="landing-nav">
      <div className="landing-nav-inner">
        <button
          type="button"
          className="landing-nav-brand"
          onClick={() => scrollTo('hero')}
        >
          <img className="theme-logo-dark" src={`${import.meta.env.BASE_URL}logo-light.png`} alt="SIGMA Studio" style={{ height: 14, width: 'auto' }} />
          <img className="theme-logo-light" src={`${import.meta.env.BASE_URL}logo-dark.png`} alt="SIGMA Studio" style={{ height: 14, width: 'auto' }} />
        </button>
        <div className={`landing-nav-links${menuOpen ? ' open' : ''}`}>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollTo('solucao')}
          >
            Solu&ccedil;&atilde;o
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollTo('planos')}
          >
            Planos
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollTo('contato')}
          >
            Contato
          </button>
          <Link to="/app" className="landing-nav-cta">
            Testar gr&aacute;tis
          </Link>
        </div>
        <button
          type="button"
          className="landing-nav-mobile-btn"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Abrir menu"
        >
          <Menu />
        </button>
      </div>
    </nav>
  )
}
