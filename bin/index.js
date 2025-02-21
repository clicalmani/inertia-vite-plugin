import fs from 'fs';
export default function() {
    return {
        name: 'rollup-plugin-tonka-vite',
        transformIndexHtml: {
            order: 'pre',
            async handler() {
                return await fs.promises.readFile('./resources/views/app.twig.php', 'utf8');
            }
        }
    }
}