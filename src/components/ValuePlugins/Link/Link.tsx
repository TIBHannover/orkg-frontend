import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import REGEX from 'constants/regex';
import Linkify from 'linkify-react';
import * as linkify from 'linkifyjs';
import { FC } from 'react';

export const isLinkValue = (text: string) => {
    const excludeMatch =
        text.match(new RegExp(REGEX.TIB_URL)) ||
        text.match(new RegExp(REGEX.YOUTUBE_URL)) ||
        text.match(new RegExp(REGEX.DAILYMOTION_URL)) ||
        text.match(new RegExp(REGEX.VIMEO_URL)) ||
        text.match(new RegExp(REGEX.GITHUB_CODE_URL)) ||
        text.match(new RegExp(REGEX.TIB_CODE_URL)) ||
        text.match(new RegExp(REGEX.IMAGE_URL));
    return linkify.find(text) && !excludeMatch;
};

type LinkProps = {
    text: string;
};

const Link: FC<LinkProps> = ({ text }) => {
    if (isLinkValue(text)) {
        return (
            <Linkify
                options={{
                    render: ({ attributes: { href, ...otherProps }, content }) => (
                        <a href={href} {...otherProps} target="_blank" rel="noopener noreferrer">
                            {content} <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </a>
                    ),
                    validate: {
                        // ensure only URLs starting with http(s) are matched
                        url: (value) => /^https?:\/\//.test(value),
                    },
                }}
            >
                {text}
            </Linkify>
        );
    }
    return text;
};

export default Link;
