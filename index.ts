import type { Plugin, UserConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { TonkaPluginOptions } from '../types';

/**
 * Tonka Vite Plugin
 * 
 * A Vite plugin specifically designed for the Tonka Framework.
 * It automates the configuration for Inertia.js, SSR, and asset paths.
 * 
 * @param options - Configuration options for the plugin
 * @returns A Vite plugin object
 */
export default function tonkaPlugin(options: TonkaPluginOptions = {}): Plugin {
  // Determine the base directory of the project
  const root = process.cwd();

  return {
    name: 'tonka-vite-plugin',

    /**
     * The `config` hook is called before the user config is resolved.
     * We use it to inject default settings and handle the Tonka-specific structure.
     */
    config: (userConfig: UserConfig, { command }) => {
      // 1. Handle Inputs
      // If the user doesn't provide inputs, we assume the standard structure.
      // Note: We cast to 'any' here to satisfy Rollup's strict typing for input.
      const input: any = options.input || {
        'resources/css/app.css': undefined, // CSS entry
        'resources/js/app.tsx': undefined,   // Main JS entry
      };

      // 2. Handle Output Directory
      // Default to 'public/build' if not specified
      const outDir = options.outDir || path.resolve(root, 'public/build');

      // 3. Handle Manifest
      // Ensure manifest is generated unless explicitly disabled
      const manifest = options.manifest !== false ? 'manifest.json' : false;

      // 4. Handle SSR
      // If ssr is false, we ensure we don't set the ssr config.
      const ssrBuild = options.ssr ? options.ssr : false;

      return {
        build: {
          outDir: outDir,
          manifest: manifest,
          assetsDir: options.assetsDir || 'assets',
          
          // Rollup options
          rollupOptions: {
            input: input,
          },
          
          // Server-Side Rendering configuration
          ssr: ssrBuild,
          
          // Source maps: enabled in dev, disabled in prod (optional optimization)
          sourcemap: command === 'serve',

          // Disable Copy the public directory to outDir on write.
          copyPublicDir: false,
        },

        // 5. Resolve Aliases
        resolve: {
          // Merge user aliases with defaults
          alias: options.alias || {
            // Default alias: '@' points to the root of the project
            // You can also point it to 'resources' or 'public' based on your preference.
            '@': path.resolve(root, '.'),
          },
        },

        // 6. Optimize dependencies
        // Pre-bundle common dependencies to speed up dev server start
        optimizeDeps: {
          include: ['react', 'react-dom', '@inertiajs/react', 'axios'],
          exclude: [],
        },
      };
    },

    /**
     * The `transformIndexHtml` hook allows modifying the HTML index file.
     * This can be used to inject the @vite/client script for HMR if needed.
     */
    transformIndexHtml(html) {
      // If refresh is enabled, we could inject the HMR client here.
      // However, in a typical Inertia setup (like Tonka), this is often
      // handled by the server-side Blade/PHP template (@vite directive).
      // We leave this placeholder for future enhancements.
      if (options.refresh) {
        // Implementation note: Injecting @vite/client usually requires
        // knowing the exact module path, which varies. 
        // For now, we trust the server-side directive.
      }
      return html;
    },
  };
}