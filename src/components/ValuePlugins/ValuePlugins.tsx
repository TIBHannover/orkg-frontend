import { isEqual, isString } from 'lodash';
import { FC, isValidElement, memo, ReactNode } from 'react';
import { renderToString } from 'react-dom/server';

import Boolean, { isBooleanValue } from '@/components/ValuePlugins/Boolean/Boolean';
import Code, { isCodeValue } from '@/components/ValuePlugins/Code/Code';
import Doi, { isDoiValue } from '@/components/ValuePlugins/Doi/Doi';
import Duration, { isDurationValue } from '@/components/ValuePlugins/Duration/Duration';
import Gregorian, { isGregorianValue } from '@/components/ValuePlugins/Gregorian/Gregorian';
import ImageAsFigure, { isImageValue } from '@/components/ValuePlugins/Images/ImageAsFigures';
import Link, { isLinkValue } from '@/components/ValuePlugins/Link/Link';
import Map, { isMapValue } from '@/components/ValuePlugins/Map/Map';
import MathJax, { isMathJaxValue } from '@/components/ValuePlugins/MathJax/MathJax';
import Video, { isVideoValue } from '@/components/ValuePlugins/Video/Video';
import { ENTITIES } from '@/constants/graphSettings';
import { EntityType } from '@/services/backend/types';

type ValuePluginsProps = {
    children: ReactNode;
    type: EntityType;
    options?: { isModal?: boolean };
    datatype?: string;
};

const ValuePlugins: FC<ValuePluginsProps> = ({ options = {}, type, children, datatype }) => {
    if (!children) {
        return '';
    }
    let text = '';

    if (isString(children)) {
        text = children;
    } else if (isValidElement(children)) {
        text = renderToString(children);
    }
    if (!text) {
        return '';
    }
    if (isMapValue(text) && (type === ENTITIES.LITERAL || type === ENTITIES.RESOURCE)) {
        return <Map text={text} />;
    }
    if (type === ENTITIES.LITERAL) {
        if (isDurationValue({ text, datatype })) {
            return <Duration text={text} datatype={datatype} />;
        }
        if (isGregorianValue({ text, datatype })) {
            return <Gregorian text={text} datatype={datatype} />;
        }
        if (isBooleanValue(text)) {
            return <Boolean text={text} />;
        }
        if (isMathJaxValue(text)) {
            return <MathJax text={text} />;
        }
        if (isDoiValue(text)) {
            return <Doi text={text} />;
        }

        if (isVideoValue(text)) {
            return <Video text={text} options={options} />;
        }
        if (isCodeValue(text)) {
            return <Code text={text} />;
        }
        if (isImageValue(text)) {
            return <ImageAsFigure text={text} />;
        }
        if (isLinkValue(text)) {
            return <Link text={text} />;
        }
    }
    return children;
};
export default memo(ValuePlugins, isEqual);
