import { render, screen } from 'testUtils';
import TableLoadingIndicator from '../TableLoadingIndicator';

describe('TableLoadingIndicator', () => {
    it('should show the amount of contentLoaders as provided in the props', () => {
        render(<TableLoadingIndicator contributionAmount={5} />);
        expect(screen.queryAllByTestId('contentLoader')).toHaveLength(5);
    });
});
