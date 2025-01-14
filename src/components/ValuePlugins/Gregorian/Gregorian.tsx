import { FC, ReactNode } from 'react';
import { EntityType } from 'services/backend/types';
import { parseGregorianString } from 'components/DataBrowser/components/Body/ValueInputField/InputField/GregorianInput/helpers';
import { isString } from 'lodash';
import { renderToString } from 'react-dom/server';
import { ENTITIES } from 'constants/graphSettings';
import { GregorianType } from 'constants/DataTypes';

type GregorianProps = {
    children: ReactNode;
    type: EntityType;
    datatype?: string;
};

const Gregorian: FC<GregorianProps> = ({ children, type, datatype }) => {
    const childrenToText = isString(children) ? children : renderToString(<>{children}</>);
    if (type !== ENTITIES.LITERAL || !datatype?.startsWith('xsd:g')) {
        return children;
    }

    const date = parseGregorianString(childrenToText, datatype.slice(4) as GregorianType);
    if (!date) {
        return children;
    }

    const formatDate = () => {
        const parts: string[] = [];

        if (date.year) {
            parts.push(date.year);
        }
        if (date.month) {
            parts.push(new Date(2000, parseInt(date.month, 10) - 1).toLocaleString('default', { month: 'long' }));
        }
        if (date.day) {
            parts.push(date.day);
        }

        return parts.join(' ');
    };

    return <>{formatDate()}</>;
};

export default Gregorian;
