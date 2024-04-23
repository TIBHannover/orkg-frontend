import { render as rtlRender } from '@testing-library/react';
import theme from 'assets/scss/ThemeVariables';
import { MathJaxContext } from 'better-react-mathjax';
import MATH_JAX_CONFIG from 'constants/mathJax';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import configureStore from 'store';
import { ThemeProvider } from 'styled-components';

const Wrapper = ({ children, initialState = {}, store = configureStore(initialState) }) => {
    const { store: _store } = store;

    return (
        <Provider store={_store}>
            <ThemeProvider theme={theme}>
                <MathJaxContext config={MATH_JAX_CONFIG}>
                    {children}
                    <ToastContainer position="top-right" autoClose={5000} hideProgressBar className="toast-container" icon={false} theme="colored" />
                </MathJaxContext>
            </ThemeProvider>
        </Provider>
    );
};

Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
    initialState: PropTypes.object,
    store: PropTypes.object,
};

// wrap the components with the required providers
// redux part based on: https://redux.js.org/recipes/writing-tests#connected-components
const render = (ui, { initialState, store, ...renderOptions } = {}) => {
    const rendered = rtlRender(ui, { wrapper: ({ children }) => Wrapper({ children, store, initialState }), ...renderOptions });

    return {
        ...rendered,
        // so it is also possible to pass a state to the rerender function
        rerender: (ui, options) => render(ui, { container: rendered.container, ...options }),
    };
};

// re-export everything
export * from '@testing-library/react';
// override render method
export { Wrapper, render };
