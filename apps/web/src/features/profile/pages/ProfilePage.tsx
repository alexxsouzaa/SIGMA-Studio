import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Save, Loader2 } from "lucide-react"
import { useAuthStore } from "@/stores/authStore"

const profileSchema = z.object({
  display_name: z.string().min(1, "Nome obrigatorio"),
  email: z.string().min(1, "E-mail obrigatorio").email("E-mail invalido"),
})

type ProfileForm = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Informe a senha atual"),
    new_password: z.string().min(6, "Minimo 6 caracteres"),
    confirm_password: z.string().min(1, "Confirme a nova senha"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Senhas nao conferem",
    path: ["confirm_password"],
  })

type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, updateProfile, changePassword, isLoading } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [pwdSaved, setPwdSaved] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [pwdError, setPwdError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (user) {
      reset({ display_name: user.display_name ?? "", email: user.email })
    }
  }, [user, reset])

  async function onSaveProfile(data: ProfileForm) {
    setProfileError(null)
    const ok = await updateProfile({ display_name: data.display_name, email: data.email })
    if (ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setProfileError(useAuthStore.getState().error ?? "Erro ao salvar perfil")
    }
  }

  async function onChangePassword(data: PasswordForm) {
    setPwdError(null)
    const ok = await changePassword({ current_password: data.current_password, new_password: data.new_password })
    if (ok) {
      setPwdSaved(true)
      resetPwd()
      setTimeout(() => setPwdSaved(false), 2500)
    } else {
      setPwdError(useAuthStore.getState().error ?? "Erro ao alterar senha")
    }
  }

  const initials = user
    ? (user.display_name ?? user.username).split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
      <div className="widget" style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 80, height: 80, borderRadius: "var(--radius-xl)", background: "var(--surface-hover)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 600, color: "var(--fg-secondary)" }}>
              {initials}
            </div>
            <button style={{ position: "absolute", bottom: -2, right: -2, width: 28, height: 28, borderRadius: "50%", background: "var(--fg)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg)" }}>
              <Camera size={14} />
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 2 }}>
              {user?.display_name ?? user?.username ?? "Usuario"}
            </h1>
            <p style={{ fontSize: 14, color: "var(--fg-secondary)", marginBottom: 8 }}>
              @{user?.username}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--fg-muted)" }}>
              <span>{user?.email}</span>
              <span>Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "---"}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="widget">
          <div className="widget-header">
            <div className="widget-title">Informacoes Pessoais</div>
          </div>
          <form className="widget-body" onSubmit={handleSubmit(onSaveProfile)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label className="login-label">Nome completo</label>
              <input className="login-input" style={{ height: 36 }} {...register("display_name")} />
              {errors.display_name && <span className="login-error-msg" role="alert" style={{ display: "block" }}>{errors.display_name.message}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label className="login-label">E-mail</label>
              <input className="login-input" style={{ height: 36 }} {...register("email")} />
              {errors.email && <span className="login-error-msg" role="alert" style={{ display: "block" }}>{errors.email.message}</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label className="login-label">Usuario</label>
              <input className="login-input" value={user?.username ?? ""} readOnly style={{ height: 36, opacity: 0.6, cursor: "not-allowed" }} />
            </div>
            {profileError && <span className="login-error-msg" role="alert" style={{ display: "block", color: "var(--danger)" }}>{profileError}</span>}
            <button type="submit" className="widget-action-btn" disabled={isLoading} style={{ padding: "8px 20px", width: "auto", alignSelf: "flex-start", background: "var(--fg)", color: "var(--bg)" }}>
              {isLoading ? <Loader2 className="login-spinner" style={{ display: "block", animation: "spin 600ms linear infinite" }} /> : <><Save /> Salvar</>}
            </button>
          </form>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="widget">
            <div className="widget-header">
              <div className="widget-title">Alterar Senha</div>
            </div>
            <form className="widget-body" onSubmit={handlePwdSubmit(onChangePassword)} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label className="login-label">Senha atual</label>
                <input className="login-input" type="password" placeholder="********" style={{ height: 36 }} {...registerPwd("current_password")} />
                {pwdErrors.current_password && <span className="login-error-msg" role="alert" style={{ display: "block" }}>{pwdErrors.current_password.message}</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label className="login-label">Nova senha</label>
                  <input className="login-input" type="password" placeholder="********" style={{ height: 36 }} {...registerPwd("new_password")} />
                  {pwdErrors.new_password && <span className="login-error-msg" role="alert" style={{ display: "block" }}>{pwdErrors.new_password.message}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <label className="login-label">Confirmar</label>
                  <input className="login-input" type="password" placeholder="********" style={{ height: 36 }} {...registerPwd("confirm_password")} />
                  {pwdErrors.confirm_password && <span className="login-error-msg" role="alert" style={{ display: "block" }}>{pwdErrors.confirm_password.message}</span>}
                </div>
              </div>
              {pwdError && <span className="login-error-msg" role="alert" style={{ display: "block", color: "var(--danger)" }}>{pwdError}</span>}
              <button type="submit" className="widget-action-btn" disabled={isLoading} style={{ padding: "8px", width: "auto", justifyContent: "center" }}>
                {isLoading ? <Loader2 className="login-spinner" style={{ display: "block", animation: "spin 600ms linear infinite" }} /> : "Alterar senha"}
              </button>
            </form>
          </div>

          <div className="widget">
            <div className="widget-header">
              <div className="widget-title">Informacoes da Conta</div>
            </div>
            <div className="widget-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--fg-secondary)" }}>Status</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: user?.active ? "var(--success)" : "var(--danger)" }}>
                  {user?.active ? "Ativa" : "Inativa"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--fg-secondary)" }}>ID</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--fg-muted)" }}>{user?.uuid ?? "---"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {saved && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--success)", color: "#fff", padding: "12px 20px", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: "var(--shadow-lg)" }}>
          Perfil salvo com sucesso
        </div>
      )}
      {pwdSaved && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "var(--success)", color: "#fff", padding: "12px 20px", borderRadius: "var(--radius-md)", fontSize: 13, fontWeight: 500, zIndex: 200, boxShadow: "var(--shadow-lg)" }}>
          Senha alterada com sucesso
        </div>
      )}
    </div>
  )
}
