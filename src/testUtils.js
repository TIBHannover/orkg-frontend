import { render as rtlRender } from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore, { history } from 'store';
import theme from 'assets/scss/ThemeVariables';
import { ThemeProvider } from 'styled-components';

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
