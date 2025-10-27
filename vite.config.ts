import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        login: resolve(__dirname, "src/pages/auth/login/login.html"),
        adminHome: resolve(__dirname, "src/pages/admin/adminHome/adminHome.html"),
        clientHome: resolve(__dirname, "src/pages/client/clientHome/clientHome.html"),
      },
    },
  },
  base: "./",
});
