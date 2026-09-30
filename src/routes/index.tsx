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
        content: "Creamos sitios web modernos y estratégicos para emprendedores, empresas y productores de eventos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://landingfuentes.online/" },
      { property: "og:image", content: "https://landingfuentes.online/descarga.jpg" },
      { property: "og:image:alt", content: "Fuente de agua digital de Landing Fuentes" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Landing Fuentes | Diseño y desarrollo web" },
      {
        name: "twitter:description",
        content: "Creamos sitios web modernos y estratégicos para emprendedores, empresas y productores de eventos.",
      },
      { name: "twitter:image", content: "https://landingfuentes.online/descarga.jpg" },
    ],
  }),
  component: Index,
});

function FlowRibbons({ side }: { side: "left" | "right" }) {
  const flip = side === "right";
  return (
    <svg
      aria-hidden="true"
      className={`page-wave-svg ${flip ? "page-wave-svg-right" : "page-wave-svg-left"}`}
      viewBox="0 0 320 1600"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`fw-orange-${side}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.78 0.2 55)" />
          <stop offset="100%" stopColor="oklch(0.66 0.19 40)" />
        </linearGradient>
        <linearGradient id={`fw-cyan-${side}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.85 0.14 205)" />
          <stop offset="100%" stopColor="oklch(0.7 0.15 220)" />
        </linearGradient>
        <linearGradient id={`fw-blue-${side}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.16 240)" />
          <stop offset="100%" stopColor="oklch(0.5 0.15 250)" />
        </linearGradient>
      </defs>
      <g transform={flip ? "translate(320 0) scale(-1 1)" : undefined}>
        <path
          d="M-60 -60 C 120 140, -20 340, 110 560 C 230 760, -10 940, 120 1160 C 240 1360, 10 1500, 90 1660 L -60 1660 Z"
          fill={`url(#fw-blue-${side})`}
          opacity="0.55"
        />
        <path
          d="M-60 120 C 90 260, 150 420, 60 620 C -20 800, 160 960, 70 1180 C -10 1380, 140 1500, 60 1660 L -60 1660 Z"
          fill={`url(#fw-cyan-${side})`}
          opacity="0.7"
        />
        <path
          d="M-60 -60 C 60 100, 130 300, 40 500 C -40 680, 120 860, 30 1080 C -50 1280, 100 1420, 20 1660 L -60 1660 Z"
          fill={`url(#fw-orange-${side})`}
          opacity="0.8"
        />
        <path
          d="M-60 120 C 90 260, 150 420, 60 620 C -20 800, 160 960, 70 1180 C -10 1380, 140 1500, 60 1660"
          fill="none"
          stroke="oklch(0.92 0.1 200)"
          strokeWidth="6"
          opacity="0.8"
        />
        <path
          d="M-60 -60 C 60 100, 130 300, 40 500 C -40 680, 120 860, 30 1080 C -50 1280, 100 1420, 20 1660"
          fill="none"
          stroke="oklch(0.88 0.16 65)"
          strokeWidth="5"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}

function Index() {
  const [heroTransform, setHeroTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)");
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      revealElements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    revealElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    
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
    <div style={{ width: "100%", minHeight: "100vh", overflowX: "hidden", position: "relative", backgroundColor: "#ffffff", color: "#1e293b" }}>
      <style>{`
        .page-wave-svg {
          position: fixed;
          top: 0;
          bottom: 0;
          height: 100vh;
          width: 250px;
          z-index: 5;
          pointer-events: none;
        }
        .page-wave-svg-left {
          left: 0;
        }
        .page-wave-svg-right {
          right: 0;
        }
        @media (max-width: 768px) {
          .page-wave-svg {
            width: 120px;
            opacity: 0.5;
          }
        }

        .content-layer {
          position: relative;
          z-index: 10;
          background: transparent;
          min-height: 100vh;
        }

        .glass-panel {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
          color: #0f172a;
        }

        .scroll-reveal {
          opacity: 0;
          transform: translateY(40px) scale(0.98);
          transition: all 0.8s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: opacity, transform;
        }
        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        
        .source-service-list > *:nth-child(1) { transition-delay: 0.1s; }
        .source-service-list > *:nth-child(2) { transition-delay: 0.2s; }
        .source-service-list > *:nth-child(3) { transition-delay: 0.3s; }

        .marketing-card {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          color: #0f172a;
        }
        .marketing-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: #ffffff;
          border-color: #0284c7;
          box-shadow: 0 15px 35px rgba(2, 132, 199, 0.12), 0 0 15px rgba(2, 132, 199, 0.05) inset;
        }
        .marketing-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(2, 132, 199, 0.08), transparent);
          transform: skewX(-25deg);
          transition: 0.5s;
        }
        .marketing-card:hover::before {
          left: 150%;
        }

        .neon-3d-title {
          color: #0284c7 !important;
          display: inline-block;
          animation: float-3d-bounce 3s ease-in-out infinite;
          transform-style: preserve-3d;
          margin-bottom: 20px;
        }
        .neon-3d-title span {
          color: #0284c7 !important;
        }
        @keyframes float-3d-bounce {
          0%, 100% {
            transform: perspective(1000px) translateY(0) rotateX(0deg) scale(1);
            text-shadow: 0 2px 5px rgba(2, 132, 199, 0.2), 
                         0 5px 15px rgba(2, 132, 199, 0.15);
          }
          50% {
            transform: perspective(1000px) translateY(-15px) rotateX(15deg) scale(1.03);
            text-shadow: 0 4px 8px rgba(2, 132, 199, 0.3), 
                         0 8px 20px rgba(2, 132, 199, 0.2);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .neon-3d-title { animation: none; transform: none; }
          .scroll-reveal { transition: none; opacity: 1; transform: none; }
        }
      `}</style>

      <FlowRibbons side="left" />
      <FlowRibbons side="right" />

      <div className="content-layer">
        <main className="source-index">
          <SiteHeader />

          <section id="inicio" className="source-intro" style={{ padding: "4rem 1rem" }}>
            <div className="glass-panel scroll-reveal" style={{ maxWidth: "800px", margin: "0 auto 3rem auto", textAlign: "center" }}>
              <h1 className="neon-3d-title">
                Tu éxito digital, hecho con <span>inteligencia y cariño</span>
              </h1>
              <p style={{ fontSize: "1.15rem", lineHeight: "1.6", color: "#334155", marginBottom: "1rem" }}>
                En <strong>Landing Fuentes</strong> hacemos que tu presencia en internet fluya con naturalidad, claridad y velocidad. Sitios modernos, estables y listos para hacer crecer tu negocio, ideales para emprendedores, empresas y productores de eventos y fiestas.
              </p>
              <p className="source-instruction" style={{ color: "#0284c7", fontWeight: "bold", letterSpacing: "0.5px" }}>
                Haz clic en una de las opciones de abajo para ver ejemplos de nuestros proyectos.
              </p>
            </div>

            <div 
              className="source-hero-image scroll-reveal"
              onMouseMove={handleHeroMouseMove}
              onMouseEnter={handleHeroMouseEnter}
              onMouseLeave={handleHeroMouseLeave}
              style={{
                transform: heroTransform,
                transition: isHoveringHero ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
                border: "3px solid #ffffff",
                boxShadow: "0 20px 40px rgba(0,0,0,0.12), 0 0 15px rgba(2, 132, 199, 0.2)",
                borderRadius: "16px",
                zIndex: 10,
                margin: "0 auto",
                display: "block"
              }}
            >
              <img className="source-hero-water" src="/descarga.gif" alt="Fuente de agua digital cristalina con reflejos celestes y corrientes limpias" />
              <img className="source-hero-logo" src="/logo-cf.png" alt="Landing Fuentes" style={{ width: "100%", height: "100%", maxWidth: "none", maxHeight: "none" }} />
            </div>
          </section>

          <section id="servicios" className="source-services" style={{ padding: "4rem 1rem", maxWidth: "1000px", margin: "0 auto" }}>
            <div className="glass-panel scroll-reveal">
              <div className="source-services-heading" style={{ textAlign: "center", marginBottom: "2rem" }}>
                <h2 style={{ color: "#0f172a" }}>Nuestros servicios</h2>
                <p style={{ color: "#475569" }}>Elige una barra para ver nuestros trabajos.</p>
              </div>
              <div className="source-service-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Link to="/landing-pages" className="source-service source-service-short scroll-reveal marketing-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", color: "#0f172a", textDecoration: "none" }}>
                  <span className="source-service-icon" style={{ marginRight: "1rem", color: "#0284c7" }}><MonitorSmartphone aria-hidden="true" size={32} /></span>
                  <span className="source-service-copy" style={{ flexGrow: 1 }}>
                    <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: "0.25rem", color: "#0f172a" }}>Landing pages</strong>
                    <small style={{ color: "#475569", fontSize: "0.9rem" }}>Página directa y atractiva para captar clientes</small>
                  </span>
                  <ArrowRight aria-hidden="true" style={{ color: "#0284c7" }} />
                </Link>
                <Link to="/quioscos" className="source-service source-service-medium scroll-reveal marketing-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", color: "#0f172a", textDecoration: "none" }}>
                  <span className="source-service-icon" style={{ marginRight: "1rem", color: "#0284c7" }}><ShoppingCart aria-hidden="true" size={32} /></span>
                  <span className="source-service-copy" style={{ flexGrow: 1 }}>
                    <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: "0.25rem", color: "#0f172a" }}>Tiendas con carritos de compra</strong>
                    <small style={{ color: "#475569", fontSize: "0.9rem" }}>Ventas en línea con pagos integrados con Mercado Pago</small>
                  </span>
                  <ArrowRight aria-hidden="true" style={{ color: "#0284c7" }} />
                </Link>
                <Link to="/multipaginas" className="source-service source-service-long scroll-reveal marketing-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", color: "#0f172a", textDecoration: "none" }}>
                  <span className="source-service-icon" style={{ marginRight: "1rem", color: "#0284c7" }}><LayoutTemplate aria-hidden="true" size={32} /></span>
                  <span className="source-service-copy" style={{ flexGrow: 1 }}>
                    <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: "0.25rem", color: "#0f172a" }}>Próximamente</strong>
                    <small style={{ color: "#475569", fontSize: "0.9rem" }}>Multipáginas enlazadas</small>
                  </span>
                  <ArrowRight aria-hidden="true" style={{ color: "#0284c7" }} />
                </Link>
              </div>
            </div>
          </section>

          <footer 
            id="contacto" 
            className="source-footer scroll-reveal"
            style={{
              backgroundColor: "#ffffff",
              padding: "4rem 2rem 2rem 2rem",
              marginTop: "2rem",
              color: "#0f172a",
              borderTop: "1px solid #e2e8f0"
            }}
          >
            <div className="source-footer-grid" style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
              <div className="glass-panel">
                <h3 style={{ color: "#0284c7" }}>Landing Fuentes</h3>
                <p style={{ color: "#334155" }}>Tu éxito digital, hecho con inteligencia y cariño. Creamos soluciones web modernas para emprendedores, empresas y productores de eventos.</p>
                <span className="source-footer-badge" style={{ display: "inline-block", background: "#0284c7", color: "#ffffff", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.85rem", fontWeight: "bold", marginTop: "1rem" }}>Tecnología fluida + IA + Trato personal</span>
              </div>
              <div className="glass-panel">
                <h4 style={{ color: "#0284c7" }}>Quiénes somos</h4>
                <p style={{ color: "#334155" }}>Somos un emprendimiento chileno especializado en crear páginas web profesionales con apoyo de inteligencia artificial. Entregas ágiles, costos accesibles y soporte cercano.</p>
              </div>
              <div className="glass-panel">
                <h4 style={{ color: "#0284c7" }}>Información legal</h4>
                <p><a href="mailto:gabriel.fuentes@landingfuentes.online?subject=Términos%20de%20privacidad" style={{ color: "#0284c7", textDecoration: "underline" }}>Términos de privacidad</a></p>
                <p><a href="mailto:gabriel.fuentes@landingfuentes.online?subject=Términos%20de%20uso" style={{ color: "#0284c7", textDecoration: "underline" }}>Términos de uso</a></p>
              </div>
              <div className="glass-panel">
                <h4 style={{ color: "#0284c7" }}>Contáctame</h4>
                <p><a className="source-contact" href="mailto:gabriel.fuentes@landingfuentes.online" style={{ color: "#0f172a", textDecoration: "none" }}>gabriel.fuentes@landingfuentes.online</a></p>
                <p><a className="source-contact" href="tel:+56952128607" style={{ color: "#0f172a", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}><Phone aria-hidden="true" size={16} /> +56 9 5212 8607</a></p>
                <p><a className="source-contact" href="https://www.instagram.com/landing_fuentes/" target="_blank" rel="noopener noreferrer" style={{ color: "#0f172a", textDecoration: "none" }}>@landing_fuentes</a></p>
              </div>
            </div>
            <p className="source-copyright" style={{ textAlign: "center", marginTop: "2rem", fontWeight: "bold", color: "#0f172a" }}>© 2026 Landing Fuentes. Todos los derechos reservados.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}