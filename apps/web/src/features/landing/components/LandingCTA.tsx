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
        <a
          className="landing-btn landing-btn-secondary"
          href="mailto:contato@sigma.io?subject=Agendar%20demonstra%C3%A7%C3%A3o%20do%20SIGMA%20Studio&body=Ol%C3%A1,%20gostaria%20de%20agendar%20uma%20demonstra%C3%A7%C3%A3o%20do%20SIGMA%20Studio."
        >
          <Calendar />
          Agendar demonstra&ccedil;&atilde;o
        </a>
      </div>
      <Link to="/app" className="landing-btn-ghost">
        <LayoutDashboard />
        Ou explorar o prot&oacute;tipo agora
      </Link>
    </section>
  )
}
