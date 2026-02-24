import { reverse } from 'named-urls';
import { env } from 'next-runtime-env';
import pluralize from 'pluralize';
import { FC } from 'react';

import useComparison from '@/components/Comparison/hooks/useComparison';
import Alert from '@/components/Ui/Alert/Alert';
import ROUTES from '@/constants/routes';

type PrintViewProps = {
    comparisonId?: string;
};
const PrintView: FC<PrintViewProps> = ({ comparisonId }) => {
    const { comparison, comparisonContents } = useComparison(comparisonId);

    const url = env('NEXT_PUBLIC_URL') + reverse(ROUTES.COMPARISON, { comparisonId });

    return (
        <Alert color="info" fade={false} className="d-none d-print-block">
            <p>Only the comparison metadata is printed. For the full comparison, please visit the link below.</p>
            <table className="table table-sm mb-2">
                <tbody>
                    {comparison?.title && (
                        <tr>
                            <th className="fw-semibold">Title</th>
                            <td>{comparison.title}</td>
                        </tr>
                    )}
                    {comparison?.description && (
                        <tr>
                            <th className="fw-semibold">Description</th>
                            <td>{comparison.description}</td>
                        </tr>
                    )}
                    {comparison?.authors && comparison.authors.length > 0 && (
                        <tr>
                            <th className="fw-semibold">{pluralize('Author', comparison.authors.length)}</th>
                            <td>{comparison.authors.map((author) => author.name).join(', ')}</td>
                        </tr>
                    )}
                    {comparisonContents?.titles && (
                        <tr>
                            <th className="fw-semibold">Number of contributions</th>
                            <td>{comparisonContents?.titles.length}</td>
                        </tr>
                    )}
                    {comparisonContents?.selected_paths && (
                        <tr>
                            <th className="fw-semibold">Number of rows</th>
                            <td>{comparisonContents.selected_paths.length}</td>
                        </tr>
                    )}
                    {comparison?.identifiers.doi && comparison.identifiers.doi.length > 0 && (
                        <tr>
                            <th className="fw-semibold">DOI</th>
                            <td>
                                <a href={`https://doi.org/${comparison.identifiers.doi[0]}`}>https://doi.org/{comparison.identifiers.doi[0]}</a>
                            </td>
                        </tr>
                    )}
                    <tr>
                        <th className="fw-semibold">URL</th>
                        <td>
                            <a href={url}>{url}</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        </Alert>
    );
};

export default PrintView;
