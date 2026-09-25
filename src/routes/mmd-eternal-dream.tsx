import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mmd-eternal-dream")({
  head: () => ({
    meta: [
      { title: "Last Chapter: Eternal Dream - More More Dream" },
      { name: "description", content: "Last Chapter: Eternal Dream, la última presentación de More More Dream junto a sus agrupaciones invitadas." },
      { property: "og:title", content: "Last Chapter: Eternal Dream | More More Dream" },
      { property: "og:description", content: "Una última aventura junto a More More Dream y sus invitadas. Domingo 8 de noviembre en CREAROCK." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://landingfuentes.online/mmd-eternal-dream" },
      { property: "og:image", content: "https://landingfuentes.online/mmd-assets/flyer-evento.jpeg" },
      { property: "og:image:alt", content: "Flyer de Last Chapter: Eternal Dream" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Last Chapter: Eternal Dream | More More Dream" },
      { name: "twitter:description", content: "La última presentación de More More Dream y sus agrupaciones invitadas." },
      { name: "twitter:image", content: "https://landingfuentes.online/mmd-assets/flyer-evento.jpeg" },
    ],
  }),
  component: MmdEternalDream,
});

function MmdEternalDream() {
  return (
    <main className="mmd-route-shell">
      <iframe
        className="mmd-route-frame"
        src="/mmd.html"
        title="Last Chapter: Eternal Dream"
      />
    </main>
  );
}
