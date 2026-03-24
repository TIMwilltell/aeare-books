import { setupConvex } from "convex-svelte";

export const convex = setupConvex(import.meta.env.VITE_CONVEX_URL ?? "https://jovial-wildcat-461.convex.cloud");
