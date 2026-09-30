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
    <div style={{ width: "100%", minHeight: "100vh", overflowX: "hidden", position: "relative" }}>
      <style>{`
        .react-water-background {
          position: fixed;
          top: -10%;
          left: -10%;
          width: 120%;
          height: 120%;
          background: linear-gradient(135deg, #010a15, #002845, #001225);
          filter: url(#water-filter);
          z-index: -1;
        }
        .content-layer {
          position: relative;
          z-index: 1;
          background: rgba(0, 0, 0, 0.25);
          min-height: 100vh;
        }
        /* Animación 3D rebote con neón */
        .neon-3d-title {
          color: #00e5ff !important;
          display: inline-block;
          animation: float-3d-bounce 3s ease-in-out infinite;
          transform-style: preserve-3d;
          margin-bottom: 20px;
        }
        .neon-3d-title span {
          color: #00e5ff !important;
        }
        @keyframes float-3d-bounce {
          0%, 100% {
            transform: perspective(1000px) translateY(0) rotateX(0deg) scale(1);
            text-shadow: 0 0 5px rgba(0, 229, 255, 0.8), 
                         0 0 15px rgba(0, 229, 255, 0.6), 
                         0 0 30px rgba(0, 229, 255, 0.4), 
                         0 10px 10px rgba(0, 0, 0, 0.9);
          }
          50% {
            transform: perspective(1000px) translateY(-15px) rotateX(15deg) scale(1.03);
            text-shadow: 0 0 10px rgba(0, 229, 255, 1), 
                         0 0 25px rgba(0, 229, 255, 0.8), 
                         0 0 45px rgba(0, 229, 255, 0.6), 
                         0 25px 20px rgba(0, 0, 0, 0.5); /* Sombra más alejada dando ilusión de altura */
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .neon-3d-title { animation: none; transform: none; }
        }
      `}</style>

      {/* Filtro SVG para el efecto de agua de fondo */}
      <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
        <filter id="water-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.01" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.005 0.01; 0.008 0.015; 0.005 0.01" dur="20s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      <div className="react-water-background" />

      <div className="content-layer">
        <main className="source-index">
          <SiteHeader />

          <section id="inicio" className="source-intro">
            {/* Título modificado con la clase neon-3d-title */}
            <h1 className="neon-3d-title">
              Tu éxito digital, hecho con <span>inteligencia y cariño</span>
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
      </div>
    </div>
  );
}