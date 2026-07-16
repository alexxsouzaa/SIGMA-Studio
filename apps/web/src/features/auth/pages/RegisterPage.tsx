import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Hexagon,
  Activity,
  BrainCircuit,
  ShieldCheck,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'

const registerSchema = z
  .object({
    username: z.string().min(3, 'Mínimo 3 caracteres'),
    email: z.string().min(1, 'Informe seu e-mail').email('E-mail inválido'),
    display_name: z.string().min(1, 'Informe seu nome'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme sua senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser, isLoading, error, clearError } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterForm) {
    clearError()
    const ok = await registerUser({
      username: data.username,
      email: data.email,
      password: data.password,
      display_name: data.display_name,
    })
    if (ok) {
      navigate('/app', { replace: true })
    }
  }

  return (
    <div className="login-shell">
      <a href="#register-username" className="skip-link">
        Pular para o formulário de cadastro
      </a>

      <div className="login-brand">
        <div className="login-brand-grid" />
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <Hexagon />
          </div>
          <h1 className="login-brand-name">SIGMA Studio</h1>
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
        <button
          className="login-theme-toggle"
          onClick={toggle}
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Moon /> : <Sun />}
        </button>

        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Criar conta</h2>
            <p className="login-card-subtitle">
              Preencha os dados para começar a usar o SIGMA Studio.
            </p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Formulário de cadastro"
          >
            <div className={`login-field${errors.display_name ? ' login-field-error' : ''}`}>
              <label className="login-label" htmlFor="register-name">
                Nome completo
              </label>
              <div className="login-input-wrap">
                <input
                  id="register-name"
                  className="login-input"
                  type="text"
                  placeholder="Ana Silva"
                  autoComplete="name"
                  aria-invalid={errors.display_name ? 'true' : undefined}
                  {...registerField('display_name')}
                />
              </div>
              {errors.display_name && (
                <span className="login-error-msg" role="alert" style={{ display: 'block' }}>
                  {errors.display_name.message}
                </span>
              )}
            </div>

            <div className={`login-field${errors.username ? ' login-field-error' : ''}`}>
              <label className="login-label" htmlFor="register-username">
                Nome de usuário
              </label>
              <div className="login-input-wrap">
                <input
                  id="register-username"
                  className="login-input"
                  type="text"
                  placeholder="ana.silva"
                  autoComplete="username"
                  aria-invalid={errors.username ? 'true' : undefined}
                  {...registerField('username')}
                />
              </div>
              {errors.username && (
                <span className="login-error-msg" role="alert" style={{ display: 'block' }}>
                  {errors.username.message}
                </span>
              )}
            </div>

            <div className={`login-field${errors.email ? ' login-field-error' : ''}`}>
              <label className="login-label" htmlFor="register-email">
                E-mail
              </label>
              <div className="login-input-wrap">
                <input
                  id="register-email"
                  className="login-input"
                  type="email"
                  placeholder="ana@sigma.studio"
                  autoComplete="email"
                  aria-invalid={errors.email ? 'true' : undefined}
                  {...registerField('email')}
                />
              </div>
              {errors.email && (
                <span className="login-error-msg" role="alert" style={{ display: 'block' }}>
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className={`login-field${errors.password ? ' login-field-error' : ''}`}>
              <label className="login-label" htmlFor="register-password">
                Senha
              </label>
              <div className="login-input-wrap">
                <input
                  id="register-password"
                  className="login-input login-input-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? 'true' : undefined}
                  {...registerField('password')}
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

            <div className={`login-field${errors.confirmPassword ? ' login-field-error' : ''}`}>
              <label className="login-label" htmlFor="register-confirm">
                Confirmar senha
              </label>
              <div className="login-input-wrap">
                <input
                  id="register-confirm"
                  className="login-input"
                  type="password"
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  aria-invalid={errors.confirmPassword ? 'true' : undefined}
                  {...registerField('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <span className="login-error-msg" role="alert" style={{ display: 'block' }}>
                  {errors.confirmPassword.message}
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

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 className="login-spinner" style={{ display: 'block', animation: 'spin 600ms linear infinite' }} />
              ) : (
                <span className="login-submit-text">Criar conta</span>
              )}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--fg-secondary)' }}>
              Já tem uma conta?{' '}
              <Link to="/login" style={{ color: 'var(--fg)', fontWeight: 600 }}>
                Entrar
              </Link>
            </p>
          </form>
        </div>

        <div className="login-footer">
          SIGMA Studio v2.4.1 &middot; Plataforma Industrial IoT
        </div>
      </div>
    </div>
  )
}
