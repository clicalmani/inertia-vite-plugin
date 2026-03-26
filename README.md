# Tonka Vite Plugin 🔌

The official Vite plugin for the [**Tonka Framework**](https://clicalmani.github.io/tonka).

This plugin automates the configuration of Vite for applications using **InertiaJS** and **React**. It handles the tedious setup of entry points, build directories, SSR (Server-Side Rendering), and asset manifest generation, ensuring your frontend and backend work together seamlessly.

## 🌟 Features

*   ⚙️ **Zero-Config Setup**: Automatically configures input files, output directories, and the manifest (`manifest.json`) required by the backend.
*   🚀 **SSR Support**: Built-in configuration for Server-Side Rendering to enable instant initial page loads.
*   🔄 **HMR Ready**: Supports React Fast Refresh configuration.
*   🛣️ **Smart Aliases**: Defaults to a clean `@` alias for your project root or custom paths.
*   📦 **TypeScript**: Fully typed with TypeScript for a great developer experience.

## 📦 Installation

Since this is a local plugin specific to your Tonka setup, copy the plugin file into your project root.

1.  Create a file named `tonka-vite-plugin.ts` (or `.js`) in your project root.
2.  Paste the code provided in the documentation into this file.

## 🚀 Quick Start

Import the plugin into your `vite.config.ts` to activate it.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tonka from './tonka-vite-plugin';

export default defineConfig({
  plugins: [
    tonka({
      // Entry points for the build
      input: ['resources/css/app.css', 'resources/js/app.tsx'],
      
      // Enable Server-Side Rendering
      ssr: 'resources/js/ssr.tsx',
      
      // Enable React Fast Refresh
      refresh: true,
    }),
    react(),
  ],
});
```

## ⚙️ Configuration Options

The plugin accepts a configuration object to customize its behavior.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `input` | `string \| string[] \| Record` | `['resources/css/app.css', 'resources/js/app.tsx']` | The entry points for the build. Maps to `rollupOptions.input`. |
| `ssr` | `string \| false` | `false` | The entry point file for the SSR build. Set to the path of your SSR entry file (e.g., `resources/js/ssr.tsx`) to enable SSR. |
| `refresh` | `boolean` | `false` | Enables support for React Fast Refresh (HMR). Note: The actual script injection is handled by the backend `@vite` directive. |
| `outDir` | `string` | `'public/build'` | The directory where the compiled assets will be output. |
| `assetsDir` | `string` | `'assets'` | The directory inside `outDir` to place assets. |
| `manifest` | `boolean` | `true` | Whether to generate a `manifest.json` file in the output directory. Required for the backend `@vite` directive. |
| `alias` | `Record<string, string>` | `{ '@': '.' }` | Path aliases for module resolution. |

## 🔍 How it Works

### 1. Build Configuration
When you run `npm run build`, the plugin automatically configures Rollup (the bundler inside Vite) to output your files to `public/build` (or your specified `outDir`) and generates a `manifest.json` that maps your source files (e.g., `resources/js/app.tsx`) to their hashed filenames (e.g., `app.a1b2c.js`).

### 2. SSR Support
If you provide an `ssr` entry point, the plugin configures Vite to perform a second build specifically for the server. This allows your backend (Tonka) to render the initial page state on the server for faster load times and SEO.

### 3. Integration with Backend
The plugin prepares the assets, but the **injection** of the `<script>` tags into the HTML is handled by your backend (Tonka) via the `@vite` Blade directive. This ensures that the correct script source is used:
*   **Dev**: Points to `http://localhost:5173/@vite/client` (for HMR).
*   **Prod**: Points to `/build/assets/xxxxx.js` (using the manifest).

## 🛠️ Development vs Production

**In Development:**
The plugin ensures the dev server runs on port 5173 and resolves aliases correctly. It relies on the backend to proxy requests or inject the client script.

**In Production:**
The plugin is essential to correctly generate the `manifest.json`. Without this plugin generating the manifest, your backend would fail to locate the compiled `.js` files after a build.

## 📝 License

MIT