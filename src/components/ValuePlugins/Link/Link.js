import { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { renderToString } from 'react-dom/server';
import ReactStringReplace from 'react-string-replace';
class Link extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line no-useless-escape
        const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
        this.supportedValues = new RegExp(expression);
    }

    render() {
        const label = this.props.children;
        const labelToText = renderToString(label);

        if (!labelToText) {
            return '';
        }

        if (this.props.type === 'literal' && labelToText.match(this.supportedValues)) {
            return ReactStringReplace(labelToText, this.supportedValues, (match, i) => {
                return (
                    <a key={i} href={match.indexOf('://') === -1 ? 'http://' + match : match} target="_blank" rel="noopener noreferrer">
                        {match} <Icon icon={faExternalLinkAlt} />
                    </a>
                );
            });
        } else {
            return label;
        }
    }
}

Link.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal'])
};

export default Link;
