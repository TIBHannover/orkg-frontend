import { render as rtlRender } from '@testing-library/react';
import { HistoryRouter as Router } from 'redux-first-history/rr6';
import { Provider } from 'react-redux';
import configureStore from 'store';
import theme from 'assets/scss/ThemeVariables';
import { ThemeProvider } from 'styled-components';
import { ToastContainer } from 'react-toastify';

// wrap the components with the required providers
// redux part based on: https://redux.js.org/recipes/writing-tests#connected-components
const render = (ui, { initialState, store = configureStore(initialState), ...renderOptions } = {}) => {
    const { store: _store, history } = store;
    const wrapper = ({ children }) => (
        <Provider store={_store}>
            <ThemeProvider theme={theme}>
                <Router history={history} noInitialPop>
                    {children}
                </Router>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar className="toast-container" icon={false} theme="colored" />
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
