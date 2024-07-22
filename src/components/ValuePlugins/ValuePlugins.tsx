import Boolean from 'components/ValuePlugins/Boolean/Boolean';
import Code from 'components/ValuePlugins/Code/Code';
import Doi from 'components/ValuePlugins/Doi/Doi';
import ImageAsFigure from 'components/ValuePlugins/Images/ImagesAsFigures';
import Link from 'components/ValuePlugins/Link/Link';
import MathJax from 'components/ValuePlugins/MathJax/MathJax';
import Map from 'components/ValuePlugins/Map/Map';
import Video from 'components/ValuePlugins/Video/Video';
import React, { ReactNode } from 'react';
import { EntityType } from 'services/backend/types';

type ValuePluginsProps = {
    children: ReactNode;
    type: EntityType;
    options?: { isModal?: boolean };
};

const ValuePlugins: React.FC<ValuePluginsProps> = ({ options = {}, type, children }) => (
    <Boolean>
        <MathJax type={type}>
            <Doi type={type}>
                <Map type={type}>
                    <Video type={type} options={options}>
                        <Code type={type}>
                            <ImageAsFigure type={type}>
                                <Link type={type}>{children}</Link>
                            </ImageAsFigure>
                        </Code>
                    </Video>
                </Map>
            </Doi>
        </MathJax>
    </Boolean>
);

export default ValuePlugins;
