'use client';

import { plugins } from '@citation-js/core';
import '@citation-js/plugin-bibtex';
import '@citation-js/plugin-csl';
import '@citation-js/plugin-doi';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { MatomoProvider, createInstance } from '@jonkoops/matomo-tracker-react';
import theme from 'assets/scss/ThemeVariables';
import { MathJaxContext } from 'better-react-mathjax';
import DefaultLayout from 'components/Layout/DefaultLayout';
import env from 'components/NextJsMigration/env';
import ResetStoreOnNavigate from 'components/ResetStoreOnNavigate/ResetStoreOnNavigate';
import MATH_JAX_CONFIG from 'constants/mathJax';
import REGEX from 'constants/regex';
import StyledComponentsRegistry from 'lib/registry';
import PropTypes from 'prop-types';
import { CookiesProvider } from 'react-cookie';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Provider } from 'react-redux';
import configureStore from 'store';
import { ThemeProvider } from 'styled-components';
import SWR_CONFIG from 'services/SWRConfig';
import { SWRConfig } from 'swr';

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

// const { store, history } = configureStore();
const { store } = configureStore();

// Configuration for citation-js bibtex plubin
const configCitationJs = plugins.config.get('@bibtex');
configCitationJs.format.useIdAsLabel = true;

const Providers = ({ children }) => (
    <StyledComponentsRegistry>
        <DndProvider backend={HTML5Backend}>
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
        </DndProvider>
    </StyledComponentsRegistry>
);

Providers.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Providers;
