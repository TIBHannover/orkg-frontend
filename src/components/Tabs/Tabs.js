import Tabs from 'rc-tabs';
import PropTypes from 'prop-types';
import { ORKGTabsStyle } from 'components/Tabs/styled';

const ORKGTabs = ({ style, className, ...props }) => (
    <ORKGTabsStyle className={className} style={style}>
        <Tabs {...props} getPopupContainer={trigger => trigger.parentNode} />
    </ORKGTabsStyle>
);

ORKGTabs.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
};

export default ORKGTabs;
