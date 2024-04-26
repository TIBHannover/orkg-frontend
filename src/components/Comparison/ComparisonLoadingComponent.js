import { times } from 'lodash';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

const BorderTopRadius = styled.div`
    width: 250px;
    border-radius: 0;
    overflow: hidden;
`;

const BorderBottomRadius = styled.div`
    width: 250px;
    border-radius: 0;
    overflow: hidden;
`;

const COLUMN_AMOUNT = 30;

const ComparisonLoadingComponent = () => (
    <div style={{ overflow: 'hidden', borderRadius: 6 }}>
        <table className="mb-0 table" style={{ maxWidth: 1044 }}>
            <tbody className="table-borderless">
                <tr className="table-borderless" style={{ borderStyle: 'hidden' }}>
                    <td className="p-0">
                        <ContentLoader height={50} width={250} viewBox="0 0 250 50" speed={2} backgroundColor="#80869B" foregroundColor="#ecebeb">
                            <rect x="0" y="0" rx="0" ry="0" width="250" height="50" />
                        </ContentLoader>
                    </td>
                    {times(COLUMN_AMOUNT, (i) => (
                        <td className="p-0" key={i}>
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
                <tr className="table-borderless" style={{ borderStyle: 'hidden' }}>
                    <td className="p-0">
                        <ContentLoader height={250} width={250} viewBox="0 0 250 250" speed={2} backgroundColor="#80869B" foregroundColor="#ecebeb">
                            <rect x="0" y="0" rx="0" ry="0" width="250" height="250" />
                        </ContentLoader>
                    </td>
                    {times(COLUMN_AMOUNT, (i) => (
                        <td className="p-0" key={i}>
                            <BorderBottomRadius>
                                <ContentLoader
                                    height={250}
                                    width={250}
                                    viewBox="0 0 250 250"
                                    speed={2}
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="0" ry="0" width="250" height="250" />
                                </ContentLoader>
                            </BorderBottomRadius>
                        </td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>
);

export default ComparisonLoadingComponent;
