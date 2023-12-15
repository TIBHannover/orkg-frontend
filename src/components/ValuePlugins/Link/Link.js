import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';
import ReactStringReplace from 'react-string-replace';

const Link = props => {
    const expression =
        /(https?:\/\/(?:www\.?|(?!www))[a-zA-Z0-9-][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
    const supportedValues = new RegExp(expression);

    const doesMatch = label => {
        const excludeMatch =
            label.match(new RegExp(REGEX.TIB_URL)) ||
            label.match(new RegExp(REGEX.YOUTUBE_URL)) ||
            label.match(new RegExp(REGEX.DAILYMOTION_URL)) ||
            label.match(new RegExp(REGEX.VIMEO_URL)) ||
            label.match(new RegExp(REGEX.GITHUB_CODE_URL)) ||
            label.match(new RegExp(REGEX.TIB_CODE_URL)) ||
            label.match(new RegExp(REGEX.IMAGE_URL));
        return label.match(supportedValues) && !excludeMatch;
    };

    const label = props.children;
    const labelToText = renderToString(label);

    if (!labelToText) {
        return '';
    }

    if (props.type === ENTITIES.LITERAL && doesMatch(labelToText)) {
        return ReactStringReplace(labelToText, supportedValues, (match, i) => (
            <a key={i} href={match.indexOf('://') === -1 ? `http://${match}` : match} target="_blank" rel="noopener noreferrer">
                {match} <Icon icon={faExternalLinkAlt} />
            </a>
        ));
    }
    return label;
};

Link.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default Link;
