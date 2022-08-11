import { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { renderToString } from 'react-dom/server';
import REGEX from 'constants/regex';

class Doi extends Component {
    constructor(props) {
        super(props);
        this.supportedValues = new RegExp(REGEX.DOI);
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        if (this.props.type === 'literal' && labelToText.trim().match(this.supportedValues)) {
            return (
                <a href={`https://doi.org/${labelToText}`} target="_blank" rel="noopener noreferrer">
                    {labelToText} <Icon icon={faExternalLinkAlt} />
                </a>
            );
        }
        return label;
    }
}

Doi.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
};

export default Doi;
