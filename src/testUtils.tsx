import type { RenderOptions } from '@testing-library/react';
import { render as rtlRender } from '@testing-library/react';
import theme from 'assets/scss/ThemeVariables';
import { MathJaxContext } from 'better-react-mathjax';
import MATH_JAX_CONFIG from 'constants/mathJax';
import { PropsWithChildren, ReactElement } from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { RootStore } from 'slices/types';
import { AppStore, setupStore } from 'store';
import { ThemeProvider } from 'styled-components';
import { SWRConfig } from 'swr';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import relativeTime from 'dayjs/plugin/relativeTime';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';

dayjs.extend(relativeTime);
dayjs.extend(localeData);

type WrapperProps = {
    initialState?: Partial<RootStore>;
    store?: AppStore;
} & PropsWithChildren;

// Automatically create a store instance if no store was passed in
const Wrapper = ({ children, initialState = {}, store = setupStore(initialState) }: WrapperProps) => {
    const { store: _store } = store;
    return (
        <NuqsTestingAdapter>
            <Provider store={_store}>
                <ThemeProvider theme={theme}>
                    <SWRConfig value={{ dedupingInterval: 0 }}>
                        <MathJaxContext config={MATH_JAX_CONFIG}>
                            {children}
                            <ToastContainer
                                position="top-right"
                                autoClose={5000}
                                hideProgressBar
                                className="toast-container"
                                icon={false}
                                theme="colored"
                            />
                        </MathJaxContext>
                    </SWRConfig>
                </ThemeProvider>
            </Provider>
        </NuqsTestingAdapter>
    );
};

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
    initialState?: Partial<RootStore>;
    store?: AppStore;
}

// wrap the components with the required providers
// redux part based on: https://redux.js.org/recipes/writing-tests#connected-components
const render = (ui: ReactElement, extendedRenderOptions: ExtendedRenderOptions = {}) => {
    const { initialState, store, ...renderOptions } = extendedRenderOptions;

    const rendered = rtlRender(ui, { wrapper: ({ children }: PropsWithChildren) => Wrapper({ children, store, initialState }), ...renderOptions });

    // Return an object with the store and all of RTL's query functions
    return {
        store,
        ...rendered,
    };
};

// re-export everything
export * from '@testing-library/react';
// override render method
export { render, Wrapper };
