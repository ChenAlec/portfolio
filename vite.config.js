import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // REPLACE 'repo-name' WITH YOUR ACTUAL GITHUB REPOSITORY NAME
  // Example: If your repo is github.com/alec/my-portfolio, this should be '/my-portfolio/'
  // If this is your main user site (alec.github.io), remove this line entirely.
  base: '/portfolio/', 
})