import { useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Hexagon,
  CheckCircle,
  Menu,
  Moon,
  Sun,
  Rocket,
  LayoutDashboard,
  Calendar,
  Layers,
  AlertTriangle,
  Terminal,
  Eye,
  BellRing,
  BrainCircuit,
  Check,
  Factory,
  Zap,
  Droplets,
  Tractor,
  Package,
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'

function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('visible')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          io.unobserve(el)
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={className} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const { isAuthenticated } = useAuthStore()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.body.classList.add('landing-page')
    return () => document.body.classList.remove('landing-page')
  }, [])

  const toggleMobileMenu = useCallback(() => {
    const links = mobileMenuRef.current
    if (!links) return
    if (links.style.display === 'flex') {
      links.style.display = ''
    } else {
      links.style.display = 'flex'
      links.style.flexDirection = 'column'
      links.style.position = 'absolute'
      links.style.top = '52px'
      links.style.left = '0'
      links.style.right = '0'
      links.style.background = 'var(--surface)'
      links.style.padding = '12px'
      links.style.border = '1px solid var(--border)'
      links.style.borderRadius = '12px'
      links.style.margin = '4px 8px'
      links.style.boxShadow = 'var(--shadow-lg)'
    }
  }, [])

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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handlePricingClick = () => {
    if (isAuthenticated) {
      navigate('/app')
    } else {
      navigate('/login')
    }
  }

  return (
    <>
      <a href="#hero" className="skip-link">
        Pular para conte&uacute;do principal
      </a>

      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <button
            type="button"
            className="landing-nav-brand"
            onClick={() => scrollTo('hero')}
          >
            <Hexagon />
            SIGMA Studio
          </button>
          <div className="landing-nav-links" ref={mobileMenuRef}>
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
            onClick={toggleMobileMenu}
            aria-label="Abrir menu"
          >
            <Menu />
          </button>
        </div>
      </nav>

      <button
        type="button"
        className="landing-theme-toggle"
        onClick={toggleTheme}
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Moon /> : <Sun />}
      </button>

      <main>
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
                onClick={() => scrollTo('planos')}
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

        <section className="landing-section" id="solucao">
          <div className="landing-section-inner">
            <div className="landing-problem">
              <h2>
                Parada inesperada custa caro.{' '}
                <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>
                  Sabemos disso.
                </span>
              </h2>
              <p>
                Uma hora de downtime na linha de produ&ccedil;&atilde;o pode custar centenas
                de milhares de reais. Dados espalhados, alarmes ignorados e manuten&ccedil;&atilde;o
                reativa n&atilde;o s&atilde;o mais vi&aacute;veis.
              </p>
              <div className="landing-problem-cards">
                <ScrollReveal className="landing-reveal landing-problem-card">
                  <div className="landing-problem-card-icon danger">
                    <Layers />
                  </div>
                  <div className="landing-problem-card-title">Dados isolados</div>
                  <div className="landing-problem-card-text">
                    Dispositivos, gateways e sensores em sistemas separados. Nenhuma vis&atilde;o
                    unificada do que est&aacute; acontecendo na planta.
                  </div>
                </ScrollReveal>
                <ScrollReveal className="landing-reveal landing-problem-card" delay={120}>
                  <div className="landing-problem-card-icon warning">
                    <AlertTriangle />
                  </div>
                  <div className="landing-problem-card-title">Manuten&ccedil;&atilde;o reativa</div>
                  <div className="landing-problem-card-text">
                    Voc&ecirc; descobre o problema depois da parada. Sem alertas preditivos,
                    sem tempo para agir antes do impacto.
                  </div>
                </ScrollReveal>
                <ScrollReveal className="landing-reveal landing-problem-card" delay={240}>
                  <div className="landing-problem-card-icon info">
                    <Terminal />
                  </div>
                  <div className="landing-problem-card-title">Sistemas complexos</div>
                  <div className="landing-problem-card-text">
                    Curva de aprendizado alta, telas diferentes para cada fornecedor. Seus
                    t&eacute;cnicos perdem tempo navegando.
                  </div>
                </ScrollReveal>
              </div>
            </div>

            <div className="landing-solution-grid">
              <ScrollReveal className="landing-reveal landing-solution-card" delay={100}>
                <div>
                  <div className="landing-solution-icon blue">
                    <Eye />
                  </div>
                  <div className="landing-solution-label">Visibilidade total</div>
                  <div className="landing-solution-title">
                    Toda a planta em um &uacute;nico painel
                  </div>
                  <div className="landing-solution-text">
                    Dashboard unificado com status de dispositivos, alarmes em tempo real,
                    m&eacute;tricas de gateways e distribui&ccedil;&atilde;o de protocolos. O
                    que antes exigia 4 sistemas diferentes agora cabe em uma tela.
                  </div>
                  <ul className="landing-solution-list">
                    <li>
                      <Check />
                      Mais de 1.200 dispositivos monitorados simultaneamente
                    </li>
                    <li>
                      <Check />
                      6 protocolos industriais suportados (Modbus, MQTT, OPC UA, BACnet, CAN
                      Bus, HART)
                    </li>
                    <li>
                      <Check />
                      Atualiza&ccedil;&atilde;o em tempo real com indicador de lat&ecirc;ncia
                    </li>
                  </ul>
                </div>
                <div className="landing-solution-visual">
                  <div className="landing-solution-visual-inner">
                    <div className="landing-vis-row">
                      <div className="landing-vis-bar">
                        <div className="landing-vis-bar-fill blue" style={{ width: '76%' }} />
                      </div>
                      <div className="landing-vis-bar">
                        <div className="landing-vis-bar-fill green" style={{ width: '92%' }} />
                      </div>
                      <div className="landing-vis-bar">
                        <div className="landing-vis-bar-fill yellow" style={{ width: '45%' }} />
                      </div>
                    </div>
                    <div className="landing-vis-dots">
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot red" />
                      <span className="landing-vis-dot gray" />
                    </div>
                    <div className="landing-vis-row-center">
                      <span className="landing-vis-badge success">1.189 online</span>
                      <span className="landing-vis-badge danger">23 alarmes</span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="landing-reveal landing-solution-card reverse" delay={200}>
                <div>
                  <div className="landing-solution-icon red">
                    <BellRing />
                  </div>
                  <div className="landing-solution-label">Alerta inteligente</div>
                  <div className="landing-solution-title">
                    Alarmes que voc&ecirc; n&atilde;o ignora
                  </div>
                  <div className="landing-solution-text">
                    Classifica&ccedil;&atilde;o por severidade com cores e a&ccedil;&otilde;es
                    claras. Da detec&ccedil;&atilde;o ao reconhecimento em menos de 30 segundos.
                    Timeline completa e escalonamento autom&aacute;tico.
                  </div>
                  <ul className="landing-solution-list">
                    <li>
                      <Check />
                      Hierarquia: cr&iacute;tico, alerta, informativo
                    </li>
                    <li>
                      <Check />
                      Confirma&ccedil;&atilde;o com um clique e hist&oacute;rico por dispositivo
                    </li>
                    <li>
                      <Check />
                      Notifica&ccedil;&otilde;es em tempo real com indicador visual
                    </li>
                  </ul>
                </div>
                <div className="landing-solution-visual">
                  <div className="landing-solution-visual-inner">
                    <div
                      className="landing-vis-row-center"
                      style={{ flexDirection: 'column', gap: '10px' }}
                    >
                      <span
                        className="landing-vis-badge danger"
                        style={{ alignSelf: 'center' }}
                      >
                        CR&Iacute;TICO - Vibra&ccedil;&atilde;o 14.2mm/s
                      </span>
                      <span
                        className="landing-vis-badge info"
                        style={{ alignSelf: 'center' }}
                      >
                        ALERTA - Lat&ecirc;ncia 180ms
                      </span>
                      <span
                        className="landing-vis-badge success"
                        style={{ alignSelf: 'center' }}
                      >
                        RESOLVIDO - FW atualizado
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal className="landing-reveal landing-solution-card" delay={300}>
                <div>
                  <div className="landing-solution-icon green">
                    <BrainCircuit />
                  </div>
                  <div className="landing-solution-label">Intelig&ecirc;ncia preditiva</div>
                  <div className="landing-solution-title">
                    IA que aprende com seus dados
                  </div>
                  <div className="landing-solution-text">
                    Modelos de machine learning treinados na borda detectam anomalias antes
                    que virem falha. Predi&ccedil;&atilde;o de falhas com 94% de acur&aacute;cia,
                    direto no seu ch&atilde;o de f&aacute;brica.
                  </div>
                  <ul className="landing-solution-list">
                    <li>
                      <Check />
                      Modelos TinyML executados localmente, sem depender de nuvem
                    </li>
                    <li>
                      <Check />
                      Detec&ccedil;&atilde;o de anomalias em vibra&ccedil;&atilde;o, temperatura
                      e press&atilde;o
                    </li>
                    <li>
                      <Check />
                      Retreinamento cont&iacute;nuo com novos dados da planta
                    </li>
                  </ul>
                </div>
                <div className="landing-solution-visual">
                  <div className="landing-solution-visual-inner">
                    <div className="landing-vis-row-center">
                      <div className="landing-vis-stat">
                        <div className="landing-vis-stat-value">94,2%</div>
                        <div className="landing-vis-stat-label">Acur&aacute;cia</div>
                      </div>
                      <div className="landing-vis-stat">
                        <div className="landing-vis-stat-value">12ms</div>
                        <div className="landing-vis-stat-label">Infer&ecirc;ncia</div>
                      </div>
                      <div className="landing-vis-stat">
                        <div className="landing-vis-stat-value">3</div>
                        <div className="landing-vis-stat-label">Modelos</div>
                      </div>
                    </div>
                    <div className="landing-vis-dots">
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot green" />
                      <span className="landing-vis-dot gray" />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section-alt">
          <div className="landing-section-inner">
            <ScrollReveal className="landing-reveal landing-testimonial">
              <div className="landing-testimonial-quote">
                Reduzimos o tempo m&eacute;dio de resposta a alarmes de 45 minutos para menos
                de 5. A plataforma nos deu visibilidade que nunca tivemos antes sobre o que
                acontece na planta.
              </div>
              <div className="landing-testimonial-author">Carlos Mendes</div>
              <div className="landing-testimonial-role">
                Engenheiro de Automa&ccedil;&atilde;o &middot; Ind&uacute;stria Qu&iacute;mica
                Sul
              </div>
            </ScrollReveal>
          </div>
        </section>

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
                  onClick={handlePricingClick}
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
                  onClick={handlePricingClick}
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
                  onClick={handlePricingClick}
                >
                  Falar com vendas
                </button>
              </ScrollReveal>
            </div>
          </div>
        </section>

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
      </main>

      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-col">
            <div className="landing-footer-brand">
              <Hexagon />
              SIGMA Studio
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
              onClick={() => scrollTo('solucao')}
            >
              Solu&ccedil;&atilde;o
            </button>
            <button
              type="button"
              className="landing-footer-link"
              onClick={() => scrollTo('planos')}
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
    </>
  )
}
