import { StyledStatementItem } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';

const NoData = props => {
    return (
        <StyledStatementItem className="mb-0 rounded">
            No data yet
            <br />
            {props.enableEdit ? (
                <span style={{ fontSize: '0.875rem' }}>Start by using a template or adding property from below</span>
            ) : (
                <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
            )}
            <br />
        </StyledStatementItem>
    );
};

NoData.propTypes = {
    enableEdit: PropTypes.bool.isRequired
};

NoData.defaultProps = {
    enableEdit: false
};

export default NoData;
