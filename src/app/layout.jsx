import 'assets/scss/CustomBootstrap.scss';
import Providers from 'components/Providers/Providers';
import 'fast-text-encoding/text.min';
import 'intro.js/introjs.css';
import { CookiesProvider } from 'next-client-cookies/server';
import { PublicEnvScript } from 'next-runtime-env';
import NextTopLoader from 'nextjs-toploader';
import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const RootLayout = ({ children }) => (
    <html lang="en">
        <head>
            <PublicEnvScript />
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta name="theme-color" content="#000000" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <title>Open Research Knowledge Graph</title>
            <meta property="og:image" content="/og_image.png" />
            <link
                rel="stylesheet"
                href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                crossOrigin=""
            />
        </head>
        <body>
            <NextTopLoader color="#e86161" />
            {/* CookiesProvider is a server component so cannot be placed in <Providers> */}
            <CookiesProvider>
                <NuqsAdapter>
                    <Providers>{children}</Providers>
                </NuqsAdapter>
            </CookiesProvider>
        </body>
    </html>
);

RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RootLayout;
