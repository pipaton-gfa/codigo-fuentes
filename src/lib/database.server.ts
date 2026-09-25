export type D1DatabaseLike = {
  prepare: (query: string) => {
    bind: (...values: unknown[]) => {
      first: <T>() => Promise<T | null>;
      all: <T>() => Promise<{ results: T[] }>;
      run: () => Promise<unknown>;
    };
    first: <T>() => Promise<T | null>;
    all: <T>() => Promise<{ results: T[] }>;
    run: () => Promise<unknown>;
  };
};

type DatabaseGlobal = typeof globalThis & {
  __codigoFuentesDb?: D1DatabaseLike;
  __codigoFuentesCountry?: string | null;
  __env__?: { DB?: D1DatabaseLike };
};

export function setDatabase(database: D1DatabaseLike | undefined) {
  (globalThis as DatabaseGlobal).__codigoFuentesDb = database;
}

export function setRequestCountry(country: string | undefined) {
  (globalThis as DatabaseGlobal).__codigoFuentesCountry = country?.toUpperCase() || null;
}

export function getRequestCountry() {
  return (globalThis as DatabaseGlobal).__codigoFuentesCountry ?? null;
}

export function getDatabase() {
  const runtime = globalThis as DatabaseGlobal;
  const database = runtime.__codigoFuentesDb ?? runtime.__env__?.DB;
  if (!database) {
    throw new Error("La base D1 no está vinculada al Worker.");
  }
  return database;
}
