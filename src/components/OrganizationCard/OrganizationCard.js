import React from 'react';
import { Card, CardBody, CardTitle } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const StyledOrganizationCard = styled.div`
    .logoContainer {
        padding: 1rem;
        position: relative;
        display: block;
        &::before {
            // for aspect ratio
            content: '';
            display: block;
            padding-bottom: 150px;
        }
        img {
            position: absolute;
            max-width: 100%;
            max-height: 150px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        &:active,
        &:focus {
            outline: 0;
            border: none;
            -moz-outline-style: none;
        }
    }
`;
function OrganizationCard(props) {
    return (
        <div className="col-4 mb-3">
            {props.organization.logo && (
                <StyledOrganizationCard className="card h-100">
                    <Link className="logoContainer" to={reverse(ROUTES.ORGANIZATION, { id: props.organization.id })}>
                        <img className="mx-auto p-2" src={props.organization.logo} alt={`${props.organization.name} logo`} />
                    </Link>
                    <CardBody>
                        <CardTitle>
                            <Link to={reverse(ROUTES.ORGANIZATION, { id: props.organization.id })}>{props.organization.name}</Link>
                        </CardTitle>
                    </CardBody>
                </StyledOrganizationCard>
            )}
            {!props.organization.logo && (
                <Card className="h-100">
                    <CardBody className="d-flex">
                        <CardTitle className="align-self-center text-center flex-grow-1">
                            <Link to={reverse(ROUTES.ORGANIZATION, { id: props.organization.id })}>{props.organization.name}</Link>
                        </CardTitle>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

OrganizationCard.propTypes = {
    organization: PropTypes.object.isRequired
};

export default OrganizationCard;
