import '@/assets/scss/CustomBootstrap.scss';
import '@/assets/scss/DefaultLayout.scss';
import 'leaflet/dist/leaflet.css';
import 'react-toastify/dist/ReactToastify.css';

import type { Preview } from '@storybook/nextjs';
import React from 'react';
import { createGlobalStyle } from 'styled-components';

import { Wrapper } from '@/testUtils';

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
        <Wrapper>
            <GlobalStyle />
            <div className="bg-white" style={{ background: '#fff!important' }}>
                <Story />
            </div>
        </Wrapper>
    ),
];
export const tags = ['autodocs'];
