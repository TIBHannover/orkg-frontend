// Compile-time constants injected by esbuild `define` (widget/build.mjs) and by
// the vitest config (widget/vitest.config.mts).
declare const __BACKEND_URL__: string;
declare const __FRONTEND_URL__: string;

declare module '*.html?raw' {
    const content: string;
    export default content;
}

declare module '*.css?raw' {
    const content: string;
    export default content;
}

declare module '*.png?inline' {
    const dataUrl: string;
    export default dataUrl;
}
