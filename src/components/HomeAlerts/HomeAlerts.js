import { orderBy } from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { Alert } from 'reactstrap';
import { getHomeAlerts } from 'services/cms';
import * as Showdown from 'showdown';
import styled from 'styled-components';

const converter = new Showdown.Converter();
converter.setFlavor('github');

const AlertStyled = styled(Alert)`
    p {
        margin: 0;
    }
`;

const HomeAlerts = () => {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const fetchAlerts = async () => {
            let _alerts = await getHomeAlerts();
            _alerts = orderBy(_alerts, 'order');
            setAlerts(_alerts);
        };
        fetchAlerts();
    }, []);

    if (alerts.length === 0) {
        return null;
    }

    return alerts.map(alert =>
        !alert.hideAfterDate || moment() < moment(alert.hideAfterDate) ? (
            <AlertStyled key={alert.id} color={alert.color} className="box mt-2">
                <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(alert.message) }} />
            </AlertStyled>
        ) : null,
    );
};

export default HomeAlerts;
