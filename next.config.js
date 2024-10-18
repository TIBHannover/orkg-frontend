const { version } = require('./package.json');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    swcMinify: true, // different minification, speeds up compiling in dev mode
    reactStrictMode: false, // otherwise, list items are rendered twice (e.g. /resources, /paper etc. ): https://github.com/vercel/next.js/issues/35822
    eslint: {
        ignoreDuringBuilds: true, // this allows production builds to successfully complete even if the project has ESLint errors
    },
    compiler: {
        styledComponents: true, // to fix issue where class names on server and client don't match: https://github.com/vercel/next.js/issues/46605#issuecomment-1489135397
    },
    webpack(config) {
        config.resolve.fallback = {
            // if you miss it, all the other options in fallback, specified
            // by next.js will be dropped.
            ...config.resolve.fallback,
            fs: false, // the solution
        };
        config.module.rules.push({
            test: /\.md$/,
            // This is the asset module.
            type: 'asset/source',
        });
        config.externals = [...config.externals, 'canvas', 'jsdom']; // to fix pdf-text-annotation: https://github.com/kkomelin/isomorphic-dompurify/issues/54
        return config;
    },
    experimental: {
        serverComponentsExternalPackages: ['citeproc'],
        turbo: {
            resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
        },
    },
    output: 'standalone',
    env: {
        version, // ensure the version is available for display in the footer
    },
    // redirects for legacy pages, could be removed after a while
    async redirects() {
        return [
            {
                source: '/smart-review/new',
                destination: '/review/new',
                permanent: true,
            },
            {
                source: '/smart-reviews',
                destination: '/reviews',
                permanent: true,
            },
            {
                source: '/literature-lists',
                destination: '/lists',
                permanent: true,
            },
            {
                source: '/literature-list/new',
                destination: '/list/new',
                permanent: true,
            },
            {
                source: '/smart-review/diff/:oldId-:newId',
                destination: '/review/diff/:oldId-:newId',
                permanent: true,
            },
            {
                source: '/predicate/:id',
                destination: '/property/:id',
                permanent: true,
            },
            {
                source: '/smart-review/:id',
                destination: '/review/:id',
                permanent: true,
            },
            {
                source: '/literature-list/:id',
                destination: '/list/:id',
                permanent: true,
            },
            {
                source: '/literature-list/:id/:embed',
                destination: '/list/:id/:embed',
                permanent: true,
            },
            {
                source: '/literature-list/diff/:oldId-:newId',
                destination: '/list/diff/:oldId/:newId',
                permanent: true,
            },
            {
                source: '/tpdl',
                destination: '/',
                permanent: true,
            },
            {
                source: '/export-data',
                destination: '/data',
                permanent: true,
            },
            {
                source: '/open-call-curation-grant',
                destination: 'https://www.orkg.org/about/28/Curation_Grants',
                permanent: true,
            },
        ];
    },
};

module.exports = withBundleAnalyzer(nextConfig);
