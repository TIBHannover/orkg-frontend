import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ObservatoryCardStyled = styled.div`
    cursor: initial;
    .observatoryStats {
        text-align: left;
        font-size: smaller;
    }

    .orgLogo {
        margin-top: 10px;
        border: 1px;
        padding: 2px;
    }

    .observatoryName {
        font-weight: bold;
    }
    &:hover {
        .observatoryName {
            text-decoration: underline;
        }
    }
`;

function ObservatoryCard(props) {
    return (
        <ObservatoryCardStyled className="col-6 mb-4">
            {!props.observatory.logo && (
                <Card className="h-100">
                    <Link to={reverse(ROUTES.OBSERVATORY, { id: props.observatory.id })} style={{ textDecoration: 'none' }}>
                        <CardBody>
                            {props.observatory.organization_ids.map(o => (
                                <span key={o.id} style={{ marginLeft: '10px' }}>
                                    <img
                                        className="justify-content-center orgLogo"
                                        key={`imageLogo${o.id}`}
                                        height="45px"
                                        src={o.logo}
                                        alt={`${o.name} logo`}
                                    />
                                </span>
                            ))}{' '}
                            <div className="mt-2">
                                <div className="observatoryName">{props.observatory.name}</div>

                                <div className="observatoryStats text-muted">
                                    Papers: <b>{props.observatory.numPapers}</b> <br />
                                    Comparisons: <b>{props.observatory.numComparisons}</b>
                                </div>
                            </div>
                        </CardBody>
                    </Link>
                </Card>
            )}
        </ObservatoryCardStyled>
    );
}

ObservatoryCard.propTypes = {
    observatory: PropTypes.object.isRequired
};

export default ObservatoryCard;
