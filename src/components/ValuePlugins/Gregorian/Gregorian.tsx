import { parseGregorianString } from 'components/DataBrowser/components/Body/ValueInputField/InputField/GregorianInput/helpers';
import { GregorianType } from 'constants/DataTypes';
import { FC } from 'react';

export const isGregorianValue = ({ text, datatype }: { text: string; datatype?: string }) =>
    datatype?.startsWith('xsd:g') && parseGregorianString(text, datatype.slice(4) as GregorianType);

type GregorianProps = {
    text: string;
    datatype?: string;
};

const Gregorian: FC<GregorianProps> = ({ text, datatype }) => {
    if (!datatype) {
        return text;
    }
    const date = parseGregorianString(text, datatype.slice(4) as GregorianType);
    if (!isGregorianValue({ text, datatype }) || !date) {
        return text;
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
