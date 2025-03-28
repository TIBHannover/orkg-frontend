import { FC } from 'react';

import { parseDurationString } from '@/components/DataBrowser/components/Body/ValueInputField/InputField/DurationInput/helpers';

export const isDurationValue = ({ text, datatype }: { text: string; datatype?: string }) =>
    !!(datatype?.startsWith('xsd:') && datatype?.toLowerCase().includes('duration') && parseDurationString(text));

type DurationProps = {
    text: string;
    datatype?: string;
};

const Duration: FC<DurationProps> = ({ text, datatype }) => {
    const duration = parseDurationString(text);

    if (!isDurationValue({ text, datatype }) || !duration) {
        return text;
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

        return parts.length > 0 ? parts.join(', ') : text;
    };

    return <>{formatDuration()}</>;
};

export default Duration;
