import { Check } from 'lucide-react'
import ScrollReveal from './ScrollReveal'

interface LandingPricingProps {
  onPricingClick?: () => void
}

export default function LandingPricing({ onPricingClick }: LandingPricingProps) {
  return (
    <section className="landing-section" id="planos">
      <div className="landing-section-inner">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--info)',
              marginBottom: 12,
            }}
          >
            Planos e pre&ccedil;os
          </div>
          <h2
            style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              marginBottom: 10,
            }}
          >
            Escolha o plano ideal para sua opera&ccedil;&atilde;o
          </h2>
          <p style={{ fontSize: 14, color: 'var(--fg-muted)' }}>
            Teste gr&aacute;tis por 14 dias. Sem cart&atilde;o de cr&eacute;dito.
          </p>
        </div>
        <div className="landing-pricing-grid">
          <ScrollReveal className="landing-reveal landing-pricing-card">
            <div className="landing-pricing-name">Starter</div>
            <div className="landing-pricing-price">
              R$ 0 <span>/ m&ecirc;s</span>
            </div>
            <div className="landing-pricing-desc">
              Para pequenas opera&ccedil;&otilde;es e teste da plataforma.
            </div>
            <ul className="landing-pricing-features">
              <li>
                <Check />
                At&eacute; 50 dispositivos
              </li>
              <li>
                <Check />
                Dashboard e alarmes
              </li>
              <li>
                <Check />
                3 gateways
              </li>
              <li>
                <Check />
                Suporte por email
              </li>
            </ul>
            <button
              type="button"
              className="landing-pricing-btn"
              onClick={onPricingClick}
            >
              Come&ccedil;ar gr&aacute;tis
            </button>
          </ScrollReveal>

          <ScrollReveal
            className="landing-reveal landing-pricing-card featured"
            delay={120}
          >
            <div className="landing-pricing-name">Profissional</div>
            <div className="landing-pricing-price">
              R$ 299 <span>/ m&ecirc;s</span>
            </div>
            <div className="landing-pricing-desc">
              Para plantas industriais em opera&ccedil;&atilde;o cont&iacute;nua.
            </div>
            <ul className="landing-pricing-features">
              <li>
                <Check />
                At&eacute; 500 dispositivos
              </li>
              <li>
                <Check />
                IA preditiva com TinyML
              </li>
              <li>
                <Check />
                Gateways ilimitados
              </li>
              <li>
                <Check />
                Firmware OTA
              </li>
              <li>
                <Check />
                Telemetria com hist&oacute;rico
              </li>
              <li>
                <Check />
                Suporte priorit&aacute;rio 24h
              </li>
            </ul>
            <button
              type="button"
              className="landing-pricing-btn primary"
              onClick={onPricingClick}
            >
              Assinar agora
            </button>
          </ScrollReveal>

          <ScrollReveal className="landing-reveal landing-pricing-card" delay={240}>
            <div className="landing-pricing-name">Enterprise</div>
            <div className="landing-pricing-price">
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: 'var(--fg)',
                  fontFamily: 'inherit',
                }}
              >
                Sob consulta
              </span>
            </div>
            <div className="landing-pricing-desc">
              Para m&uacute;ltiplas plantas e requisitos personalizados.
            </div>
            <ul className="landing-pricing-features">
              <li>
                <Check />
                Dispositivos ilimitados
              </li>
              <li>
                <Check />
                On-premise ou nuvem
              </li>
              <li>
                <Check />
                LDAP / SSO
              </li>
              <li>
                <Check />
                SLA garantido
              </li>
              <li>
                <Check />
                Gerente de conta dedicado
              </li>
              <li>
                <Check />
                Treinamento in loco
              </li>
            </ul>
            <button
              type="button"
              className="landing-pricing-btn"
              onClick={onPricingClick}
            >
              Falar com vendas
            </button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
