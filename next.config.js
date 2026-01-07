const { version } = require('./package.json');
const path = require('path');

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://orkg.org/';

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const cspHeader = `
    default-src 'self';
    img-src 'self'
        *
        data:;
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
        https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs;
    style-src 'self' 'unsafe-inline'
        https://orkg.org
        https://*.orkg.org
        https://maxcdn.bootstrapcdn.com
        https://www.gstatic.com
        https://platform.twitter.com
        https://*.twimg.com
        https://unpkg.com/leaflet@1.9.4/dist/leaflet.css;
    font-src 'self'
        data:
        https://orkg.org
        https://*.orkg.org
        https://maxcdn.bootstrapcdn.com
        https://cdnjs.cloudflare.com;
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
        https://support.tib.eu;
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
        https://opencitations.net
        https://*.wikidata.org
        https://*.wikipedia.org/api/
        https://dbpedia.org/sparql
        https://api.unpaywall.org
        https://raw.githubusercontent.com
        https://api.opencitations.net
        https://fonts.gstatic.com
        https://mastodon.social
        https://dbpedia.org
        https://api.terminology.tib.eu
        https://www.ebi.ac.uk/ols4/api/
        https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data/codepoint-index/plane0/0-ff.json
        https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data/codepoint-index/plane0/2000-20ff.json
        https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data/font-meta/latin.json
        https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data/font-files/latin/sans-serif.normal.100.woff
        https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data/font-files/latin/sans-serif.normal.400.woff;
`;

/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader
                            .replace(/\n/g, ' ') // remove new lines
                            .replace(/\s{2,}/g, ' ') // remove extra spaces
                            .trim(),
                    },
                ],
            },
        ];
    },
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
            {
                protocol: 'https',
                hostname: 'gravatar.com',
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
            use: 'raw-loader',
        });
        config.resolve.alias = {
            ...config.resolve.alias,
            '@': path.resolve(__dirname, 'src'),
        };
        config.externals = [...config.externals, 'canvas', 'jsdom']; // to fix pdf-text-annotation: https://github.com/kkomelin/isomorphic-dompurify/issues/54
        return config;
    },
    serverExternalPackages: ['citeproc'],
    turbopack: {
        rules: {
            '*.md': {
                loaders: ['raw-loader'],
                as: '*.js',
            },
        },
    },
    experimental: {
        reactCompiler: {
            compilationMode: 'annotation',
        },
    },
    transpilePackages: ['ky'],
    output: 'standalone',
    env: {
        version, // ensure the version is available for display in the footer
    },
    // redirects for legacy pages, not all of them could be removed after a while
    // the order of the redirects matters, e.g. ensure /list/new is before /list/:id to avoid conflicts
    async redirects() {
        return [
            {
                source: '/contribution-editor',
                destination: '/grid-editor',
                permanent: true,
            },
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
            {
                source: '/addResource',
                destination: '/resources/create',
                permanent: true,
            },
            {
                source: '/resource/:id',
                destination: '/resources/:id',
                permanent: true,
            },
            {
                source: '/resource/:id/:activeTab',
                destination: '/resources/:id/:activeTab',
                permanent: true,
            },
            {
                source: '/addProperty',
                destination: '/properties/create',
                permanent: true,
            },
            {
                source: '/property/:id',
                destination: '/properties/:id',
                permanent: true,
            },
            {
                source: '/property/:id/:activeTab',
                destination: '/properties/:id/:activeTab',
                permanent: true,
            },
            {
                source: '/addClass',
                destination: '/classes/create',
                permanent: true,
            },
            {
                source: '/class/:id',
                destination: '/classes/:id',
                permanent: true,
            },
            {
                source: '/class/:id/:activeTab',
                destination: '/classes/:id/:activeTab',
                permanent: true,
            },
            {
                source: '/add-comparison',
                destination: '/comparisons/create/overview',
                permanent: true,
            },
            {
                source: '/add-paper',
                destination: '/papers/create',
                permanent: true,
            },
            {
                source: '/author/:authorId',
                destination: '/authors/:authorId',
                permanent: true,
            },
            {
                source: '/author-literal/:authorString',
                destination: '/authors/literal/:authorString',
                permanent: true,
            },
            {
                source: '/benchmark/:datasetId/problem/:problemId',
                destination: '/benchmarks/:datasetId/problem/:problemId',
                permanent: true,
            },
            {
                source: '/comparison',
                destination: '/comparisons/unpublished',
                permanent: true,
            },
            {
                // NEVER REMOVE THIS REDIRECT (some registered doi links still point to this url)
                source: '/comparison/:comparisonId',
                destination: '/comparisons/:comparisonId',
                permanent: true,
            },
            {
                source: '/featured-comparisons',
                destination: '/comparisons/featured',
                permanent: true,
            },
            {
                source: '/content-type/new',
                destination: '/content-type/create',
                permanent: true,
            },
            {
                source: '/content-type/:type/new',
                destination: '/content-type/:type/create',
                permanent: true,
            },
            {
                source: '/diagram/:id',
                destination: '/diagrams/:id',
                permanent: true,
            },
            {
                source: '/field/:researchFieldId/:slug',
                destination: '/fields/:researchFieldId/:slug',
                permanent: true,
            },
            {
                source: '/field/:researchFieldId',
                destination: '/fields/:researchFieldId',
                permanent: true,
            },
            {
                source: '/list/:id/:embed',
                destination: '/lists/:id/:embed',
                permanent: true,
            },
            {
                source: '/list/new',
                destination: '/lists/create',
                permanent: true,
            },
            {
                source: '/list/:id',
                destination: '/lists/:id',
                permanent: true,
            },
            {
                source: '/observatory/:id',
                destination: '/observatories/:id',
                permanent: true,
            },
            {
                // NEVER REMOVE THIS REDIRECT (some registered doi links still point to this url)
                source: '/paper/:resourceId',
                destination: '/papers/:resourceId',
                permanent: true,
            },
            {
                source: '/paper/:resourceId/:contributionId',
                destination: '/papers/:resourceId/:contributionId',
                permanent: true,
            },
            {
                source: '/problem/:researchProblemId/:slug',
                destination: '/problems/:researchProblemId/:slug',
                permanent: true,
            },
            {
                source: '/problem/:researchProblemId',
                destination: '/problems/:researchProblemId',
                permanent: true,
            },
            {
                source: '/review/new',
                destination: '/reviews/create',
                permanent: true,
            },
            {
                // NEVER REMOVE THIS REDIRECT (some registered doi links still point to this url)
                source: '/review/:id',
                destination: '/reviews/:id',
                permanent: true,
            },
            {
                source: '/sustainable-development-goal/:sdg',
                destination: '/sustainable-development-goals/:sdg',
                permanent: true,
            },
            {
                source: '/template/ImportSHACL',
                destination: '/templates/ImportSHACL',
                permanent: true,
            },
            {
                source: '/template/:id',
                destination: '/templates/:id',
                permanent: true,
            },
            {
                source: '/template/:id/:activeTab',
                destination: '/templates/:id/:activeTab',
                permanent: true,
            },
            {
                source: '/template',
                destination: '/templates/create',
                permanent: true,
            },
            {
                source: '/venue/:venueId',
                destination: '/venues/:venueId',
                permanent: true,
            },
            {
                source: '/view-or-create-paper',
                destination: '/papers/view-or-create',
                permanent: true,
            },
            {
                source: '/visualization/:id',
                destination: '/visualizations/:id',
                permanent: true,
            },
            {
                source: '/rs/statement/:id',
                destination: '/rs/statements/:id',
                permanent: true,
            },
            {
                source: '/rs/template/:id',
                destination: '/rs/templates/:id',
                permanent: true,
            },
            {
                source: '/rs/template/:id/edit',
                destination: '/rs/templates/:id/edit',
                permanent: true,
            },
            {
                source: '/rs/template/:id/:activeTab',
                destination: '/rs/templates/:id/:activeTab',
                permanent: true,
            },
            {
                source: '/rs/template',
                destination: '/rs/templates/create',
                permanent: true,
            },
            {
                source: '/pdf-text-annotation',
                destination: '/pdf-annotation',
                permanent: true,
            },
        ];
    },
    async rewrites() {
        return [
            'application/trig',
            'application/x-trig',
            'application/x-trigstar',
            'application/n-quads',
            'text/x-nquads',
            'text/nquads',
            'application/ld\\+json',
            'application/x-ld\\+ndjson',
            'application/rdf\\+json',
        ].map((type) => ({
            source: '/np/:path*',
            has: [
                {
                    type: 'header',
                    key: 'accept',
                    value: `(?<accept>.*${type}.*)`,
                },
            ],
            destination: `${backendUrl}api/nanopublications/:path*`,
        }));
    },
};

module.exports = withBundleAnalyzer(nextConfig);
