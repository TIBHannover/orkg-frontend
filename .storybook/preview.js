import 'assets/scss/CustomBootstrap.scss';
import 'assets/scss/DefaultLayout.scss';
import 'react-toastify/dist/ReactToastify.css';
import styled, { createGlobalStyle } from 'styled-components';
import 'tippy.js/dist/tippy.css';
import { Wrapper } from '../src/testUtils';
import '../public/__ENV';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

export const parameters = {
    actions: { argTypesRegex: '^on.*' },
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
        <DndProvider backend={HTML5Backend}>
            <Wrapper>
                <GlobalStyle />
                <div className="bg-white" style={{ background: '#fff!important' }}>
                    <Story />
                </div>
            </Wrapper>
        </DndProvider>
    ),
];
