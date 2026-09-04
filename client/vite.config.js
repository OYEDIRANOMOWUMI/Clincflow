// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3700',
        changeOrigin: true,
        secure: false,
        ws: false
      }
    },
    hmr: {
      host: 'localhost',
      port: 5174
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      manifest: {
        name: 'Carevyn Hospital',
        short_name: 'Carevyn',
        description: 'Hospital Management',
        theme_color: '#074642ff',
        background_color: '#053627ff',
        display: 'standalone',
        icons: [
          {
            src: '/icon1.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon2.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})