import { StyledStatementItem } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';

const NoData = props => {
    return (
        <StyledStatementItem style={{ marginBottom: 0 }} className="noTemplate">
            No data yet
            <br />
            {props.enableEdit ? (
                !props.templatesFound ? (
                    <span style={{ fontSize: '0.875rem' }}>Start by adding a property from below</span>
                ) : (
                    <span style={{ fontSize: '0.875rem' }}>Start by using a template or adding property</span>
                )
            ) : (
                <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
            )}
            <br />
        </StyledStatementItem>
    );
};

NoData.propTypes = {
    enableEdit: PropTypes.bool.isRequired,
    templatesFound: PropTypes.bool.isRequired
};

NoData.defaultProps = {
    enableEdit: false
};

export default NoData;
