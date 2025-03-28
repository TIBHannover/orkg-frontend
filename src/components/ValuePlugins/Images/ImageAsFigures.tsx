import { FC } from 'react';
import styled from 'styled-components';

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

type ImageAsFigureProps = {
    text: string;
};

const ImageAsFigure: FC<ImageAsFigureProps> = ({ text }) => {
    if (isImageValue(text)) {
        return (
            <ImageContainer>
                <a href={text.indexOf('://') === -1 ? `https://${text}` : text} target="_blank" rel="noopener noreferrer">
                    <Image alt="preview of image" src={text} />
                </a>
            </ImageContainer>
        );
    }
    return text;
};

export default ImageAsFigure;
