import { Alert, AlertProps } from '@heroui/react';
import dayjs from 'dayjs';
import useSWR from 'swr';

import { parseMarkdown } from '@/lib/markdown';
import { getHomeAlerts, url as cmsUrl } from '@/services/cms';

const mapColorToStatus = (color?: string): AlertProps['status'] => {
    switch (color?.toLowerCase()) {
        case 'accent':
            return 'accent';
        case 'success':
            return 'success';
        case 'warning':
            return 'warning';
        case 'danger':
            return 'danger';
        default:
            return 'default';
    }
};

const HomeAlerts = () => {
    const { data: _alerts } = useSWR([cmsUrl, 'getHomeAlerts'], ([_]) => getHomeAlerts());

    const alerts = _alerts?.data ?? [];

    if (alerts.length === 0) {
        return null;
    }

    return alerts.map((alert) =>
        !alert.attributes?.hideAfterDate || dayjs() < dayjs(alert.attributes?.hideAfterDate) ? (
            <Alert key={alert.id} status={mapColorToStatus(alert.attributes?.color)} className="prose my-2 relative [&_p]:m-0">
                <Alert.Indicator />
                <Alert.Content>
                    <Alert.Description>
                        <div dangerouslySetInnerHTML={{ __html: parseMarkdown(alert.attributes?.message ?? '') }} />
                    </Alert.Description>
                </Alert.Content>
            </Alert>
        ) : null,
    );
};

export default HomeAlerts;
