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

    .observatoryName {
        font-weight: bold;
    }
`;

function ObservatoryCard(props) {
    return (
        <ObservatoryCardStyled className="col-6 mb-4">
            {!props.observatory.logo && (
                <Card className="h-100">
                    <CardBody>
                        {props.observatory.organization_ids.map(o => (
                            <img key={`imageLogo${o.id}`} height="50px" src={o.logo} alt={`${o.name} logo`} />
                        ))}{' '}
                        <div className="mt-2">
                            <Link to={reverse(ROUTES.OBSERVATORY, { id: props.observatory.id })}>
                                <div className="observatoryName">{props.observatory.name}</div>
                            </Link>
                            <div className="observatoryStats">
                                Papers: <b>{props.observatory.numPapers}</b> <br />
                                Comparisons: <b>{props.observatory.numComparisons}</b>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </ObservatoryCardStyled>
    );
}

ObservatoryCard.propTypes = {
    observatory: PropTypes.object.isRequired
};

export default ObservatoryCard;
