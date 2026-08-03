import { Link } from 'react-router-dom'

interface LandingFooterProps {
  onScrollTo: (id: string) => void
}

export default function LandingFooter({ onScrollTo }: LandingFooterProps) {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-col">
          <div className="landing-footer-brand">
            <img className="theme-logo-dark" src={`${import.meta.env.BASE_URL}logo-light.png`} alt="SIGMA Studio" style={{ height: 13, width: 'auto' }} />
            <img className="theme-logo-light" src={`${import.meta.env.BASE_URL}logo-dark.png`} alt="SIGMA Studio" style={{ height: 13, width: 'auto' }} />
          </div>
          <div className="landing-footer-desc">
            Plataforma de monitoramento industrial com IA para engenheiros e operadores de
            planta.
          </div>
        </div>
        <div className="landing-footer-col">
          <div className="landing-footer-heading">Produto</div>
          <button
            type="button"
            className="landing-footer-link"
            onClick={() => onScrollTo('solucao')}
          >
            Solu&ccedil;&atilde;o
          </button>
          <button
            type="button"
            className="landing-footer-link"
            onClick={() => onScrollTo('planos')}
          >
            Planos
          </button>
          <Link to="/app" className="landing-footer-link">
            Dashboard
          </Link>
          <span className="landing-footer-link-static">Dispositivos</span>
        </div>
        <div className="landing-footer-col">
          <div className="landing-footer-heading">Empresa</div>
          <span className="landing-footer-link-static">Sobre</span>
          <span className="landing-footer-link-static">Blog</span>
          <span className="landing-footer-link-static">Contato</span>
          <span className="landing-footer-link-static">Carreiras</span>
        </div>
        <div className="landing-footer-col">
          <div className="landing-footer-heading">Suporte</div>
          <Link to="/app" className="landing-footer-link">
            Documenta&ccedil;&atilde;o
          </Link>
          <span className="landing-footer-link-static">API</span>
          <span className="landing-footer-link-static">Status</span>
          <span className="landing-footer-link-static">Privacidade</span>
        </div>
      </div>
      <div className="landing-footer-bottom">
        &copy; 2026 SIGMA Studio. Todos os direitos reservados.
      </div>
    </footer>
  )
}
