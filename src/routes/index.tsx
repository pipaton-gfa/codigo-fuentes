import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutTemplate, MonitorSmartphone, Phone, ShoppingCart } from "lucide-react";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Código Fuentes - Páginas web estratégicas" },
      {
        name: "description",
        content: "Landing pages, quioscos con carrito de compra y multipáginas enlazadas.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    const services = document.querySelectorAll<HTMLElement>(".source-reveal-service");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      services.forEach((service) => service.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    }, { threshold: 0.2 });

    services.forEach((service) => observer.observe(service));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".source-hero-image");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hero || reducedMotion) return;

    let frame = 0;
    const updateHero = () => {
      const distance = Math.max(hero.offsetHeight * 0.75, 1);
      const start = Math.max(0, hero.offsetTop - window.innerHeight * 0.45);
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      hero.style.setProperty("--source-hero-progress", progress.toString());
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateHero);
    };

    updateHero();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main className="source-index">
      <SiteHeader />

      <section id="inicio" className="source-intro">
        <h1>Tu éxito digital, hecho con <span>inteligencia y cariño</span></h1>
        <p>En <strong>Código Fuentes</strong> hacemos que tu presencia en internet fluya con naturalidad, claridad y velocidad. Sitios modernos, estables y listos para hacer crecer tu negocio.</p>
        <p className="source-instruction">Haz clic en una de las opciones de abajo para ver ejemplos de nuestros proyectos.</p>
        <div className="source-hero-image">
          <img className="source-hero-water" src="/descarga.jpg" alt="Fuente de agua digital cristalina con reflejos celestes y corrientes limpias" />
          <img className="source-hero-logo" src="/logo-cf.png" alt="Código Fuentes" />
        </div>
      </section>

      <section id="servicios" className="source-services">
        <div className="source-services-heading">
          <h2>Nuestros servicios</h2>
          <p>Elige una barra para ver ejemplos y cotizar directamente.</p>
        </div>
        <div className="source-service-list">
          <Link to="/landing-pages" className="source-service source-service-short source-reveal-service">
            <span className="source-service-icon"><MonitorSmartphone aria-hidden="true" /></span>
            <span className="source-service-copy"><strong>Landing pages</strong><small>Página directa y atractiva para captar clientes</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/quioscos" className="source-service source-service-medium source-reveal-service">
            <span className="source-service-icon"><ShoppingCart aria-hidden="true" /></span>
            <span className="source-service-copy"><strong>Quioscos con carritos de compra</strong><small>Ventas en línea con pagos integrados con Mercado Pago</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/multipaginas" className="source-service source-service-long source-reveal-service">
            <span className="source-service-icon"><LayoutTemplate aria-hidden="true" /></span>
            <span className="source-service-copy"><strong>Multipáginas enlazadas</strong><small>Sitios corporativos completos con múltiples secciones conectadas</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer id="contacto" className="source-footer">
        <div className="source-footer-grid">
          <div>
            <h3>Código Fuentes</h3>
            <p>Tu éxito digital, hecho con inteligencia y cariño. Creamos soluciones web modernas para emprendedores y empresas.</p>
            <span className="source-footer-badge">Tecnología fluida + IA + Trato personal</span>
          </div>
          <div>
            <h4>Quiénes somos</h4>
            <p>Somos un emprendimiento chileno especializado en crear páginas web profesionales con apoyo de inteligencia artificial. Entregas ágiles, costos accesibles y soporte cercano.</p>
          </div>
          <div>
            <h4>Información legal</h4>
            <p><a href="mailto:gabriel.fer.fuentes@gmail.com?subject=Términos%20de%20privacidad">Términos de privacidad</a></p>
            <p><a href="mailto:gabriel.fer.fuentes@gmail.com?subject=Términos%20de%20uso">Términos de uso</a></p>
          </div>
          <div>
            <h4>Contáctame</h4>
            <p><a className="source-contact" href="mailto:gabriel.fer.fuentes@gmail.com">gabriel.fer.fuentes@gmail.com</a></p>
            <p><a className="source-contact" href="tel:+56952128607"><Phone aria-hidden="true" /> +56 9 5212 8607</a></p>
            <p><a className="source-contact" href="https://www.instagram.com/codigo_fuentes95" target="_blank" rel="noopener noreferrer">@codigo_fuentes95</a></p>
          </div>
        </div>
        <p className="source-copyright">© 2026 Código Fuentes. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
