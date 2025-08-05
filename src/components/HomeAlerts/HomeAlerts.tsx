import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import * as Showdown from 'showdown';
import styled from 'styled-components';

import Alert from '@/components/Ui/Alert/Alert';
import { getHomeAlerts } from '@/services/cms';
import { Alert as AlertType } from '@/services/cms/types';

const converter = new Showdown.Converter();
converter.setFlavor('github');

const AlertStyled = styled(Alert)`
    p {
        margin: 0;
    }
`;

const HomeAlerts = () => {
    const [alerts, setAlerts] = useState<AlertType[]>([]);

    useEffect(() => {
        (async () => {
            setAlerts((await getHomeAlerts())?.data || []);
        })();
    }, []);

    if (alerts.length === 0) {
        return null;
    }

    return alerts.map((alert) =>
        !alert.attributes?.hideAfterDate || dayjs() < dayjs(alert.attributes?.hideAfterDate) ? (
            <AlertStyled key={alert.id} color={alert.attributes?.color} className="box-shadow mt-2">
                <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(alert.attributes?.message) }} />
            </AlertStyled>
        ) : null,
    );
};

export default HomeAlerts;
