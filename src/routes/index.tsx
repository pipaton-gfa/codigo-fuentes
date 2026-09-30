import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LayoutTemplate, MonitorSmartphone, Phone, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Landing Fuentes - Páginas web estratégicas" },
      {
        name: "description",
        content: "Landing pages, quioscos con carrito de compra y multipáginas enlazadas.",
      },
      { property: "og:title", content: "Landing Fuentes | Diseño y desarrollo web" },
      {
        property: "og:description",
        content: "Creamos sitios web modernos y estratégicos para emprendedores y empresas.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://landingfuentes.online/" },
      { property: "og:image", content: "https://landingfuentes.online/descarga.jpg" },
      { property: "og:image:alt", content: "Fuente de agua digital de Landing Fuentes" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Landing Fuentes | Diseño y desarrollo web" },
      {
        name: "twitter:description",
        content: "Creamos sitios web modernos y estratégicos para emprendedores y empresas.",
      },
      { name: "twitter:image", content: "https://landingfuentes.online/descarga.jpg" },
    ],
  }),
  component: Index,
});

function Index() {
  const [heroTransform, setHeroTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const [titleTransform, setTitleTransform] = useState("perspective(1000px) translateY(0px) rotateX(0deg)");

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

  /* 
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
  */

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let frame = 0;
    const animateTitle = () => {
      const time = Date.now() / 400; 
      const bounce = Math.abs(Math.sin(time));
      const y = -bounce * 10; // Efecto de rebote hacia arriba
      const rotateX = bounce * 15; // Efecto 3D de inclinación al rebotar
      
      setTitleTransform(`perspective(1000px) translateY(${y}px) rotateX(${rotateX}deg)`);
      frame = requestAnimationFrame(animateTitle);
    };

    animateTitle();
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
    // Movimiento notorio con efecto 3D
    const rotateY = x * 40; 
    const rotateX = y * -40;
    setHeroTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`);
  };

  const handleHeroMouseEnter = () => setIsHoveringHero(true);
  const handleHeroMouseLeave = () => {
    setIsHoveringHero(false);
    setHeroTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  };

  return (
    <main className="source-index">
      <SiteHeader />

      <section id="inicio" className="source-intro">
        <h1 style={{
          color: "#00e5ff",
          textShadow: "0 0 10px rgba(0, 229, 255, 0.8), 0 0 20px rgba(0, 229, 255, 0.6), 0 0 30px rgba(0, 229, 255, 0.4), 0px 10px 15px rgba(0, 0, 0, 0.9)",
          transform: titleTransform,
          willChange: "transform",
          display: "block"
        }}>
          Tu éxito digital, hecho con <span style={{ color: "#00e5ff", textShadow: "inherit" }}>inteligencia y cariño</span>
        </h1>
        <p>En <strong>Landing Fuentes</strong> hacemos que tu presencia en internet fluya con naturalidad, claridad y velocidad. Sitios modernos, estables y listos para hacer crecer tu negocio.</p>
        <p className="source-instruction">Haz clic en una de las opciones de abajo para ver ejemplos de nuestros proyectos.</p>
        <div 
          className="source-hero-image"
          onMouseMove={handleHeroMouseMove}
          onMouseEnter={handleHeroMouseEnter}
          onMouseLeave={handleHeroMouseLeave}
          style={{
            transform: heroTransform,
            transition: isHoveringHero ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
            border: "3px solid rgba(255, 255, 255, 0.8)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.7), 0 0 15px rgba(0, 180, 255, 0.8)",
            borderRadius: "16px",
            zIndex: 10
          }}
        >
          <img className="source-hero-water" src="/descarga.gif" alt="Fuente de agua digital cristalina con reflejos celestes y corrientes limpias" />
          <img className="source-hero-logo" src="/logo-cf.png" alt="Landing Fuentes" style={{ width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
        </div>
      </section>

      <section id="servicios" className="source-services">
        <div className="source-services-heading">
          <h2>Nuestros servicios</h2>
          <p>Elige una barra para ver nuestros trabajos.</p>
        </div>
        <div className="source-service-list">
          <Link to="/landing-pages" className="source-service source-service-short source-reveal-service">
            <span className="source-service-icon"><MonitorSmartphone aria-hidden="true" /></span>
            <span className="source-service-copy"><strong>Landing pages</strong><small>Página directa y atractiva para captar clientes</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/quioscos" className="source-service source-service-medium source-reveal-service">
            <span className="source-service-icon"><ShoppingCart aria-hidden="true" /></span>
            <span className="source-service-copy"><strong>tiendas con carritos de compra</strong><small>Ventas en línea con pagos integrados con Mercado Pago</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/multipaginas" className="source-service source-service-long source-reveal-service">
            <span className="source-service-icon"><LayoutTemplate aria-hidden="true" /></span>
            <span className="source-service-copy"><strong>proximamente</strong><small>proximamente</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer 
        id="contacto" 
        className="source-footer"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(255,255,255,0.3) 100%)",
          backgroundBlendMode: "overlay"
        }}
      >
        <div className="source-footer-grid">
          <div>
            <h3>Landing Fuentes</h3>
            <p>Tu éxito digital, hecho con inteligencia y cariño. Creamos soluciones web modernas para emprendedores y empresas.</p>
            <span className="source-footer-badge">Tecnología fluida + IA + Trato personal</span>
          </div>
          <div>
            <h4>Quiénes somos</h4>
            <p>Somos un emprendimiento chileno especializado en crear páginas web profesionales con apoyo de inteligencia artificial. Entregas ágiles, costos accesibles y soporte cercano.</p>
          </div>
          <div>
            <h4>Información legal</h4>
            <p><a href="mailto:gabriel.fuentes@landingfuentes.online?subject=Términos%20de%20privacidad">Términos de privacidad</a></p>
            <p><a href="mailto:gabriel.fuentes@landingfuentes.online?subject=Términos%20de%20uso">Términos de uso</a></p>
          </div>
          <div>
            <h4>Contáctame</h4>
            <p><a className="source-contact" href="mailto:gabriel.fuentes@landingfuentes.online">gabriel.fuentes@landingfuentes.online</a></p>
            <p><a className="source-contact" href="tel:+56952128607"><Phone aria-hidden="true" /> +56 9 5212 8607</a></p>
            <p><a className="source-contact" href="https://www.instagram.com/landing_fuentes/" target="_blank" rel="noopener noreferrer">@landing_fuentes</a></p>
          </div>
        </div>
        <p className="source-copyright">© 2026 Landing Fuentes. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}