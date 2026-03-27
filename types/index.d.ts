/**
 * Interface for the options passed to the Tonka plugin.
 * This defines the shape of the configuration object in `vite.config.ts`.
 */
export interface TonkaPluginOptions {
  /**
   * Entry points for the build.
   * Can be an array of file paths or an object (for named chunks).
   */
  input?: string | string[] | Record<string, string>;

  /**
   * The entry point for Server-Side Rendering (SSR).
   * Provide a file path string to enable SSR, or false to disable it.
   */
  ssr?: string | false;

  /**
   * Whether to enable React Fast Refresh (HMR).
   * If true, the plugin may attempt to configure HMR settings.
   */
  refresh?: boolean;

  /**
   * The output directory for the production build.
   * Defaults to 'public/build'.
   */
  outDir?: string;

  /**
   * The directory inside `outDir` for assets.
   */
  assetsDir?: string;

  /**
   * Path aliases (e.g., '@' to point to the root or resources).
   */
  alias?: Record<string, string>;
  
  /**
   * Whether to generate a manifest.json file.
   * Defaults to true for production.
   */
  manifest?: boolean;
}