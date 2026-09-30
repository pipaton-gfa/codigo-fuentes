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
    <div style={{ width: "100%", minHeight: "100vh", overflowX: "hidden", position: "relative", color: "#f0f8ff" }}>
      <style>{`
        .content-layer {
          position: relative;
          z-index: 10;
          background: linear-gradient(135deg, #010a15, #002845, #001225);
          min-height: 100vh;
        }

        header {
          position: relative;
          z-index: 20;
        }

        .glass-panel {
          background: rgba(0, 15, 30, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 229, 255, 0.15);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1);
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
          background: rgba(0, 25, 45, 0.7);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 12px;
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }
        .marketing-card:hover {
          transform: translateY(-8px) scale(1.02);
          background: rgba(0, 40, 70, 0.85);
          border-color: #00e5ff;
          box-shadow: 0 15px 35px rgba(0, 229, 255, 0.25), 0 0 15px rgba(0, 229, 255, 0.1) inset;
        }
        .marketing-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(0, 229, 255, 0.1), transparent);
          transform: skewX(-25deg);
          transition: 0.5s;
        }
        .marketing-card:hover::before {
          left: 150%;
        }

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
                         0 25px 20px rgba(0, 0, 0, 0.5);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .neon-3d-title { animation: none; transform: none; }
          .scroll-reveal { transition: none; opacity: 1; transform: none; }
        }
      `}</style>

      <div className="content-layer">
        <main className="source-index">
          <SiteHeader />

          <section id="inicio" className="source-intro" style={{ padding: "4rem 1rem" }}>
            <div className="glass-panel scroll-reveal" style={{ maxWidth: "800px", margin: "0 auto 3rem auto", textAlign: "center" }}>
              <h1 className="neon-3d-title">
                Tu éxito digital, hecho con <span>inteligencia y cariño</span>
              </h1>
              <p style={{ fontSize: "1.15rem", lineHeight: "1.6", color: "#e0f2fe", marginBottom: "1rem" }}>
                En <strong>Landing Fuentes</strong> hacemos que tu presencia en internet fluya con naturalidad, claridad y velocidad. Sitios modernos, estables y listos para hacer crecer tu negocio, ideales para emprendedores, empresas y productores de eventos y fiestas.
              </p>
              <p className="source-instruction" style={{ color: "#00e5ff", fontWeight: "bold", letterSpacing: "0.5px" }}>
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
                border: "3px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.7), 0 0 15px rgba(0, 180, 255, 0.8)",
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
                <h2 style={{ color: "#ffffff", textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>Nuestros servicios</h2>
                <p style={{ color: "#b0d4ff" }}>Elige una barra para ver nuestros trabajos.</p>
              </div>
              <div className="source-service-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Link to="/landing-pages" className="source-service source-service-short scroll-reveal marketing-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", color: "#fff", textDecoration: "none" }}>
                  <span className="source-service-icon" style={{ marginRight: "1rem", color: "#00e5ff" }}><MonitorSmartphone aria-hidden="true" size={32} /></span>
                  <span className="source-service-copy" style={{ flexGrow: 1 }}>
                    <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: "0.25rem" }}>Landing pages</strong>
                    <small style={{ color: "#a0c4e0", fontSize: "0.9rem" }}>Página directa y atractiva para captar clientes</small>
                  </span>
                  <ArrowRight aria-hidden="true" style={{ color: "#00e5ff" }} />
                </Link>
                <Link to="/quioscos" className="source-service source-service-medium scroll-reveal marketing-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", color: "#fff", textDecoration: "none" }}>
                  <span className="source-service-icon" style={{ marginRight: "1rem", color: "#00e5ff" }}><ShoppingCart aria-hidden="true" size={32} /></span>
                  <span className="source-service-copy" style={{ flexGrow: 1 }}>
                    <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: "0.25rem" }}>Tiendas con carritos de compra</strong>
                    <small style={{ color: "#a0c4e0", fontSize: "0.9rem" }}>Ventas en línea con pagos integrados con Mercado Pago</small>
                  </span>
                  <ArrowRight aria-hidden="true" style={{ color: "#00e5ff" }} />
                </Link>
                <Link to="/multipaginas" className="source-service source-service-long scroll-reveal marketing-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", color: "#fff", textDecoration: "none" }}>
                  <span className="source-service-icon" style={{ marginRight: "1rem", color: "#00e5ff" }}><LayoutTemplate aria-hidden="true" size={32} /></span>
                  <span className="source-service-copy" style={{ flexGrow: 1 }}>
                    <strong style={{ display: "block", fontSize: "1.2rem", marginBottom: "0.25rem" }}>Próximamente</strong>
                    <small style={{ color: "#a0c4e0", fontSize: "0.9rem" }}>Multipáginas enlazadas</small>
                  </span>
                  <ArrowRight aria-hidden="true" style={{ color: "#00e5ff" }} />
                </Link>
              </div>
            </div>
          </section>

          <footer 
            id="contacto" 
            className="source-footer scroll-reveal"
            style={{
              position: "relative",
              zIndex: 1,
              backgroundImage: "linear-gradient(to bottom, rgba(0, 10, 20, 0.95) 0%, rgba(0, 70, 120, 0.7) 40%, rgba(150, 230, 255, 0.9) 85%, rgba(255, 255, 255, 1) 100%)",
              backgroundBlendMode: "normal",
              padding: "4rem 2rem 2rem 2rem",
              marginTop: "2rem",
              color: "#001225",
              borderTop: "1px solid rgba(0, 229, 255, 0.3)"
            }}
          >
            <div className="source-footer-grid" style={{ position: "relative", zIndex: 10, maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "2rem" }}>
              <div className="glass-panel" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(0,0,0,0.1)", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                <h3 style={{ color: "#00e5ff" }}>Landing Fuentes</h3>
                <p>Tu éxito digital, hecho con inteligencia y cariño. Creamos soluciones web modernas para emprendedores, empresas y productores de eventos.</p>
                <span className="source-footer-badge" style={{ display: "inline-block", background: "#00e5ff", color: "#001225", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.85rem", fontWeight: "bold", marginTop: "1rem" }}>Tecnología fluida + IA + Trato personal</span>
              </div>
              <div className="glass-panel" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(0,0,0,0.1)", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                <h4 style={{ color: "#00e5ff" }}>Quiénes somos</h4>
                <p>Somos un emprendimiento chileno especializado en crear páginas web profesionales con apoyo de inteligencia artificial. Entregas ágiles, costos accesibles y soporte cercano.</p>
              </div>
              <div className="glass-panel" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(0,0,0,0.1)", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                <h4 style={{ color: "#00e5ff" }}>Información legal</h4>
                <p><a href="mailto:gabriel.fuentes@landingfuentes.online?subject=Términos%20de%20privacidad" style={{ color: "#fff", textDecoration: "underline" }}>Términos de privacidad</a></p>
                <p><a href="mailto:gabriel.fuentes@landingfuentes.online?subject=Términos%20de%20uso" style={{ color: "#fff", textDecoration: "underline" }}>Términos de uso</a></p>
              </div>
              <div className="glass-panel" style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(0,0,0,0.1)", color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                <h4 style={{ color: "#00e5ff" }}>Contáctame</h4>
                <p><a className="source-contact" href="mailto:gabriel.fuentes@landingfuentes.online" style={{ color: "#fff", textDecoration: "none" }}>gabriel.fuentes@landingfuentes.online</a></p>
                <p><a className="source-contact" href="tel:+56952128607" style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}><Phone aria-hidden="true" size={16} /> +56 9 5212 8607</a></p>
                <p><a className="source-contact" href="https://www.instagram.com/landing_fuentes/" target="_blank" rel="noopener noreferrer" style={{ color: "#fff", textDecoration: "none" }}>@landing_fuentes</a></p>
              </div>
            </div>
            <p className="source-copyright" style={{ position: "relative", zIndex: 10, textAlign: "center", marginTop: "2rem", fontWeight: "bold", color: "#000" }}>© 2026 Landing Fuentes. Todos los derechos reservados.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}