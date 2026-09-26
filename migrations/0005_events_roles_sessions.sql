CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT CHECK (id BETWEEN 1 AND 9999),
  name TEXT NOT NULL,
  href TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_events (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, event_id)
);

INSERT OR IGNORE INTO events (id, name, href) VALUES
  (1, 'La Florida · Fiesta de la Chilenidad', '/landing-fiesta-de-la-chilenidad.html?evento=0001'),
  (2, 'El Colorado', '/landing-el-colorado.html?evento=0002'),
  (3, 'Donaciones a idols', '/idols?evento=0003'),
  (4, 'More More Dream · Eternal Dream', '/mmd-eternal-dream?evento=0004');

CREATE TRIGGER IF NOT EXISTS restrict_super_admin_insert
BEFORE INSERT ON users
WHEN NEW.role NOT IN ('user', 'admin', 'super_admin')
  OR (NEW.role = 'super_admin' AND NEW.username != 'pipaton')
BEGIN
  SELECT RAISE(ABORT, 'super_admin is reserved for pipaton');
END;

CREATE TRIGGER IF NOT EXISTS restrict_super_admin_update
BEFORE UPDATE OF username, role ON users
WHEN NEW.role NOT IN ('user', 'admin', 'super_admin')
  OR (NEW.role = 'super_admin' AND NEW.username != 'pipaton')
  OR (OLD.username = 'pipaton' AND (NEW.username != 'pipaton' OR NEW.role != 'super_admin'))
BEGIN
  SELECT RAISE(ABORT, 'super_admin is reserved for pipaton');
END;

CREATE TRIGGER IF NOT EXISTS protect_super_admin_delete
BEFORE DELETE ON users
WHEN OLD.username = 'pipaton'
BEGIN
  SELECT RAISE(ABORT, 'pipaton is the protected super_admin');
END;

UPDATE users SET role = 'super_admin' WHERE username = 'pipaton';