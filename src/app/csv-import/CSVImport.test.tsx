import fs from 'fs';
import path from 'path';

import CSVImport from '@/app/csv-import/page';
import { fireEvent, render, screen, waitFor } from '@/testUtils';

const Setup = () => {
    render(<CSVImport />);
};

function createMockFile(content: string, name: string, type: string) {
    return new File([content], name, { type });
}

describe('CSVImport', () => {
    it('should render the CSVImport page', async () => {
        await Setup();
        expect(screen.getByText(/CSV import/i)).toBeInTheDocument();
        expect(screen.getByText(/With this tool, you can import a CSV file with papers to the ORKG/i)).toBeInTheDocument();
        const csvPath = path.resolve(__dirname, '__mocks__/test.csv');
        const mockCsvContent = fs.readFileSync(csvPath, 'utf-8');
        const file = createMockFile(mockCsvContent, 'test.csv', 'text/csv');
        const input = screen.getByTestId('csv-file-input');
        fireEvent.change(input, { target: { files: [file] } });
        await waitFor(() => expect(screen.getByText(/Initial column name/i)).toBeInTheDocument());
    });
});
