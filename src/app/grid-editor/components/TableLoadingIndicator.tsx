import { times } from 'lodash';
import styled from 'styled-components';

import ContentLoader from '@/components/ContentLoader/ContentLoader';

const LoadingContainer = styled.div`
    overflow: hidden;
    max-width: 100%;
    margin-bottom: 15px;
    width: fit-content;
`;

const BorderTopRadius = styled.div`
    width: 230px;
    border-radius: 11px 11px 0 0;
    overflow: hidden;
    margin: 0 10px;
`;

const BorderBottomRadius = styled.div`
    width: 230px;
    border-radius: 0 0 11px 11px;
    overflow: hidden;
    margin: 0 10px;
`;

const TableLoadingIndicator = ({ contributionAmount }: { contributionAmount: number }) => (
    <LoadingContainer>
        <div className="clearfix" />
        <table className="mb-0 mt-3 table">
            <tbody className="table-borderless">
                <tr className="table-borderless">
                    <td className="p-0">
                        <BorderTopRadius>
                            <ContentLoader height={50} width={230} viewBox="0 0 230 50" speed={2} backgroundColor="#80869B">
                                <rect x="0" y="0" rx="0" ry="0" width="230" height="50" />
                            </ContentLoader>
                        </BorderTopRadius>
                    </td>
                    {times(contributionAmount, (i) => (
                        <td className="p-0" key={i} data-testid="contentLoader">
                            <BorderTopRadius>
                                <ContentLoader height={50} width={230} viewBox="0 0 230 50" speed={2} backgroundColor="#d5d8e3">
                                    <rect x="0" y="0" rx="0" ry="0" width="230" height="50" />
                                </ContentLoader>
                            </BorderTopRadius>
                        </td>
                    ))}
                </tr>
                <tr className="table-borderless">
                    <td className="p-0">
                        <BorderBottomRadius>
                            <ContentLoader height={150} width={230} viewBox="0 0 230 150" speed={2} backgroundColor="#80869B">
                                <rect x="0" y="0" rx="0" ry="0" width="230" height="150" />
                            </ContentLoader>
                        </BorderBottomRadius>
                    </td>
                    {times(contributionAmount, (i) => (
                        <td className="p-0" key={i}>
                            <BorderBottomRadius>
                                <ContentLoader height={150} width={230} viewBox="0 0 230 150" speed={2}>
                                    <rect x="0" y="0" rx="0" ry="0" width="230" height="150" />
                                </ContentLoader>
                            </BorderBottomRadius>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    </LoadingContainer>
);
export default TableLoadingIndicator;
