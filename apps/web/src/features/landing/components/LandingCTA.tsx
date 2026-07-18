import { Link } from 'react-router-dom'
import { Rocket, Calendar, LayoutDashboard } from 'lucide-react'

export default function LandingCTA() {
  return (
    <section className="landing-cta" id="contato">
      <h2>Pronto para transformar sua opera&ccedil;&atilde;o?</h2>
      <p>
        Experimente o SIGMA Studio gr&aacute;tis por 14 dias. Sem compromisso, sem
        cart&atilde;o de cr&eacute;dito. Em 30 minutos sua planta j&aacute; est&aacute;
        monitorada.
      </p>
      <div className="landing-hero-actions">
        <Link to="/app" className="landing-btn landing-btn-primary">
          <Rocket />
          Iniciar teste gratuito
        </Link>
        <button type="button" className="landing-btn landing-btn-secondary">
          <Calendar />
          Agendar demonstra&ccedil;&atilde;o
        </button>
      </div>
      <Link to="/app" className="landing-btn-ghost">
        <LayoutDashboard />
        Ou explorar o prot&oacute;tipo agora
      </Link>
    </section>
  )
}
