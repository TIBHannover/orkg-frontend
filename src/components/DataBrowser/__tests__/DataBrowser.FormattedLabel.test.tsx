import DataBrowser from '@/components/DataBrowser/DataBrowser';
import { DataBrowserProps } from '@/components/DataBrowser/types/DataBrowserTypes';
import { render, screen } from '@/testUtils';

const setup = (
    props: DataBrowserProps = {
        id: 'R44727',
    },
) => {
    render(<DataBrowser {...props} />);
};

describe('DataBrowser.FormattedLabel', () => {
    it('should render Basic reproduction number contribution', async () => {
        setup();
        expect(await screen.findByText(/Lombardy, Italy/i)).toBeInTheDocument();
        expect(await screen.findByText(/3.1/i)).toBeInTheDocument();
        expect(await screen.findByText(/Determination of the COVID-19 basic reproduction number/i)).toBeInTheDocument();
        expect(await screen.findByText(/2020-01-14 - 2020-03-08/i)).toBeInTheDocument();
    });
});
