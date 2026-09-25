import { Link, useNavigate } from "@tanstack/react-router";
import { LogIn, Menu, ShoppingCart, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCart } from "@/lib/cart";

type SiteHeaderProps = {
  showCart?: boolean;
  plain?: boolean;
};

export function SiteHeader({ showCart = false, plain = false }: SiteHeaderProps) {
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const openLogin = () => {
    setMenuOpen(false);
    setLoginError("");
    setLoginOpen(true);
  };

  const submitLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username !== "pipaton" || password !== "popo99") {
      setLoginError("Usuario o contraseña incorrectos.");
      return;
    }

    sessionStorage.setItem("codigo-fuentes.admin", "true");
    setLoginOpen(false);
    setUsername("");
    setPassword("");
    navigate({ to: "/admin" });
  };

  return (
    <>
      <header className="source-header">
        <div className="source-header-inner">
          <Link to="/" className="source-logo-link" aria-label="Código Fuentes, inicio">
            <img src="/banner-cf.png" alt="Código Fuentes" />
          </Link>

          {!plain && (
            <div className="source-header-actions">
              {showCart && (
                <Link to="/carrito" className="source-cart-button" aria-label="Ver carrito">
                  <ShoppingCart aria-hidden="true" />
                  {count > 0 && <span>{count}</span>}
                </Link>
              )}
              <button
                type="button"
                className="source-menu-button"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
              </button>
            </div>
          )}
        </div>

        {menuOpen && !plain && (
          <nav className="source-mobile-menu" aria-label="Navegación principal">
            <button type="button" onClick={openLogin}><LogIn aria-hidden="true" /> Iniciar sesión</button>
          </nav>
        )}
      </header>

      {loginOpen && (
        <div className="source-login-backdrop" role="presentation" onMouseDown={() => setLoginOpen(false)}>
          <div className="source-login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="source-login-close" aria-label="Cerrar inicio de sesión" onClick={() => setLoginOpen(false)}>
              <X aria-hidden="true" />
            </button>
            <span className="source-kicker">ACCESO PRIVADO</span>
            <h2 id="login-title">Iniciar sesión</h2>
            <p>Ingresa tus credenciales para administrar el proyecto.</p>
            <form onSubmit={submitLogin}>
              <label htmlFor="login-username">Usuario</label>
              <input id="login-username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
              <label htmlFor="login-password">Contraseña</label>
              <input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
              {loginError && <p className="source-login-error" role="alert">{loginError}</p>}
              <button type="submit" className="source-login-submit">Iniciar sesión</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
