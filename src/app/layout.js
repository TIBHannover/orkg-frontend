import 'assets/scss/CustomBootstrap.scss';
import Providers from 'components/Providers/Providers';
import 'fast-text-encoding/text.min';
import 'intro.js/introjs.css';
import { CookiesProvider } from 'next-client-cookies/server';
import { PublicEnvScript } from 'next-runtime-env';
import NextTopLoader from 'nextjs-toploader';
import PropTypes from 'prop-types';
import 'react-toastify/dist/ReactToastify.css';
import 'tippy.js/animations/shift-away.css';
import 'tippy.js/dist/backdrop.css';
import 'tippy.js/dist/tippy.css';

const RootLayout = ({ children }) => (
    <html lang="en">
        <head>
            <PublicEnvScript />
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta name="theme-color" content="#000000" />
            <link rel="manifest" href="/manifest.json" />
            <link rel="shortcut icon" href="/favicon.ico" />
            <meta
                httpEquiv="Content-Security-Policy"
                content="default-src 'self' ;
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
                      connect-src 'self'
                          blob:
                          localhost:*
                          127.0.0.1:*
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
                      ;"
            />
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
                <Providers>{children}</Providers>
            </CookiesProvider>
        </body>
    </html>
);

RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RootLayout;
