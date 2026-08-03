import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Activity,
  BrainCircuit,
  ShieldCheck,
  Moon,
  Sun,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { APP_VERSION_LABEL } from '@/version'

const loginSchema = z.object({
  username: z.string().min(1, 'Informe seu e-mail ou usuário.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginForm) {
    clearError()
    const ok = await login(data.username, data.password)
    if (ok) {
      navigate('/app', { replace: true })
    }
  }

  return (
    <div className="login-shell">
      <a href="#login-username" className="skip-link">
        Pular para o formulário de login
      </a>

      <div className="login-brand">
        <div className="login-brand-grid" />
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <img className="theme-logo-dark" src={`${import.meta.env.BASE_URL}logo-light.png`} alt="SIGMA Studio" style={{ height: 33, width: 'auto' }} />
            <img className="theme-logo-light" src={`${import.meta.env.BASE_URL}logo-dark.png`} alt="SIGMA Studio" style={{ height: 33, width: 'auto' }} />
          </div>
          <p className="login-brand-tagline">
            Plataforma de monitoramento industrial com IA integrada para IoT,
            automação e gestão de dispositivos.
          </p>
          <div className="login-brand-features">
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon">
                <Activity />
              </div>
              <div className="login-brand-feature-text">
                <strong>Telemetria em tempo real</strong>
                <br />
                Monitoramento contínuo de sensores e equipamentos com alertas
                inteligentes.
              </div>
            </div>
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon">
                <BrainCircuit />
              </div>
              <div className="login-brand-feature-text">
                <strong>IA / TinyML embarcada</strong>
                <br />
                Detecção de anomalias e manutenção preditiva diretamente nos
                dispositivos.
              </div>
            </div>
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon">
                <ShieldCheck />
              </div>
              <div className="login-brand-feature-text">
                <strong>Segurança de ponta a ponta</strong>
                <br />
                Comunicação criptografada, autenticação multifator e auditoria
                completa.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
          <Link
            to="/"
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--fg-muted)', transition: 'background var(--transition), color var(--transition)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--fg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-muted)' }}
            aria-label="Voltar para pagina inicial"
          >
            <ArrowLeft size={18} />
          </Link>
        </div>
        <button
          className="login-theme-toggle"
          onClick={toggle}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Moon /> : <Sun />}
        </button>

        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Entrar na plataforma</h2>
            <p className="login-card-subtitle">
              Insira suas credenciais para acessar o painel.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Formulário de login"
          >
            <div
              className={`login-field${errors.username ? ' login-field-error' : ''}`}
            >
              <label className="login-label" htmlFor="login-username">
                E-mail
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-username"
                  className="login-input"
                  type="text"
                  placeholder="operador@sigma.studio"
                  autoComplete="email"
                  aria-label="Endereço de e-mail"
                  aria-invalid={errors.username ? 'true' : undefined}
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <span className="login-error-msg" role="alert" style={{ display: 'block' }}>
                  {errors.username.message}
                </span>
              )}
            </div>

            <div
              className={`login-field${errors.password ? ' login-field-error' : ''}`}
            >
              <label className="login-label" htmlFor="login-password">
                Senha
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  className="login-input login-input-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-label="Senha"
                  aria-invalid={errors.password ? 'true' : undefined}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <span className="login-error-msg" role="alert" style={{ display: 'block' }}>
                  {errors.password.message}
                </span>
              )}
            </div>

            {error && (
              <div className="login-field" style={{ marginTop: -8 }}>
                <span className="login-error-msg" role="alert" style={{ display: 'block', color: 'var(--danger)' }}>
                  {error}
                </span>
              </div>
            )}

            <div className="login-options">
              <label className="login-checkbox-wrap">
                <input
                  type="checkbox"
                  className="login-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="login-checkbox-label">Lembrar-me</span>
              </label>
              <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 className="login-spinner" style={{ display: 'block', animation: 'spin 600ms linear infinite' }} />
              ) : (
                <span className="login-submit-text">Entrar</span>
              )}
            </button>

            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">ou</span>
              <div className="login-divider-line" />
            </div>

            <button type="button" className="login-sso">
              <KeyRound />
              Entrar com SSO corporativo
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-secondary)' }}>
              Não tem uma conta?{' '}
              <Link to="/register" style={{ color: 'var(--fg)', fontWeight: 600 }}>
                Criar conta
              </Link>
            </p>
          </form>
        </div>

        <div className="login-footer">
          SIGMA Studio {APP_VERSION_LABEL} &middot; Plataforma Industrial IoT
          <div className="login-footer-hint">
            Pressione <kbd>Enter</kbd> para enviar
          </div>
        </div>
      </div>
    </div>
  )
}
