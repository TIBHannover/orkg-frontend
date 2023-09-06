import styled from 'styled-components';
import PropTypes from 'prop-types';
import HomeTabsContainer from 'components/Tabs/HomeTabsContainer';

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

const FeaturedItemsBox = ({ researchFieldId, researchFieldLabel }) => (
    <SidebarStyledBox className="box rounded-3 mt-3">
        <HomeTabsContainer researchFieldId={researchFieldId} researchFieldLabel={researchFieldLabel} />
    </SidebarStyledBox>
);

FeaturedItemsBox.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    researchFieldLabel: PropTypes.string.isRequired,
};

export default FeaturedItemsBox;
