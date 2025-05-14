const { version } = require('./package.json');
const path = require('path');

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const cspHeader = `default-src 'self' ;
                      img-src 'self'
                          *
                          data:
                      ;
                      script-src 'self' 'unsafe-inline' 'unsafe-eval'
                          blob:
                          https://orkg.org
                          https://*.orkg.org
                          https://support.tib.eu
                          https://tibhannover.gitlab.io
                          https://www.gstatic.com
                          https://platform.twitter.com
                          https://cdn.syndication.twimg.com
                          https://cdnjs.cloudflare.com
                          https://app.chatwoot.com
                      ;
                      style-src 'self' 'unsafe-inline'
                          https://orkg.org
                          https://*.orkg.org
                          https://maxcdn.bootstrapcdn.com
                          https://www.gstatic.com
                          https://platform.twitter.com
                          https://*.twimg.com
                          https://unpkg.com/leaflet@1.9.4/dist/leaflet.css 
                      ;
                      font-src 'self'
                          data:
                          https://orkg.org
                          https://*.orkg.org
                          https://maxcdn.bootstrapcdn.com
                          https://cdnjs.cloudflare.com
                      ;
                      frame-src 'self'
                          localhost:*
                          https://*.netlify.com
                          https://orkg.org
                          https://*.orkg.org
                          https://av.tib.eu
                          http://av.tib.eu
                          https://platform.twitter.com
                          https://syndication.twitter.com
                          https://www.youtube.com
                          https://time.graphics
                          https://app.chatwoot.com
                          https://support.tib.eu   
                      ;
                      frame-ancestors 'self' https://accounts.orkg.org;
                      connect-src 'self'
                          blob:
                          localhost:*
                          127.0.0.1:*
                          https://*.netlify.com
                          https://orkg.org
                          https://*.orkg.org
                          https://support.tib.eu
                          https://api.altmetric.com
                          https://doi.org
                          https://data.crosscite.org
                          https://secure.geonames.org
                          https://service.tib.eu
                          https://pub.orcid.org
                          https://api.semanticscholar.org
                          https://api.datacite.org
                          https://api.crossref.org
                          https://app.chatwoot.com
                          https://opencitations.net
                          https://*.wikidata.org
                          https://*.wikipedia.org/api/
                          https://dbpedia.org/sparql
                          https://api.unpaywall.org
                          https://raw.githubusercontent.com
                          https://fonts.gstatic.com
                          https://mastodon.social
                          https://dbpedia.org
                          https://api.terminology.tib.eu
                          https://www.ebi.ac.uk/ols4/api/
                      ;`;

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader.replace(/\n/g, ''),
                    },
                ],
            },
        ];
    },
    swcMinify: true, // different minification, speeds up compiling in dev mode
    reactStrictMode: false, // otherwise, list items are rendered twice (e.g. /resources, /paper etc. ): https://github.com/vercel/next.js/issues/35822
    eslint: {
        ignoreDuringBuilds: true, // this allows production builds to successfully complete even if the project has ESLint errors
    },
    compiler: {
        styledComponents: true, // to fix issue where class names on server and client don't match: https://github.com/vercel/next.js/issues/46605#issuecomment-1489135397
    },
    images: {
        // set allowed hosts for the <Image /> component
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'orkg.org',
            },
            {
                protocol: 'https',
                hostname: '**.orkg.org',
            },
            {
                protocol: 'http',
                hostname: 'localhost',
            },
        ],
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
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        };
        config.externals = [...config.externals, 'canvas', 'jsdom']; // to fix pdf-text-annotation: https://github.com/kkomelin/isomorphic-dompurify/issues/54
        return config;
    },
    experimental: {
        serverComponentsExternalPackages: ['citeproc', 'react-pdf-highlighter'],
        ...(process.env.NODE_ENV === 'development'
            ? {
                  turbo: {
                      resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
                      rules: {
                          '*.md': {
                              loaders: ['raw-loader'],
                          },
                      },
                  },
              }
            : {}),
    },
    transpilePackages: ['ky'],
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
