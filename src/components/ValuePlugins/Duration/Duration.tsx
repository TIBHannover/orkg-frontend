import { FC, ReactNode } from 'react';
import { EntityType } from 'services/backend/types';
import { parseDurationString } from 'components/DataBrowser/components/Body/ValueInputField/InputField/DurationInput/helpers';
import { isString } from 'lodash';
import { renderToString } from 'react-dom/server';
import { ENTITIES } from 'constants/graphSettings';

type DurationProps = {
    children: ReactNode;
    type: EntityType;
    datatype?: string;
};

const Duration: FC<DurationProps> = ({ children, type, datatype }) => {
    const childrenToText = isString(children) ? children : renderToString(<>{children}</>);
    if (type !== ENTITIES.LITERAL || !datatype?.startsWith('xsd:') || !datatype?.toLowerCase().includes('duration')) {
        return children;
    }

    const duration = parseDurationString(childrenToText);
    if (!duration) {
        return children;
    }

    const formatDuration = () => {
        const parts: string[] = [];

        if (duration.years) {
            parts.push(`${duration.years} year${duration.years === '1' ? '' : 's'}`);
        }
        if (duration.months) {
            parts.push(`${duration.months} month${duration.months === '1' ? '' : 's'}`);
        }
        if (duration.days) {
            parts.push(`${duration.days} day${duration.days === '1' ? '' : 's'}`);
        }
        if (duration.hours) {
            parts.push(`${duration.hours} hour${duration.hours === '1' ? '' : 's'}`);
        }
        if (duration.minutes) {
            parts.push(`${duration.minutes} minute${duration.minutes === '1' ? '' : 's'}`);
        }
        if (duration.seconds) {
            parts.push(`${duration.seconds} second${duration.seconds === '1' ? '' : 's'}`);
        }

        return parts.length > 0 ? parts.join(', ') : childrenToText;
    };

    return <>{formatDuration()}</>;
};

export default Duration;
