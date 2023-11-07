import { StyledStatementItem } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';

const NoData = ({ enableEdit = false }) => (
    <StyledStatementItem className="mb-0 rounded">
        No data yet
        <br />
        {enableEdit ? (
            <span style={{ fontSize: '0.875rem' }}>Start by using a template or adding property from below</span>
        ) : (
            <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
        )}
        <br />
    </StyledStatementItem>
);

NoData.propTypes = {
    enableEdit: PropTypes.bool.isRequired,
};

export default NoData;
