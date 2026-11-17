import { cpSync } from "node:fs";

// Self-contained talk decks are copied as they are, without passing through Vite.
for (const t of ["st26"]) {
  cpSync(new URL(`../talks/${t}/`, import.meta.url), new URL(`../dist/talks/${t}/`, import.meta.url), { recursive: true });
}
