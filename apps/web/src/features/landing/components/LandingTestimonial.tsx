import ScrollReveal from './ScrollReveal'

export default function LandingTestimonial() {
  return (
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
  )
}
