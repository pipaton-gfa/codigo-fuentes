// -------------------------------------------------------------------
// Sistema de rastreo de máquinas (POS) por localidad.
// Almacenamiento 100% local (localStorage del navegador). No usa D1 ni
// ningún backend: pensado como "base de datos" local por ahora.
// -------------------------------------------------------------------
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locality = {
  id: string;
  name: string;
};

export type Machine = {
  id: string;
  serialNumber: string;
  machineNumber: string;
  commerceNumber: string;
  // null => la máquina aparece en la columna "Sin asignar".
  localityId: string | null;
};

export type NewMachineInput = {
  serialNumber: string;
  machineNumber: string;
  commerceNumber: string;
  localityId: string | null;
};

// Entrada del historial de movimientos. Por ahora vive solo en memoria
// (variable de estado de React) y se reinicia al recargar la página;
// está pensado para migrarse más adelante a una tabla en D1 y así quedar
// guardado de forma permanente.
export type LogEntry = {
  id: string;
  timestamp: number;
  machineLabel: string;
  action: "added" | "moved" | "removed";
  fromLocality: string | null;
  toLocality: string | null;
  message: string;
};

type TrackingContextValue = {
  localities: Locality[];
  machines: Machine[];
  logs: LogEntry[];
  addLocality: (name: string) => { ok: true } | { ok: false; message: string };
  removeLocality: (id: string) => { ok: true } | { ok: false; message: string };
  addMachine: (input: NewMachineInput) => { ok: true } | { ok: false; message: string };
  removeMachine: (id: string) => void;
  moveMachine: (machineId: string, localityId: string | null) => void;
};

const TrackingContext = createContext<TrackingContextValue | null>(null);

const LOCALITIES_KEY = "tracking.localities";
const MACHINES_KEY = "tracking.machines";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [localities, setLocalities] = useState<Locality[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  // Historial de movimientos: por ahora solo en memoria (ver nota en el
  // tipo LogEntry más arriba). No se lee ni se escribe en localStorage.
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Cargar datos guardados al montar.
  useEffect(() => {
    try {
      const rawLocalities = localStorage.getItem(LOCALITIES_KEY);
      if (rawLocalities) setLocalities(JSON.parse(rawLocalities) as Locality[]);

      const rawMachines = localStorage.getItem(MACHINES_KEY);
      if (rawMachines) setMachines(JSON.parse(rawMachines) as Machine[]);
    } catch {
      /* Ignorar almacenamiento corrupto */
    }
    setHydrated(true);
  }, []);

  // Persistir cada vez que cambian (evitando sobrescribir antes de hidratar).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(LOCALITIES_KEY, JSON.stringify(localities));
    } catch {
      /* Ignorar */
    }
  }, [localities, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(MACHINES_KEY, JSON.stringify(machines));
    } catch {
      /* Ignorar */
    }
  }, [machines, hydrated]);

  const value = useMemo<TrackingContextValue>(() => {
    const localityName = (id: string | null) =>
      id ? (localities.find((l) => l.id === id)?.name ?? "Desconocida") : null;

    const pushLog = (entry: Omit<LogEntry, "id" | "timestamp">) => {
      setLogs((prev) => [...prev, { ...entry, id: makeId(), timestamp: Date.now() }]);
    };

    return {
      localities,
      machines,
      logs,

      addLocality: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return { ok: false, message: "El nombre de la localidad es obligatorio." };
        const exists = localities.some((l) => l.name.toLowerCase() === trimmed.toLowerCase());
        if (exists) return { ok: false, message: "Ya existe una localidad con ese nombre." };
        setLocalities((prev) => [...prev, { id: makeId(), name: trimmed }]);
        return { ok: true };
      },

      removeLocality: (id) => {
        const hasMachines = machines.some((m) => m.localityId === id);
        if (hasMachines) {
          return {
            ok: false,
            message: "Mueve o elimina sus máquinas antes de borrar esta localidad.",
          };
        }
        setLocalities((prev) => prev.filter((l) => l.id !== id));
        return { ok: true };
      },

      addMachine: (input) => {
        const serialNumber = input.serialNumber.trim();
        const machineNumber = input.machineNumber.trim();
        const commerceNumber = input.commerceNumber.trim();
        if (!serialNumber || !machineNumber || !commerceNumber) {
          return { ok: false, message: "Completa número de serie, de máquina y de comercio." };
        }
        setMachines((prev) => [
          ...prev,
          {
            id: makeId(),
            serialNumber,
            machineNumber,
            commerceNumber,
            localityId: input.localityId,
          },
        ]);
        const toLocality = localityName(input.localityId);
        const machineLabel = `N° ${machineNumber} (Serie ${serialNumber})`;
        pushLog({
          machineLabel,
          action: "added",
          fromLocality: null,
          toLocality,
          message: `Máquina ${machineLabel} agregada${toLocality ? ` en ${toLocality}` : " sin asignar"}.`,
        });
        return { ok: true };
      },

      removeMachine: (id) => {
        const machine = machines.find((m) => m.id === id);
        setMachines((prev) => prev.filter((m) => m.id !== id));
        if (machine) {
          const fromLocality = localityName(machine.localityId);
          const machineLabel = `N° ${machine.machineNumber} (Serie ${machine.serialNumber})`;
          pushLog({
            machineLabel,
            action: "removed",
            fromLocality,
            toLocality: null,
            message: `Máquina ${machineLabel} eliminada${fromLocality ? ` (estaba en ${fromLocality})` : ""}.`,
          });
        }
      },

      moveMachine: (machineId, localityId) => {
        const machine = machines.find((m) => m.id === machineId);
        setMachines((prev) =>
          prev.map((m) => (m.id === machineId ? { ...m, localityId } : m)),
        );
        if (machine && machine.localityId !== localityId) {
          const fromLocality = localityName(machine.localityId);
          const toLocality = localityName(localityId);
          const machineLabel = `N° ${machine.machineNumber} (Serie ${machine.serialNumber})`;
          pushLog({
            machineLabel,
            action: "moved",
            fromLocality,
            toLocality,
            message: `Máquina ${machineLabel} movida de ${fromLocality ?? "Sin asignar"} a ${toLocality ?? "Sin asignar"}.`,
          });
        }
      },
    };
  }, [localities, machines, logs]);

  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const ctx = useContext(TrackingContext);
  if (!ctx) throw new Error("useTracking debe usarse dentro de TrackingProvider");
  return ctx;
}

// Genera el contenido CSV (compatible con Excel) de todas las máquinas.
export function buildMachinesCsv(machines: Machine[], localities: Locality[]) {
  const localityName = (id: string | null) =>
    id ? (localities.find((l) => l.id === id)?.name ?? "Desconocida") : "Sin asignar";

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;

  const header = ["Número de serie", "Número de máquina", "Número de comercio", "Localidad"];
  const rows = machines.map((m) => [
    m.serialNumber,
    m.machineNumber,
    m.commerceNumber,
    localityName(m.localityId),
  ]);

  const lines = [header, ...rows].map((row) => row.map(escape).join(","));
  return `\uFEFF${lines.join("\r\n")}`;
}
