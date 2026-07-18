import {
  Layers,
  AlertTriangle,
  Terminal,
  Eye,
  BellRing,
  BrainCircuit,
  Check,
} from 'lucide-react'
import ScrollReveal from './ScrollReveal'

export default function LandingSolution() {
  return (
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
  )
}
