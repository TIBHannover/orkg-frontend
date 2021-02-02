import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { upperFirst } from 'lodash';
import { PREDICATE_TYPE_ID } from 'constants/misc';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Button } from 'reactstrap';

const PropertyValue = ({ id, label, similar }) => {
    const [showStatementBrowser, setShowStatementBrowser] = useState(false);

    const handleOpenStatementBrowser = () => {
        setShowStatementBrowser(true);
    };

    return (
        <>
            <Button onClick={handleOpenStatementBrowser} color="link" className="text-light m-0 p-0">
                <DescriptionTooltip
                    id={id}
                    typeId={PREDICATE_TYPE_ID}
                    extraContent={similar && similar.length ? `This property is merged with : ${similar.join(', ')}` : ''}
                >
                    {upperFirst(label)}
                    {similar && similar.length > 0 && '*'}
                </DescriptionTooltip>
            </Button>

            {showStatementBrowser && (
                <StatementBrowserDialog
                    show={true}
                    type={PREDICATE_TYPE_ID}
                    toggleModal={() => setShowStatementBrowser(v => !v)}
                    id={id}
                    label={label}
                />
            )}
        </>
    );
};

PropertyValue.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    similar: PropTypes.array
};

PropertyValue.defaultProps = {
    label: PropTypes.string.isRequired,
    similar: PropTypes.array
};

export default PropertyValue;
