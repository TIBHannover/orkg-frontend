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
        (async () => {
            setAlerts((await getHomeAlerts()).data);
        })();
    }, []);

    if (alerts.length === 0) {
        return null;
    }

    return alerts.map(alert =>
        !alert.attributes?.hideAfterDate || moment() < moment(alert.attributes?.hideAfterDate) ? (
            <AlertStyled key={alert.id} color={alert.attributes?.color} className="box mt-2">
                <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(alert.attributes?.message) }} />
            </AlertStyled>
        ) : null,
    );
};

export default HomeAlerts;
