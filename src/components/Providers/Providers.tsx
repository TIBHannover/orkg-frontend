'use client';

import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-bibjson';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { plugins } from '@citation-js/core';
import { config } from '@fortawesome/fontawesome-svg-core';
import { RouterProvider } from '@heroui/react';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { env } from 'next-runtime-env';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { SWRConfig } from 'swr';

import theme from '@/assets/css/ThemeVariables';
import DefaultLayout from '@/components/Layout/DefaultLayout';
import MatomoAnalytics from '@/components/Matomo/MatomoAnalytics';
import ResetStoreOnNavigate from '@/components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import REGEX from '@/constants/regex';
import StyledComponentsRegistry from '@/lib/registry';
import SWR_CONFIG from '@/services/SWRConfig';
import { setupStore } from '@/store';

dayjs.extend(relativeTime);
dayjs.extend(localeData);

config.autoAddCss = false;

// https://github.com/citation-js/citation-js/issues/182
plugins.input.add('@doi/api', {
    parseType: {
        dataType: 'String',
        predicate: REGEX.DOI_URL,
        extends: '@else/url',
    },
});
plugins.input.add('@doi/id', {
    parseType: {
        dataType: 'String',
        predicate: REGEX.DOI_ID,
    },
});

const { store } = setupStore();

// Configuration for citation-js bibtex plubin
const configCitationJs = plugins.config.get('@bibtex');
configCitationJs.format.useIdAsLabel = true;

const Providers = ({ children }: { children: React.ReactNode }) => {
    // The session provider would make sure that the session is kept alive by polling the nextjs server every 4 minutes
    const router = useRouter();
    return (
        <RouterProvider navigate={router.push}>
            <SessionProvider baseUrl={`${env('NEXT_PUBLIC_URL')}`} basePath="/auth" refetchInterval={4 * 60}>
                <StyledComponentsRegistry>
                    <Provider store={store}>
                        <ResetStoreOnNavigate>
                            <ThemeProvider theme={theme}>
                                <SWRConfig value={SWR_CONFIG}>
                                    <DefaultLayout>{children}</DefaultLayout>

                                    <Suspense fallback={null}>
                                        <MatomoAnalytics />
                                    </Suspense>
                                </SWRConfig>
                            </ThemeProvider>
                        </ResetStoreOnNavigate>
                    </Provider>
                </StyledComponentsRegistry>
            </SessionProvider>
        </RouterProvider>
    );
};

export default Providers;
