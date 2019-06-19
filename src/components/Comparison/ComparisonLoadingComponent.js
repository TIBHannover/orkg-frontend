import React, { Component } from 'react'
import ContentLoader from 'react-content-loader'
import styled from 'styled-components';

const BorderTopRaduis = styled.div.attrs(props => ({
    className: 'mr-2 ml-2',
}))`
    border-radius: 11px 11px 0 0;
    overflow: hidden;
`;

const BorderBottomRaduis = styled.div.attrs(props => ({
    className: 'mr-2 ml-2',
}))`
    border-radius: 0 0 11px 11px;
    overflow: hidden;
`;

export default class ComparisonLoadingComponent extends Component {
    render() {
        return (
            <div>
                <div class="clearfix" />
                <table class="mb-0 mt-3 table" cellspacing="0" cellpadding="0">
                    <tbody class="table-borderless">
                        <tr class="table-borderless">
                            <td class="p-0" >
                                <BorderTopRaduis>
                                    <ContentLoader
                                        height={20}
                                        width={100}
                                        speed={2}
                                        primaryColor="#80869B"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="20" />
                                    </ContentLoader>
                                </BorderTopRaduis>
                            </td>
                            <td class="p-0" >
                                <BorderTopRaduis>
                                    <ContentLoader
                                        height={20}
                                        width={100}
                                        speed={2}
                                        primaryColor="#E86161"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="20" />
                                    </ContentLoader>
                                </BorderTopRaduis>
                            </td>
                            <td class="p-0" >
                                <BorderTopRaduis>
                                    <ContentLoader
                                        height={20}
                                        width={100}
                                        speed={2}
                                        primaryColor="#E86161"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="20" />
                                    </ContentLoader>
                                </BorderTopRaduis>
                            </td>
                            <td class="p-0" >
                                <BorderTopRaduis>
                                    <ContentLoader
                                        height={20}
                                        width={100}
                                        speed={2}
                                        primaryColor="#E86161"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="20" />
                                    </ContentLoader>
                                </BorderTopRaduis>
                            </td>
                        </tr>
                        <tr class="table-borderless">
                            <td class="p-0" >
                                <BorderBottomRaduis>
                                    <ContentLoader
                                        height={60}
                                        width={100}
                                        speed={2}
                                        primaryColor="#80869B"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="60" />
                                    </ContentLoader>
                                </BorderBottomRaduis>
                            </td>
                            <td class="p-0" >
                                <BorderBottomRaduis>
                                    <ContentLoader
                                        height={60}
                                        width={100}
                                        speed={2}
                                        primaryColor="#f3f3f3"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="60" />
                                    </ContentLoader>
                                </BorderBottomRaduis>
                            </td>
                            <td class="p-0" >
                                <BorderBottomRaduis>
                                    <ContentLoader
                                        height={60}
                                        width={100}
                                        speed={2}
                                        primaryColor="#f3f3f3"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="60" />
                                    </ContentLoader>
                                </BorderBottomRaduis>
                            </td>
                            <td class="p-0" >
                                <BorderBottomRaduis>
                                    <ContentLoader
                                        height={60}
                                        width={100}
                                        speed={2}
                                        primaryColor="#f3f3f3"
                                        secondaryColor="#ecebeb"
                                    >
                                        <rect x="0" y="0" rx="0" ry="0" width="100" height="60" />
                                    </ContentLoader>
                                </BorderBottomRaduis>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}
