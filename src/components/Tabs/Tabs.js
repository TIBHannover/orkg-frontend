import Tabs from 'rc-tabs';
import PropTypes from 'prop-types';
import { ORKGTabsStyle } from './styled';

const ORKGTabs = ({ style, className, ...props }) => (
    <ORKGTabsStyle disablePadding={true} className={className} style={style}>
        <Tabs {...props} getPopupContainer={trigger => trigger.parentNode} />
    </ORKGTabsStyle>
);

ORKGTabs.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
};

export default ORKGTabs;
