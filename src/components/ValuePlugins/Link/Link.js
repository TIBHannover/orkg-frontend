import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import Linkify from 'linkify-react';
import * as linkify from 'linkifyjs';
import PropTypes from 'prop-types';
import { renderToString } from 'react-dom/server';

const Link = (props) => {
    const doesMatch = (label) => {
        const excludeMatch =
            label.match(new RegExp(REGEX.TIB_URL)) ||
            label.match(new RegExp(REGEX.YOUTUBE_URL)) ||
            label.match(new RegExp(REGEX.DAILYMOTION_URL)) ||
            label.match(new RegExp(REGEX.VIMEO_URL)) ||
            label.match(new RegExp(REGEX.GITHUB_CODE_URL)) ||
            label.match(new RegExp(REGEX.TIB_CODE_URL)) ||
            label.match(new RegExp(REGEX.IMAGE_URL));
        return linkify.find(label) && !excludeMatch;
    };

    const label = props.children;
    const labelToText = renderToString(label);

    if (!labelToText) {
        return '';
    }

    if (props.type === ENTITIES.LITERAL && doesMatch(labelToText)) {
        return (
            <Linkify
                options={{
                    render: ({ attributes: { href, ...otherProps }, content }) => (
                        <a href={href} {...otherProps} target="_blank" rel="noopener noreferrer">
                            {content}
                        </a>
                    ),
                }}
            >
                {labelToText}
            </Linkify>
        );
    }
    return label;
};

Link.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default Link;
