import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Download,
  History,
  LayoutGrid,
  Lock,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { type DragEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  buildMachinesCsv,
  TrackingProvider,
  useTracking,
  type Locality,
  type LogEntry,
  type Machine,
} from "@/lib/tracking";

export const Route = createFileRoute("/rastreo")({
  head: () => ({ meta: [{ title: "Sistema de rastreo - Landing Fuentes" }] }),
  component: RastreoRoute,
});

// Contraseña fija del panel de control. Protege agregar/editar/exportar y
// también mover máquinas entre localidades: sin contraseña, el tablero es
// de solo lectura (arrastrar y soltar queda deshabilitado).
const PANEL_PASSWORD = "mecl123";
const PANEL_SESSION_KEY = "tracking.panelUnlocked";

const UNASSIGNED_ID = "__sin_asignar__";

// Ordena por número de máquina de menor a mayor. Si ambos valores son
// numéricos se comparan como números (para que "2" quede antes que "10");
// si no, se usa orden alfabético como respaldo.
function compareMachineNumbers(a: string, b: string) {
  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) return numA - numB;
  return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" });
}

function readUnlockedFromSession() {
  try {
    return sessionStorage.getItem(PANEL_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function usePanelUnlocked() {
  const [unlocked, setUnlocked] = useState(readUnlockedFromSession);

  const unlock = () => {
    setUnlocked(true);
    try {
      sessionStorage.setItem(PANEL_SESSION_KEY, "1");
    } catch {
      /* Ignorar */
    }
  };

  return { unlocked, unlock };
}

function RastreoRoute() {
  return (
    <TrackingProvider>
      <RastreoBoard />
    </TrackingProvider>
  );
}

function RastreoBoard() {
  const { localities, machines, logs, moveMachine } = useTracking();
  const { unlocked, unlock } = usePanelUnlocked();
  const [panelOpen, setPanelOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const unassigned = useMemo(() => machines.filter((m) => m.localityId === null), [machines]);

  const columns = useMemo(
    () => [
      ...(unassigned.length > 0 ? [{ id: UNASSIGNED_ID, name: "Sin asignar" } as Locality] : []),
      ...localities,
    ],
    [unassigned, localities],
  );

  const machinesByColumn = (columnId: string) =>
    machines
      .filter((m) => (columnId === UNASSIGNED_ID ? m.localityId === null : m.localityId === columnId))
      .sort((a, b) => compareMachineNumbers(a.machineNumber, b.machineNumber));

  const handleDrop = (event: DragEvent<HTMLElement>, columnId: string) => {
    if (!unlocked) return;
    event.preventDefault();
    setDragOverColumn(null);
    const machineId = event.dataTransfer.getData("text/plain");
    if (!machineId) return;
    moveMachine(machineId, columnId === UNASSIGNED_ID ? null : columnId);
  };

  return (
    <main className="tracker-shell">
      <header className="tracker-header">
        <h1>Sistema de rastreo</h1>
        <div className="tracker-header-actions">
          <span className={`tracker-mode-badge${unlocked ? " is-unlocked" : ""}`}>
            {unlocked ? (
              <>
                <LayoutGrid aria-hidden="true" /> Edición habilitada
              </>
            ) : (
              <>
                <Lock aria-hidden="true" /> Solo lectura
              </>
            )}
          </span>
          <div className="tracker-log-wrap">
            <button
              type="button"
              className="tracker-log-trigger"
              onClick={() => setLogOpen((open) => !open)}
              aria-label="Abrir historial de movimientos"
              aria-expanded={logOpen}
            >
              <History aria-hidden="true" />
              {logs.length > 0 && <span className="tracker-log-count">{logs.length}</span>}
            </button>
            {logOpen && <LogPanel logs={logs} onClose={() => setLogOpen(false)} />}
          </div>
          <button
            type="button"
            className="tracker-panel-trigger"
            onClick={() => setPanelOpen(true)}
            aria-label="Abrir panel de control"
          >
            <Settings aria-hidden="true" />
          </button>
        </div>
      </header>

      {!unlocked && (
        <p className="tracker-readonly-notice">
          <Lock aria-hidden="true" /> Estás viendo el tablero en modo solo lectura. Ingresa la
          contraseña en el panel de control para poder mover, agregar o editar máquinas.
        </p>
      )}

      {columns.length === 0 ? (
        <p className="tracker-empty">
          Todavía no hay localidades ni máquinas. Abre el panel de control para agregar la
          primera.
        </p>
      ) : (
        <div className="tracker-board">
          {columns.map((column) => (
            <section
              key={column.id}
              className={`tracker-column${dragOverColumn === column.id ? " is-drag-over" : ""}`}
              onDragOver={(event) => {
                if (!unlocked) return;
                event.preventDefault();
                setDragOverColumn(column.id);
              }}
              onDragLeave={() => setDragOverColumn((current) => (current === column.id ? null : current))}
              onDrop={(event) => handleDrop(event, column.id)}
            >
              <h2>{column.name}</h2>
              <div className="tracker-column-body">
                {machinesByColumn(column.id).map((machine) => (
                  <article
                    key={machine.id}
                    className={`tracker-card${unlocked ? "" : " is-locked"}`}
                    draggable={unlocked}
                    title={unlocked ? undefined : "Inicia sesión en el panel de control para mover esta máquina"}
                    onDragStart={(event) => {
                      if (!unlocked) {
                        event.preventDefault();
                        return;
                      }
                      event.dataTransfer.setData("text/plain", machine.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                  >
                    {!unlocked && <Lock aria-hidden="true" className="tracker-card-lock" />}
                    <LayoutGrid aria-hidden="true" />
                    <strong>N° {machine.machineNumber}</strong>
                    <span>Serie {machine.serialNumber}</span>
                    <span>Comercio {machine.commerceNumber}</span>
                  </article>
                ))}
                {machinesByColumn(column.id).length === 0 && (
                  <p className="tracker-column-empty">
                    {unlocked ? "Arrastra una máquina aquí" : "Sin máquinas en esta localidad"}
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {panelOpen && (
        <ControlPanel unlocked={unlocked} onUnlock={unlock} onClose={() => setPanelOpen(false)} />
      )}
    </main>
  );
}

function formatLogTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timePart = date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  return `${datePart} ${timePart}`;
}

function LogPanel({ logs, onClose }: { logs: LogEntry[]; onClose: () => void }) {
  const listRef = useRef<HTMLDivElement>(null);

  // Al abrir o al llegar un movimiento nuevo, ir al final (último mensaje),
  // como en un chat.
  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [logs.length]);

  return (
    <>
      <div className="tracker-log-backdrop" role="presentation" onClick={onClose} />
      <div
        className="tracker-log-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Historial de movimientos"
      >
        <div className="tracker-log-header">
          <span>
            <History aria-hidden="true" /> Historial de movimientos
          </span>
          <button type="button" aria-label="Cerrar historial" onClick={onClose}>
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="tracker-log-list" ref={listRef}>
          {logs.length === 0 ? (
            <p className="tracker-log-empty">
              Todavía no hay movimientos registrados. Cada vez que agregues, muevas o elimines una
              máquina, aparecerá aquí con fecha y hora.
            </p>
          ) : (
            logs.map((entry) => (
              <div key={entry.id} className={`tracker-log-bubble tracker-log-bubble-${entry.action}`}>
                {entry.action === "moved" ? (
                  <p className="tracker-log-text">
                    <strong>Máquina {entry.machineLabel}</strong>
                    <span className="tracker-log-route">
                      {entry.fromLocality ?? "Sin asignar"}
                      <ArrowRight aria-hidden="true" />
                      {entry.toLocality ?? "Sin asignar"}
                    </span>
                  </p>
                ) : (
                  <p className="tracker-log-text">{entry.message}</p>
                )}
                <span className="tracker-log-time">{formatLogTimestamp(entry.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function ControlPanel({
  unlocked,
  onUnlock,
  onClose,
}: {
  unlocked: boolean;
  onUnlock: () => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === PANEL_PASSWORD) {
      setAuthError("");
      onUnlock();
      return;
    }
    setAuthError("Contraseña incorrecta.");
  };

  return (
    <div className="tracker-panel-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="tracker-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracker-panel-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="tracker-panel-close" aria-label="Cerrar panel" onClick={onClose}>
          <X aria-hidden="true" />
        </button>

        {unlocked ? (
          <ControlPanelContent />
        ) : (
          <div className="tracker-login">
            <span className="source-kicker">ACCESO PRIVADO</span>
            <h2 id="tracker-panel-title">
              <Lock aria-hidden="true" /> Panel de control
            </h2>
            <p>Ingresa la contraseña para agregar máquinas, localidades y exportar los datos.</p>
            <form onSubmit={submitPassword}>
              <label htmlFor="tracker-password">Contraseña</label>
              <input
                id="tracker-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                autoFocus
                required
              />
              {authError && (
                <p className="source-login-error" role="alert">
                  {authError}
                </p>
              )}
              <button type="submit" className="source-login-submit">
                Entrar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ControlPanelContent() {
  const { localities, machines, addLocality, removeLocality, addMachine, removeMachine } =
    useTracking();

  const [localityName, setLocalityName] = useState("");
  const [localityError, setLocalityError] = useState("");

  const [serialNumber, setSerialNumber] = useState("");
  const [machineNumber, setMachineNumber] = useState("");
  const [commerceNumber, setCommerceNumber] = useState("");
  const [machineLocalityId, setMachineLocalityId] = useState("");
  const [machineError, setMachineError] = useState("");

  const submitLocality = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addLocality(localityName);
    if (!result.ok) {
      setLocalityError(result.message);
      return;
    }
    setLocalityError("");
    setLocalityName("");
  };

  const submitMachine = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = addMachine({
      serialNumber,
      machineNumber,
      commerceNumber,
      localityId: machineLocalityId || null,
    });
    if (!result.ok) {
      setMachineError(result.message);
      return;
    }
    setMachineError("");
    setSerialNumber("");
    setMachineNumber("");
    setCommerceNumber("");
  };

  const localityName_ = (id: string | null) =>
    id ? (localities.find((l) => l.id === id)?.name ?? "Desconocida") : "Sin asignar";

  const downloadCsv = () => {
    const csv = buildMachinesCsv(machines, localities);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "maquinas-rastreo.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="tracker-panel-content">
      <span className="source-kicker">PANEL PRIVADO</span>
      <h2 id="tracker-panel-title">Panel de control</h2>

      <div className="tracker-panel-grid">
        <section className="tracker-panel-box">
          <h3>Agregar localidad</h3>
          <form className="tracker-form" onSubmit={submitLocality}>
            <label htmlFor="locality-name">Nombre</label>
            <input
              id="locality-name"
              value={localityName}
              onChange={(event) => setLocalityName(event.target.value)}
              placeholder="Ej: Bodega"
              required
            />
            {localityError && (
              <p className="source-login-error" role="alert">
                {localityError}
              </p>
            )}
            <button type="submit">
              <Plus aria-hidden="true" /> Agregar localidad
            </button>
          </form>
        </section>

        <section className="tracker-panel-box">
          <h3>Agregar máquina</h3>
          <form className="tracker-form" onSubmit={submitMachine}>
            <label htmlFor="machine-serial">Número de serie</label>
            <input
              id="machine-serial"
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
              required
            />
            <label htmlFor="machine-number">Número de máquina</label>
            <input
              id="machine-number"
              value={machineNumber}
              onChange={(event) => setMachineNumber(event.target.value)}
              required
            />
            <label htmlFor="machine-commerce">Número de comercio</label>
            <input
              id="machine-commerce"
              value={commerceNumber}
              onChange={(event) => setCommerceNumber(event.target.value)}
              required
            />
            <label htmlFor="machine-locality">Localidad</label>
            <select
              id="machine-locality"
              value={machineLocalityId}
              onChange={(event) => setMachineLocalityId(event.target.value)}
            >
              <option value="">Sin asignar</option>
              {localities.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            {machineError && (
              <p className="source-login-error" role="alert">
                {machineError}
              </p>
            )}
            <button type="submit">
              <Plus aria-hidden="true" /> Agregar máquina
            </button>
          </form>
        </section>
      </div>

      <section className="tracker-panel-box tracker-panel-box-wide">
        <div className="tracker-table-heading">
          <h3>Máquinas registradas ({machines.length})</h3>
          <button type="button" className="tracker-download" onClick={downloadCsv}>
            <Download aria-hidden="true" /> Descargar Excel (CSV)
          </button>
        </div>

        {machines.length === 0 ? (
          <p className="tracker-column-empty">Aún no hay máquinas registradas.</p>
        ) : (
          <div className="tracker-table-wrap">
            <table className="tracker-table">
              <thead>
                <tr>
                  <th>N° de máquina</th>
                  <th>N° de serie</th>
                  <th>N° de comercio</th>
                  <th>Localidad</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {machines.map((machine: Machine) => (
                  <tr key={machine.id}>
                    <td>{machine.machineNumber}</td>
                    <td>{machine.serialNumber}</td>
                    <td>{machine.commerceNumber}</td>
                    <td>{localityName_(machine.localityId)}</td>
                    <td>
                      <button
                        type="button"
                        aria-label="Eliminar máquina"
                        onClick={() => removeMachine(machine.id)}
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {localities.length > 0 && (
        <section className="tracker-panel-box tracker-panel-box-wide">
          <h3>Localidades ({localities.length})</h3>
          <ul className="tracker-locality-list">
            {localities.map((locality) => (
              <li key={locality.id}>
                <span>{locality.name}</span>
                <button
                  type="button"
                  aria-label={`Eliminar ${locality.name}`}
                  onClick={() => {
                    const result = removeLocality(locality.id);
                    if (!result.ok) window.alert(result.message);
                  }}
                >
                  <Trash2 aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
