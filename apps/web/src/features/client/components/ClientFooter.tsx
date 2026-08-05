import { Link } from 'react-router-dom'

export default function ClientFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-col">
          <div className="landing-footer-brand">
            <img className="theme-logo-dark" src={`${import.meta.env.BASE_URL}logo-light.png`} alt="SIGMA Studio" style={{ height: 13, width: 'auto' }} />
            <img className="theme-logo-light" src={`${import.meta.env.BASE_URL}logo-dark.png`} alt="SIGMA Studio" style={{ height: 13, width: 'auto' }} />
          </div>
          <div className="landing-footer-desc">
            Plataforma de monitoramento industrial com IA para engenheiros e
            operadores de planta.
          </div>
        </div>
        <div className="landing-footer-col">
          <div className="landing-footer-heading">Produto</div>
          <Link to="/app" className="landing-footer-link">
            Dashboard
          </Link>
          <Link to="/app/telemetry" className="landing-footer-link">
            Telemetria
          </Link>
          <Link to="/app/alarms" className="landing-footer-link">
            Alarmes
          </Link>
          <Link to="/app/ia" className="landing-footer-link">
            IA
          </Link>
        </div>
        <div className="landing-footer-col">
          <div className="landing-footer-heading">Acesso</div>
          <Link to="/login" className="landing-footer-link">
            Entrar
          </Link>
          <Link to="/register" className="landing-footer-link">
            Criar conta
          </Link>
          <Link to="/area-cliente" className="landing-footer-link">
            &Aacute;rea do cliente
          </Link>
        </div>
        <div className="landing-footer-col">
          <div className="landing-footer-heading">Suporte</div>
          <Link to="/app" className="landing-footer-link">
            Documenta&ccedil;&atilde;o
          </Link>
          <span className="landing-footer-link-static">Central de ajuda</span>
          <span className="landing-footer-link-static">Status da plataforma</span>
          <span className="landing-footer-link-static">Privacidade</span>
        </div>
      </div>
      <div className="landing-footer-bottom">
        &copy; 2026 SIGMA Studio. Todos os direitos reservados.
      </div>
    </footer>
  )
}
