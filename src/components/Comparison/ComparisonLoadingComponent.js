import { times } from 'lodash';
import React from 'react';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

const BorderTopRadius = styled.div.attrs(() => ({
    className: 'mr-2 ml-2'
}))`
    border-radius: 11px 11px 0 0;
    overflow: hidden;
`;

const BorderBottomRadius = styled.div.attrs(() => ({
    className: 'mr-2 ml-2'
}))`
    border-radius: 0 0 11px 11px;
    overflow: hidden;
`;

const COLUMN_AMOUNT = 3;

const ComparisonLoadingComponent = () => {
    return (
        <div>
            <div className="clearfix" />
            <table className="mb-0 mt-3 table" style={{ maxWidth: 1044 }}>
                <tbody className="table-borderless">
                    <tr className="table-borderless">
                        <td className="p-0">
                            <BorderTopRadius>
                                <ContentLoader height={20} width={100} speed={2} primaryColor="#80869B" secondaryColor="#ecebeb">
                                    <rect x="0" y="0" rx="0" ry="0" width="100" height="20" />
                                </ContentLoader>
                            </BorderTopRadius>
                        </td>
                        {times(COLUMN_AMOUNT, () => (
                            <td className="p-0">
                                <BorderTopRadius>
                                    <ContentLoader height={20} width={100} speed={2} primaryColor="#E86161" secondaryColor="#ecebeb">
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="20" />
                                    </ContentLoader>
                                </BorderTopRadius>
                            </td>
                        ))}
                    </tr>
                    <tr className="table-borderless">
                        <td className="p-0">
                            <BorderBottomRadius>
                                <ContentLoader height={60} width={100} speed={2} primaryColor="#80869B" secondaryColor="#ecebeb">
                                    <rect x="0" y="0" rx="0" ry="0" width="100" height="60" />
                                </ContentLoader>
                            </BorderBottomRadius>
                        </td>
                        {times(COLUMN_AMOUNT, () => (
                            <td className="p-0">
                                <BorderBottomRadius>
                                    <ContentLoader height={60} width={100} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="60" />
                                    </ContentLoader>
                                </BorderBottomRadius>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ComparisonLoadingComponent;
