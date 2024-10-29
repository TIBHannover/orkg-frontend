import DataBrowser from 'components/DataBrowser/DataBrowser';
import { DataBrowserProps } from 'components/DataBrowser/types/DataBrowserTypes';
import { render, screen } from 'testUtils';

const setup = (
    props: DataBrowserProps = {
        id: 'R0',
    },
) => {
    render(<DataBrowser {...props} />);
};

describe('DataBrowser', () => {
    it('should render data browser', async () => {
        setup();
        expect(await screen.findByText(/resource label 0/i)).toBeInTheDocument();
        expect(await screen.findByText(/No data yet/i)).toBeInTheDocument();
    });
});
