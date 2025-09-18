'use client';

import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-doi';
import '@citation-js/plugin-bibjson';
import '@fortawesome/fontawesome-svg-core/styles.css';

import { plugins } from '@citation-js/core';
import { config } from '@fortawesome/fontawesome-svg-core';
import { createInstance, MatomoProvider } from '@jonkoops/matomo-tracker-react';
import { MathJaxContext } from 'better-react-mathjax';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import { SessionProvider } from 'next-auth/react';
import { env } from 'next-runtime-env';
import PropTypes from 'prop-types';
import { CookiesProvider } from 'react-cookie';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { SWRConfig } from 'swr';

import theme from '@/assets/scss/ThemeVariables';
import DefaultLayout from '@/components/Layout/DefaultLayout';
import ResetStoreOnNavigate from '@/components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import MATH_JAX_CONFIG from '@/constants/mathJax';
import REGEX from '@/constants/regex';
import StyledComponentsRegistry from '@/lib/registry';
import SWR_CONFIG from '@/services/SWRConfig';
import { setupStore } from '@/store';

dayjs.extend(relativeTime);
dayjs.extend(localeData);

config.autoAddCss = false;

const matomoInstance =
    env('NEXT_PUBLIC_MATOMO_TRACKER') === 'true'
        ? createInstance({
              urlBase: 'https://www.orkg.org/',
              siteId: env('NEXT_PUBLIC_MATOMO_TRACKER_SITE_ID'),
              trackerUrl: `${env('NEXT_PUBLIC_MATOMO_TRACKER_URL')}matomo.php`,
              srcUrl: `${env('NEXT_PUBLIC_MATOMO_TRACKER_URL')}matomo.js`,
              disabled: false,
              linkTracking: true,
              trackPageView: true,
              configurations: {
                  disableCookies: true,
              },
          })
        : undefined;

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

const Providers = ({ children }) => (
    // The session provider would make sure that the session is kept alive by polling the nextjs server every 4 minutes
    <SessionProvider baseUrl={`${env('NEXT_PUBLIC_URL')}`} basePath="/auth" refetchInterval={4 * 60}>
        <StyledComponentsRegistry>
            <CookiesProvider>
                <Provider store={store}>
                    <ResetStoreOnNavigate>
                        <ThemeProvider theme={theme}>
                            <SWRConfig value={SWR_CONFIG}>
                                <MathJaxContext config={MATH_JAX_CONFIG}>
                                    <MatomoProvider value={matomoInstance}>
                                        <DefaultLayout>{children}</DefaultLayout>
                                    </MatomoProvider>
                                </MathJaxContext>
                            </SWRConfig>
                        </ThemeProvider>
                    </ResetStoreOnNavigate>
                </Provider>
            </CookiesProvider>
        </StyledComponentsRegistry>
    </SessionProvider>
);

Providers.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Providers;
