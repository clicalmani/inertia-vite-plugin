import fs from 'fs';
export default function(source) {
    return {
        name: 'rollup-plugin-tonka-vite',
        transformIndexHtml: {
          order: 'pre',
          async handler() {
            return await fs.promises.readFile(source, 'utf8');
          }
        }
      }
}