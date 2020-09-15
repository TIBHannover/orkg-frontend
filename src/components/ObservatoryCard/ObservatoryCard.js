import React from 'react';
import { Card, CardBody, CardTitle, CardText } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

function ObservatoryCard(props) {
    return (
        <div className="col-6 mb-3">
            {!props.observatory.logo && (
                <Card className="h-100" style={{ minWidth: '175px' }}>
                    <CardBody className="d-flex align-self-center justify-content-center card-body" style={{ flexDirection: 'column' }}>
                        <CardTitle className="align-self-center text-muted">
                            <Link to={reverse(ROUTES.OBSERVATORY, { id: props.observatory.id })}>
                                <span class="badge badge-lightblue"> {props.observatory.name}</span>
                            </Link>
                        </CardTitle>
                        {props.observatory.organizations.length > 0 && (
                            <CardText className="row justify-content-center text-muted">
                                <>
                                    {props.observatory.organizations.map(o => (
                                        <img
                                            className="box rounded"
                                            style={{ marginLeft: '5px', padding: '5px', marginTop: 5 }}
                                            height="40px"
                                            src={o.logo}
                                            alt={`${o.name} logo`}
                                        />
                                    ))}{' '}
                                    <small>By: {props.observatory.organizations.map(o => o.name).join(',')}</small>
                                </>
                            </CardText>
                        )}

                        <small>
                            Papers: {props.observatory.numPapers} <br />
                            Comparisons: {props.observatory.numComparisons}
                        </small>
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
