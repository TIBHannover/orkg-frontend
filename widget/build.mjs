import esbuild from 'esbuild';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const widgetDir = import.meta.dirname;
const rootDir = path.resolve(widgetDir, '..');
const isDev = process.argv.includes('--dev');

// URLs are baked in at build time (the widget is a standalone script and cannot
// use next-runtime-env, and the Docker image is built once and reused across
// instances, so environment variables cannot reach this build anyway).
const define = {
    __BACKEND_URL__: JSON.stringify(isDev ? 'http://localhost:8080/api/' : 'https://orkg.org/api/'),
    __FRONTEND_URL__: JSON.stringify(isDev ? 'http://localhost:3000/' : 'https://orkg.org/'),
};

// Vite-style ?raw / ?inline import suffixes, so the same source imports work in
// esbuild builds and in vitest without any test-side stubbing.
const suffixLoaders = {
    name: 'suffix-loaders',
    setup(build) {
        build.onResolve({ filter: /\?(raw|inline)$/ }, (args) => ({
            path: path.resolve(args.resolveDir, args.path.replace(/\?(raw|inline)$/, '')),
            namespace: 'suffix-loader',
            pluginData: args.path.endsWith('?raw') ? 'text' : 'dataurl',
        }));
        build.onLoad({ filter: /.*/, namespace: 'suffix-loader' }, async (args) => ({
            contents: await readFile(args.path),
            loader: args.pluginData,
        }));
    },
};

const options = {
    entryPoints: [path.join(widgetDir, 'src/main.ts')],
    bundle: true,
    format: 'iife',
    target: 'es2017',
    charset: 'utf8',
    define,
    plugins: [suffixLoaders],
    logLevel: 'info',
};

if (!isDev) {
    await esbuild.build({
        ...options,
        minify: true,
        outfile: path.join(rootDir, 'public/widget.js'),
    });
} else {
    const distDir = path.join(widgetDir, 'dist');
    await mkdir(distDir, { recursive: true });
    await copyFile(path.join(widgetDir, 'demo/index.html'), path.join(distDir, 'index.html'));
    const ctx = await esbuild.context({
        ...options,
        sourcemap: true,
        outfile: path.join(distDir, 'widget.js'),
    });
    await ctx.watch();
    const { port } = await ctx.serve({ servedir: distDir, port: 9060 });
    console.log(`ORKG widget demo: http://localhost:${port}/`);
}
