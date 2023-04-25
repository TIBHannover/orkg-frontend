import 'assets/scss/CustomBootstrap.scss';
import 'assets/scss/DefaultLayout.scss';
import 'react-toastify/dist/ReactToastify.css';
import styled, { createGlobalStyle } from 'styled-components';
import 'tippy.js/dist/tippy.css';
import { Wrapper } from '../src/testUtils';

export const parameters = {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

// override the default background color
const GlobalStyle = createGlobalStyle`
    html,
    body {
        background-color: #fff!important;
    }
`;

export const decorators = [
    Story => (
        <Wrapper>
            <GlobalStyle />
            <div className="bg-white" style={{ background: '#fff!important' }}>
                <Story />
            </div>
        </Wrapper>
    ),
];
