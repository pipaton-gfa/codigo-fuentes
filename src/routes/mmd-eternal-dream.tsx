import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/mmd-eternal-dream")({
  head: () => ({
    meta: [
      { title: "Last Chapter: Eternal Dream - More More Dream" },
      { name: "description", content: "Landing oficial de Last Chapter: Eternal Dream." },
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
