
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      'leaflet': __dirname + '/node_modules/leaflet/src/Leaflet.js',
      'leaflet.css': __dirname + '/node_modules/leaflet/dist/leaflet.css',
    },
  }
})
