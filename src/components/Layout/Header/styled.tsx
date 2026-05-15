import styled from 'styled-components';

import HomeBannerBg from '@/assets/img/graph-background.svg';

const StyledTopBar = styled.div`
    margin-bottom: 0;
    padding-top: 72px;
    position: relative;

    &.home-page {
        background: #5f6474 url(${HomeBannerBg.src});
        background-position-x: 0%, 0%;
        background-position-y: 0%, 0%;
        background-size: cover;
        background-attachment: fixed;
        background-position: center 10%;
        background-repeat: no-repeat;
    }
`;

export default StyledTopBar;
