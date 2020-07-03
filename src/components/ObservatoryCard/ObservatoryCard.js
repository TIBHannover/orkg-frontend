import React from 'react';
import { Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

function ObservatoryCard(props) {
    return (
        <div className="col-4 mb-3">
            {!props.observatory.logo && (
                <Card className="h-100">
                    <CardBody className="d-flex align-self-center justify-content-center" style={{ flexDirection: 'column' }}>
                        <CardTitle className="align-self-center text-muted">
                            <Link to={reverse(ROUTES.OBSERVATORY, { id: props.observatory.id })}>{props.observatory.name}</Link>
                        </CardTitle>
                        {props.observatory.organizations.length > 0 && (
                            <CardText className="align-self-center text-muted">
                                <small>Supported by: {props.observatory.organizations.map(o => o.name).join(',')}</small>
                            </CardText>
                        )}
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

ObservatoryCard.propTypes = {
    observatory: PropTypes.object.isRequired
};

export default ObservatoryCard;
