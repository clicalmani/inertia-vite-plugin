import type { Plugin, UserConfig, ViteDevServer } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { TonkaPluginOptions } from './types';

/**
 * Tonka Vite Plugin
 *
 * A Vite plugin specifically designed for the Tonka Framework.
 * It automates the configuration for Inertia.js, SSR, and asset paths,
 * and wires up HMR between the Vite dev server and the PHP-side
 * `@vite(...)` / `@reactRefresh` template directives via a "hot" file.
 */
export default function tonkaPlugin(options: TonkaPluginOptions = {}): Plugin {
  const root = process.cwd();
  const publicDir = options.publicDirectory
    ? path.resolve(root, options.publicDirectory)
    : path.resolve(root, 'public');
  const hotFile = path.resolve(publicDir, 'hot');
  
  // Normalize the `refresh` option into a list of glob patterns to watch.
  // `refresh: true`  -> sensible defaults (server-side views/routes)
  // `refresh: 'x'`   -> single glob
  // `refresh: ['a','b']` -> explicit globs
  // `refresh: false` -> disabled (default)
  const refreshPaths: string[] =
    options.refresh === true
      ? ['resources/js/**']
      : Array.isArray(options.refresh)
      ? options.refresh
      : typeof options.refresh === 'string'
      ? [options.refresh]
      : [];

  let viteDevServerUrl: string;
  let resolvedConfig: UserConfig;

  return {
    name: 'tonka-vite-plugin',

    // Needed so Vite knows this plugin cares about both build and serve.
    config(userConfig: UserConfig, { command, mode }) {
      const input: any = options.input || {
        app: 'resources/css/app.css',
        main: 'resources/js/app.tsx',
      };

      const outDir = options.outDir || path.resolve(root, 'public/build');
      const manifest = options.manifest !== false ? 'manifest.json' : false;

      resolvedConfig = {
        base:
          command === 'build'
            ? (options.buildBase ?? '/build/')
            : '',

        build: {
          outDir,
          manifest,
          assetsDir: options.assetsDir || 'assets',
          rollupOptions: { input },
          ssr: options.ssr || false,
          sourcemap: command === 'serve' ? true : (options.sourcemap ?? false),
          copyPublicDir: false,
          // Avoid the dev server writing into outDir while `vite build --watch`
          // is running alongside `vite dev`, which is a common source of
          // rebuild loops when both processes touch public/build.
          emptyOutDir: command === 'build',
        },

        resolve: {
          alias: {
            '@': path.resolve(root, 'resources/js'),
            ...(options.alias || {}),
          },
        },

        optimizeDeps: {
          include: ['react', 'react-dom', '@inertiajs/react'],
          exclude: [],
        },

        server: {
          // Let the PHP-side template know the real origin to fetch
          // /@vite/client and entry modules from, instead of guessing.
          origin: userConfig.server?.origin,
          cors: true,
          // Never let Tailwind / the module graph watch what Vite itself
          // writes out — this is the classic source of an infinite
          // regenerate -> reload -> regenerate loop.
          watch: {
            ignored: [
              '**/public/build/**',
              '**/public/hot',
              '**/node_modules/**',
              '**/vendor/**',
              ...['app', 'routes', 'bootstrap', 'database', 'config', 'test'].map((dir) =>
                path.resolve(root, dir) + '/**'
              ),
            ],
          },
        },
      };

      return resolvedConfig;
    },

    configureServer(server: ViteDevServer) {
      const cleanupHotFile = () => {
        if (fs.existsSync(hotFile)) fs.rmSync(hotFile);
      };

      // Always start clean.
      cleanupHotFile();

      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address();
        const protocol = server.config.server.https ? 'https' : 'http';

        if (address && typeof address === 'object') {
          viteDevServerUrl =
            resolvedConfig.server?.origin ??
            `${protocol}://${address.address === '::' ? 'localhost' : address.address}:${address.port}`;

          fs.mkdirSync(publicDir, { recursive: true });
          fs.writeFileSync(hotFile, viteDevServerUrl);
        }
      });

      // Make sure we don't leave a stale `hot` file behind if the dev
      // server crashes or is killed — a stale file is exactly what makes
      // the backend think Vite is running when it isn't, causing it to
      // request assets that 404 and, depending on the framework, retry
      // in a loop.
      const exitHandler = () => cleanupHotFile();
      process.on('exit', exitHandler);
      process.on('SIGINT', () => process.exit());
      process.on('SIGTERM', () => process.exit());
      server.httpServer?.once('close', cleanupHotFile);

      // Wire up `refresh`: watch server-rendered files (views, routes, ...)
      // and ask the browser to do a *full* reload when they change, since
      // Vite's module graph has no way to HMR server-rendered templates.
      if (refreshPaths.length > 0) {
        const watcher = server.watcher.add(refreshPaths);

        watcher.on('change', (file) => {
          server.ws.send({ type: 'full-reload', path: '*' });
        });
      }
    },

    // Expose the hot dev-server URL / status to any code that needs to
    // build the correct asset tags server-side (e.g. a small PHP/JS bridge
    // reading this via a generated config file), instead of leaving the
    // `refresh` branch here silently doing nothing.
    transformIndexHtml() {
      return undefined;
    },
  };
}