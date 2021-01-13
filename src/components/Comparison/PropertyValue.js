import Tippy from '@tippy.js/react';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { upperFirst } from 'lodash';
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
            <ConditionalWrapper
                condition={similar && similar.length}
                wrapper={children => (
                    <Tippy content={`This property is merged with : ${similar.join(', ')}`} arrow={true}>
                        <span>{children}*</span>
                    </Tippy>
                )}
            >
                <Button onClick={handleOpenStatementBrowser} color="link" className="text-light m-0 p-0">
                    {upperFirst(label)}
                </Button>
            </ConditionalWrapper>

            {showStatementBrowser && (
                <StatementBrowserDialog show={true} type="property" toggleModal={() => setShowStatementBrowser(v => !v)} id={id} label={label} />
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
