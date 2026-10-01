import { env as cloudflareEnv } from "cloudflare:workers";

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
  __env__?: RuntimeEnvironment;
};

export type RuntimeEnvironment = {
  DB?: D1DatabaseLike;
  PAYMENT_API_URL?: string;
  PAYMENT_API_TOKEN?: string;
};

export function setDatabase(database: D1DatabaseLike | undefined) {
  (globalThis as DatabaseGlobal).__codigoFuentesDb = database;
}

export function setRequestCountry(country: string | undefined) {
  (globalThis as DatabaseGlobal).__codigoFuentesCountry = country?.toUpperCase() || null;
}

export function setRuntimeEnvironment(environment: unknown) {
  (globalThis as DatabaseGlobal).__env__ = environment as RuntimeEnvironment;
}

export function getRuntimeEnvironment() {
  return (
    (globalThis as DatabaseGlobal).__env__ ??
    (cloudflareEnv as unknown as RuntimeEnvironment)
  );
}

export function getRequestCountry() {
  return (globalThis as DatabaseGlobal).__codigoFuentesCountry ?? null;
}

export function getDatabase() {
  const runtime = globalThis as DatabaseGlobal;
  const database = runtime.__codigoFuentesDb ?? getRuntimeEnvironment().DB;
  if (!database) {
    throw new Error("La base D1 no está vinculada al Worker.");
  }
  return database;
}
