export const EVENTS = [
  {
    id: "0001",
    name: "La Florida · Fiesta de la Chilenidad",
    href: "/landing-fiesta-de-la-chilenidad.html?evento=0001",
  },
  {
    id: "0002",
    name: "El Colorado",
    href: "/landing-el-colorado.html?evento=0002",
  },
  {
    id: "0003",
    name: "Donaciones a idols",
    href: "/idols?evento=0003",
  },
  {
    id: "0004",
    name: "More More Dream · Eternal Dream",
    href: "/mmd-eternal-dream?evento=0004",
  },
] as const;

export type EventId = (typeof EVENTS)[number]["id"];
