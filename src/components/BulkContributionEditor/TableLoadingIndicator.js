import { times } from 'lodash';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';
import styled from 'styled-components';

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

const TableLoadingIndicator = ({ contributionAmount }) => {
    return (
        <LoadingContainer>
            <div className="clearfix" />
            <table className="mb-0 mt-3 table">
                <tbody className="table-borderless">
                    <tr className="table-borderless">
                        <td className="p-0">
                            <BorderTopRadius>
                                <ContentLoader
                                    height={50}
                                    width={230}
                                    viewBox="0 0 230 50"
                                    speed={2}
                                    backgroundColor="#80869B"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="0" ry="0" width="230" height="50" />
                                </ContentLoader>
                            </BorderTopRadius>
                        </td>
                        {times(contributionAmount, i => (
                            <td className="p-0" key={i}>
                                <BorderTopRadius>
                                    <ContentLoader
                                        height={50}
                                        width={230}
                                        viewBox="0 0 230 50"
                                        speed={2}
                                        backgroundColor="#d5d8e3"
                                        foregroundColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="230" height="50" />
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
                                    width={230}
                                    viewBox="0 0 230 150"
                                    speed={2}
                                    backgroundColor="#80869B"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="0" ry="0" width="230" height="150" />
                                </ContentLoader>
                            </BorderBottomRadius>
                        </td>
                        {times(contributionAmount, i => (
                            <td className="p-0" key={i}>
                                <BorderBottomRadius>
                                    <ContentLoader
                                        height={150}
                                        width={230}
                                        viewBox="0 0 230 150"
                                        speed={2}
                                        backgroundColor="#f3f3f3"
                                        foregroundColor="#ecebeb"
                                    >
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
};

TableLoadingIndicator.propTypes = {
    contributionAmount: PropTypes.number.isRequired
};

export default TableLoadingIndicator;
