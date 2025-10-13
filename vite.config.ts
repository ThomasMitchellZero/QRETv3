import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Replace QRET with your repo name
export default defineConfig({
  plugins: [react()],
  base: "/QRETv3/",
});
