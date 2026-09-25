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
  __env__?: { DB?: D1DatabaseLike };
};

export function setDatabase(database: D1DatabaseLike | undefined) {
  (globalThis as DatabaseGlobal).__codigoFuentesDb = database;
}

export function getDatabase() {
  const runtime = globalThis as DatabaseGlobal;
  const database = runtime.__codigoFuentesDb ?? runtime.__env__?.DB;
  if (!database) {
    throw new Error("La base D1 no está vinculada al Worker.");
  }
  return database;
}
