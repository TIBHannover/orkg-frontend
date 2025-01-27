import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import REGEX from 'constants/regex';
import { FC } from 'react';

const supportedValues = new RegExp(REGEX.DOI_ID);

export const isDoiValue = (text: string) => {
    return text.trim().match(supportedValues);
};

type DoiProps = {
    text: string;
};

const Doi: FC<DoiProps> = ({ text }) => {
    if (isDoiValue(text)) {
        return (
            <a href={`https://doi.org/${text}`} target="_blank" rel="noopener noreferrer">
                {text} <FontAwesomeIcon icon={faExternalLinkAlt} />
            </a>
        );
    }
    return text;
};

export default Doi;
