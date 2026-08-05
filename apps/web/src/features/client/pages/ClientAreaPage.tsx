import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Bell,
  BookOpen,
  BrainCircuit,
  Cpu,
  LifeBuoy,
  LogIn,
  Moon,
  Server,
  ShieldCheck,
  Sun,
  UserPlus,
} from 'lucide-react'
import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'
import { getGoogleLoginUrl } from '@/lib/api'
import ClientNav from '../components/ClientNav'
import ClientFooter from '../components/ClientFooter'
import ScrollReveal from '@/features/landing/components/ScrollReveal'

function GoogleSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  )
}

const features = [
  {
    title: 'Telemetria em tempo real',
    text: 'Acompanhe sensores e equipamentos ao vivo, com gráficos atualizados a cada segundo.',
    icon: <Activity />,
    variant: 'accent',
  },
  {
    title: 'Alarmes e notificações',
    text: 'Receba alertas instantâneos quando um ativo sair do padrão operacional.',
    icon: <Bell />,
    variant: 'yellow',
  },
  {
    title: 'Gestão de dispositivos',
    text: 'Cadastre, organize e acompanhe o ciclo de vida completo dos seus dispositivos.',
    icon: <Cpu />,
    variant: 'green',
  },
  {
    title: 'IA preditiva',
    text: 'Antecipe falhas com modelos de manutenção preditiva treinados no seu contexto.',
    icon: <BrainCircuit />,
    variant: 'blue',
  },
]

export default function ClientAreaPage() {
  const { theme, toggle } = useThemeStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    document.body.classList.add('client-page')
    return () => document.body.classList.remove('client-page')
  }, [])

  const handleGoogle = () => {
    window.location.href = getGoogleLoginUrl()
  }

  return (
    <>
      <a href="#client-hero" className="skip-link">
        Pular para o conte&uacute;do principal
      </a>

      <ClientNav />

      <button
        type="button"
        className="landing-theme-toggle"
        onClick={toggle}
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Moon /> : <Sun />}
      </button>

      <main>
        <section className="client-hero" id="client-hero">
          <div className="landing-hero-grid" />
          <div className="client-hero-glow" />

          <div className="client-hero-inner">
            <div className="landing-hero-tag">
              <ShieldCheck />
              Portal exclusivo para clientes
            </div>
            <h1>
              Bem-vindo &agrave; <span className="gradient-text">&Aacute;rea do Cliente</span>
            </h1>
            <p>
              Gerencie seus dispositivos, acompanhe a telemetria em tempo real e
              receba alertas e insights de IA &mdash; tudo em um s&oacute; painel.
            </p>

            {isAuthenticated ? (
              <div className="client-auth-banner" role="status">
                <ShieldCheck />
                <span>Voc&ecirc; j&aacute; est&aacute; conectado.</span>
                <Link to="/app" className="client-auth-banner-btn">
                  Ir para o painel
                </Link>
              </div>
            ) : (
              <div className="client-cards">
                <ScrollReveal className="landing-reveal client-card">
                  <div className="client-card-icon blue">
                    <LogIn />
                  </div>
                  <div className="client-card-label">J&aacute; sou cliente</div>
                  <h2 className="client-card-title">Entrar na plataforma</h2>
                  <p className="client-card-text">
                    Acesse o SIGMA Studio com suas credenciais e continue
                    monitorando seus ativos de onde parou.
                  </p>
                  <div className="client-card-actions">
                    <Link to="/login" className="landing-btn landing-btn-primary">
                      Entrar na plataforma
                    </Link>
                    <button
                      type="button"
                      className="client-sso"
                      onClick={handleGoogle}
                    >
                      <GoogleSvg />
                      Continuar com Google
                    </button>
                  </div>
                </ScrollReveal>

                <ScrollReveal className="landing-reveal client-card" delay={120}>
                  <div className="client-card-icon green">
                    <UserPlus />
                  </div>
                  <div className="client-card-label">Novo cliente</div>
                  <h2 className="client-card-title">Criar uma conta</h2>
                  <p className="client-card-text">
                    Crie sua conta e comece a monitorar sensores e equipamentos
                    em poucos minutos.
                  </p>
                  <div className="client-card-actions">
                    <Link to="/register" className="landing-btn landing-btn-primary">
                      Criar conta gratuita
                    </Link>
                    <p className="client-card-note">
                      Configura&ccedil;&atilde;o guiada passo a passo, sem custo inicial.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            )}
          </div>
        </section>

        <section className="client-section client-section-alt">
          <div className="client-section-inner">
            <div className="client-section-heading">
              <div className="client-section-eyebrow">O que voc&ecirc; acessa</div>
              <h2>Tudo o que sua opera&ccedil;&atilde;o precisa</h2>
              <p>
                Ferramentas completas para monitorar, diagnosticar e prever
                falhas nos seus ativos.
              </p>
            </div>
            <div className="client-features-grid">
              {features.map((feature, index) => (
                <ScrollReveal
                  key={feature.title}
                  className="landing-reveal client-feature"
                  delay={index * 80}
                >
                  <div className={`client-feature-icon ${feature.variant}`}>
                    {feature.icon}
                  </div>
                  <div className="client-feature-title">{feature.title}</div>
                  <div className="client-feature-text">{feature.text}</div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="client-support">
          <div className="client-support-inner">
            <div className="client-support-heading">
              <h2>Precisa de ajuda?</h2>
              <p>
                Consulte a documenta&ccedil;&atilde;o, fale com o suporte ou acompanhe
                a disponibilidade da plataforma.
              </p>
            </div>
            <div className="client-support-links">
              <Link to="/app" className="client-support-link">
                <BookOpen />
                Documenta&ccedil;&atilde;o
              </Link>
              <a
                href="#client-hero"
                className="client-support-link"
                onClick={(e) => e.preventDefault()}
              >
                <LifeBuoy />
                Central de suporte
              </a>
              <a
                href="#client-hero"
                className="client-support-link"
                onClick={(e) => e.preventDefault()}
              >
                <Server />
                Status da plataforma
              </a>
            </div>
          </div>
        </section>
      </main>

      <ClientFooter />
    </>
  )
}
