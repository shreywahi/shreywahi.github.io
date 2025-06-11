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
        // Suppress the specific gapi-script eval warning since it's Google's official library
        if (warning.code === 'EVAL' && warning.id && warning.id.includes('gapi-script')) {
          return;
        }
        // Show all other warnings
        warn(warning);
      },
      output: {
        manualChunks: {
          // Separate vendor libraries into their own chunks
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', '@radix-ui/react-slot', '@radix-ui/react-toast', '@radix-ui/react-tooltip'],
          forms: ['@emailjs/browser', 'react-google-recaptcha', 'react-hot-toast'],
          google: ['gapi-script'],
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
        // Don't remove eval from gapi-script since it's required for Google API functionality
        pure_funcs: [], // Don't remove any specific functions
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
      'react-google-recaptcha',
      'react-hot-toast',
      'gapi-script'
    ]
  }
})
