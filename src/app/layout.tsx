import '@/app/globals.css';
import 'fast-text-encoding/text.min';
import 'intro.js/introjs.css';
import 'katex/dist/katex.min.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { Metadata } from 'next';
import { CookiesProvider } from 'next-client-cookies/server';
import { env, PublicEnvScript } from 'next-runtime-env';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { FC } from 'react';

import Providers from '@/components/Providers/Providers';

export const metadata: Metadata = {
    title: {
        template: '%s | ORKG',
        default: 'ORKG',
    },
};

type Props = {
    children: React.ReactNode;
};

const RootLayout: FC<Props> = ({ children }) => {
    const ogImageUrl = `${env('NEXT_PUBLIC_URL')}/og_image.png`;

    return (
        <html lang="en" data-vibrant-palette="true" suppressHydrationWarning>
            <head>
                <PublicEnvScript />
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
                <meta name="theme-color" content="#000000" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="shortcut icon" href="/favicon.ico" />
                <link href="https://mastodon.social/@orkg" rel="me" />
                {env('NEXT_PUBLIC_IS_TESTING_SERVER') === 'true' && <meta name="robots" content="noindex" />}
                <meta property="og:image" content={ogImageUrl} />
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""
                />
            </head>
            <body>
                <NextTopLoader color="var(--accent)" />
                {/* CookiesProvider is a server component so cannot be placed in <Providers> */}
                <CookiesProvider>
                    <NuqsAdapter>
                        <Providers>{children}</Providers>
                    </NuqsAdapter>
                </CookiesProvider>
            </body>
        </html>
    );
};

export default RootLayout;
