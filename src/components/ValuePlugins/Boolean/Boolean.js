import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import styled from 'styled-components';

const Check = styled.span`
    color: #329a0c;
    font-size: 18px;
`;

const Cross = styled.span`
    color: #f02500;
    font-size: 20px;
`;

const Boolean = props => {
    const trueValues = ['t', 'y', 'true'];
    const falseValues = ['f', 'n', 'false'];
    const supportedValues = [...trueValues, ...falseValues];

    const label = props.children;
    const labelToText = renderToString(label);

    if (!labelToText) {
        return '';
    }

    // if label value is not supported, return the regular item
    if (supportedValues.indexOf(labelToText.toLowerCase()) === -1) {
        return label;
    }

    if (trueValues.indexOf(labelToText.toLowerCase()) !== -1) {
        return (
            <Check>
                <Icon icon={faCheck} aria-label="Check mark" />
            </Check>
        );
    }
    if (falseValues.indexOf(labelToText.toLowerCase()) !== -1) {
        return (
            <Cross>
                <Icon icon={faTimes} aria-label="Cross mark" />
            </Cross>
        );
    }
    return label;
};

Boolean.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default Boolean;
