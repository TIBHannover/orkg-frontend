import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';

const Doi = (props) => {
    const supportedValues = new RegExp(REGEX.DOI_ID);
    const label = props.children;
    const labelToText = renderToString(label);

    if (!labelToText) {
        return '';
    }

    if (props.type === ENTITIES.LITERAL && labelToText.trim().match(supportedValues)) {
        return (
            <a href={`https://doi.org/${labelToText}`} target="_blank" rel="noopener noreferrer">
                {labelToText} <Icon icon={faExternalLinkAlt} />
            </a>
        );
    }
    return label;
};

Doi.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default Doi;
