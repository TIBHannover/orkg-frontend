import type { Preview } from '@storybook/react';
import 'assets/scss/CustomBootstrap.scss';
import 'assets/scss/DefaultLayout.scss';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-toastify/dist/ReactToastify.css';
import { createGlobalStyle } from 'styled-components';
import { Wrapper } from '../src/testUtils';

export const parameters: Preview['parameters'] = {
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

export const decorators: Preview['decorators'] = [
    (Story: React.ComponentType) => (
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
export const tags = ['autodocs'];
