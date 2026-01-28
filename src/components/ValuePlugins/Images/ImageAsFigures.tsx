import { FC } from 'react';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import REGEX from '@/constants/regex';

const ImageContainer = styled.div`
    position: relative;
`;

const Image = styled.img`
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    border: 0;
`;

export const isImageValue = (text: string) => text.match(new RegExp(REGEX.IMAGE_URL));

const isWhitelistedDomain = (text: string) => text.match(new RegExp(REGEX.RAW_GITHUB_URL)) || text.match(new RegExp(REGEX.ZENODO_URL));

type ImageAsFigureProps = {
    text: string;
};

const ImageAsFigure: FC<ImageAsFigureProps> = ({ text }) => {
    if (isImageValue(text)) {
        return (
            <ImageContainer>
                <a href={text.indexOf('://') === -1 ? `https://${text}` : text} target="_blank" rel="noopener noreferrer">
                    {isWhitelistedDomain(text) ? (
                        <Image alt="preview of image" src={text.indexOf('://') === -1 ? `https://${text}` : text} />
                    ) : (
                        <Tooltip content="Images from this domain can't be displayed">
                            <span>{text}</span>
                        </Tooltip>
                    )}
                </a>
            </ImageContainer>
        );
    }
    return text;
};

export default ImageAsFigure;
