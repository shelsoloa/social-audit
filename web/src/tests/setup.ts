import { vi } from "vitest";

// server-only throws when imported outside of a React Server Component context.
// All modules that import it are mocked individually in each test, but
// vi.mock() hoisting requires the package itself to be resolvable — we stub
// the entire package to an empty module so any transitive import is silent.
vi.mock("server-only", () => ({}));
