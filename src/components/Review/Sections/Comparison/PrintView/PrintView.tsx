import { reverse } from 'named-urls';
import { env } from 'next-runtime-env';
import pluralize from 'pluralize';
import { FC } from 'react';
import { Alert } from 'reactstrap';
import useSWR from 'swr';

import ROUTES from '@/constants/routes';
import { comparisonUrl, getComparison } from '@/services/backend/comparisons';

type PrintViewProps = {
    comparisonId?: string;
};
const PrintView: FC<PrintViewProps> = ({ comparisonId }) => {
    const { data: comparison } = useSWR(comparisonId ? [comparisonId, comparisonUrl, 'getComparison'] : null, ([id]) => getComparison(id));
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
                    {comparison?.contributions && (
                        <tr>
                            <th className="fw-semibold">Number of contributions</th>
                            <td>{comparison.contributions.length}</td>
                        </tr>
                    )}
                    {comparison?.data.predicates && (
                        <tr>
                            <th className="fw-semibold">Number of properties</th>
                            <td>{comparison.data.predicates.length}</td>
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
