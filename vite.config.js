import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],  build: {
    // Increase chunk size warning limit to reduce warnings
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: 'es2015',    rollupOptions: {
      onwarn(warning, warn) {
        // Show all warnings normally
        warn(warning);
      },
      output: {
        manualChunks: {
          // Separate vendor libraries into their own chunks
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-slot', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          forms: ['@emailjs/browser', 'react-hot-toast'],
          router: ['react-router-dom'],
          themes: ['next-themes'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    },
    // Enable source maps for better debugging in production
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
      format: {
        comments: false, // Remove comments to reduce size
      },
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'lucide-react',
      '@emailjs/browser',
      'react-hot-toast'
    ]
  }
})
