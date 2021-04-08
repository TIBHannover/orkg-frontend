import { render as rtlRender } from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore, { history } from 'store';
import { ThemeProvider } from 'styled-components';

// https://github.com/adamgruber/sass-extract-js/issues/12
export const theme = {
    orkgBorderRadius: '6px',
    orkgPrimaryColor: 'rgb(232, 97, 97)',
    orkgBorderWidth: '1px',
    primary: 'rgb(232, 97, 97)',
    secondary: 'rgb(128, 134, 155)',
    secondaryDarker: 'rgb(80, 85, 101)',
    light: 'rgb(233, 236, 239)',
    lightLighter: 'rgb(248, 249, 251)',
    lightDarker: 'rgb(219, 221, 229)',
    bodyBg: 'rgb(233, 235, 242)',
    bodyColor: 'rgb(79, 79, 79)',
    borderWidth: '1px',
    borderRadius: '6px',
    themeColors: {
        light: 'rgb(233, 235, 242)',
        secondary: 'rgb(128, 134, 155)',
        secondaryDarker: 'rgb(80, 85, 101)',
        primaryDarker: 'rgb(198, 29, 29)'
    },
    formFeedbackFontSize: '90%',
    inputBorderRadius: '6px',
    inputBorderRadiusSm: '6px',
    btnBorderRadius: '6px',
    btnBorderRadiusSm: '6px',
    btnBorderRadiusLg: '6px',
    inputBg: 'rgb(247, 247, 247)',
    inputBtnPaddingX: '30px',
    inputPaddingX: '0.75rem',
    btnPaddingXSm: '1.25rem',
    dropdownLinkHoverBg: 'rgb(233, 233, 233)',
    customCheckboxIndicatorBorderRadius: '3px',
    headingsFontWeight: 400,
    headingsColor: 'rgb(55, 63, 69)',
    modalContentBorderRadius: '11px',
    modalContentBorderWidth: '3px',
    badgeFontSize: '85%',
    badgeFontWeight: 500,
    badgePaddingY: '0.3rem',
    badgePaddingX: '0.8rem',
    listGroupBorderColor: 'rgba(0, 0, 0, 0.125)',
    dark: 'rgb(91, 97, 118)',
    dark: 'rgb(103, 109, 129)'
};

// wrap the components with the required providers
// redux part based on: https://redux.js.org/recipes/writing-tests#connected-components
const render = (ui, { initialState, store = configureStore(initialState), ...renderOptions } = {}) => {
    const wrapper = ({ children }) => (
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <ConnectedRouter history={history} noInitialPop>
                    {children}
                </ConnectedRouter>
            </ThemeProvider>
        </Provider>
    );

    const rendered = rtlRender(ui, { wrapper, ...renderOptions });

    return {
        ...rendered,
        // so it is also possible to pass a state to the rerender function
        rerender: (ui, options) => render(ui, { container: rendered.container, ...options })
    };
};

// re-export everything
export * from '@testing-library/react';
// override render method
export { render };
