import '@/app/globals.css';
import 'leaflet/dist/leaflet.css';

import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';

import { Wrapper } from '@/testUtils';

export const parameters: Preview['parameters'] = {
    controls: {
        matchers: {
            color: /(background|color)$/i,
            date: /Date$/,
        },
    },
};

export const decorators: Preview['decorators'] = [
    (Story: React.ComponentType) => (
        <Wrapper>
            <div className="bg-white" style={{ background: '#fff!important' }}>
                <Story />
            </div>
        </Wrapper>
    ),
];
export const tags = ['autodocs'];
