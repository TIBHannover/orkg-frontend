import { times } from 'lodash';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

const BorderTopRadius = styled.div`
    width: 250px;
    border-radius: 11px 11px 0 0;
    overflow: hidden;
`;

const BorderBottomRadius = styled.div`
    width: 250px;
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
                                <ContentLoader
                                    height={50}
                                    width={250}
                                    viewBox="0 0 250 50"
                                    speed={2}
                                    backgroundColor="#80869B"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="0" ry="0" width="250" height="50" />
                                </ContentLoader>
                            </BorderTopRadius>
                        </td>
                        {times(COLUMN_AMOUNT, index => (
                            <td key={index} className="p-0">
                                <BorderTopRadius>
                                    <ContentLoader
                                        height={50}
                                        width={250}
                                        viewBox="0 0 250 50"
                                        speed={2}
                                        backgroundColor="#E86161"
                                        foregroundColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="250" height="50" />
                                    </ContentLoader>
                                </BorderTopRadius>
                            </td>
                        ))}
                    </tr>
                    <tr className="table-borderless">
                        <td className="p-0">
                            <BorderBottomRadius>
                                <ContentLoader
                                    height={150}
                                    width={250}
                                    viewBox="0 0 250 150"
                                    speed={2}
                                    backgroundColor="#80869B"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="0" ry="0" width="250" height="150" />
                                </ContentLoader>
                            </BorderBottomRadius>
                        </td>
                        {times(COLUMN_AMOUNT, index => (
                            <td key={index} className="p-0">
                                <BorderBottomRadius>
                                    <ContentLoader
                                        height={150}
                                        width={250}
                                        viewBox="0 0 250 150"
                                        speed={2}
                                        backgroundColor="#f3f3f3"
                                        foregroundColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="250" height="150" />
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
