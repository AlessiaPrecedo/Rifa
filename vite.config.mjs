import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin/admin.html", import.meta.url)),
        login: fileURLToPath(new URL("./admin/login.html", import.meta.url)),
      },
    },
  },
});
