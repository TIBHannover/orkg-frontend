import Tabs from 'rc-tabs';
import PropTypes from 'prop-types';
import { ORKGTabsStyle } from './styled';

const ORKGTabs = ({ className, ...props }) => (
    <ORKGTabsStyle disablePadding={true} className={className}>
        <Tabs {...props} getPopupContainer={trigger => trigger.parentNode} />
    </ORKGTabsStyle>
);

ORKGTabs.propTypes = {
    className: PropTypes.string,
};

export default ORKGTabs;
