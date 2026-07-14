import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Allow all subdomains under ngrok's default domains
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
    
    // 2. Direct hot-reloads through ngrok's secure port (443) 
    // so code changes still sync instantly to your iPhone
    hmr: {
      clientPort: 443,
    }
  }
})