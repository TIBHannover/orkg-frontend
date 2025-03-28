import { MotionGlobalConfig } from 'framer-motion';

import DataBrowser from '@/components/DataBrowser/DataBrowser';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import { createMSWResource, createMSWStatement } from '@/services/mocks/helpers';
import { fireEvent, render, screen, waitForElementToBeRemoved } from '@/testUtils';

MotionGlobalConfig.skipAnimations = true;

const setup = (
    props: DataBrowserProps = {
        id: 'R0',
    },
) => {
    createMSWResource({
        id: 'TableResource',
        label: 'Fitted LMM with Aphid_incidence as the response variable, and Year and mead_250 as fixed effects',
        classes: ['Table'],
    });

    createMSWStatement({
        subject: props.id,
        predicate: 'P1',
        object: 'TableResource',
    });

    render(<DataBrowser {...props} />);
};

describe('DataBrowser.Table', () => {
    it('should render table view', async () => {
        await setup();
        expect(await screen.findByText(/resource label 0/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Visualize data in tabular form' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Visualize data in tabular form' }));
        await waitForElementToBeRemoved(() => screen.queryByText(/Loading table/i));
        expect(screen.getByText(/0.044855608/i)).toBeInTheDocument();
        expect(screen.getByText(/(Intercept)/i)).toBeInTheDocument();
    });
});
