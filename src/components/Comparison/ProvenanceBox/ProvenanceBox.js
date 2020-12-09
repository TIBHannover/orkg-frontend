import React, { useState } from 'react';
import { Row, Card, CardBody, CardTitle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { isEmpty } from 'lodash';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';

const StyledOrganizationCard = styled.div`
    border: 0;
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

function ProvenanceBox(props) {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const user = useSelector(state => state.auth.user);
    return (
        <div className="container box rounded-lg mt-4">
            <Row>
                <div className="col-8 d-flex align-items-center ">
                    <div className="pt-4 pb-4 pl-4 pr-4">
                        {props.provenance && (
                            <>
                                <p>
                                    Observatory:{' '}
                                    {!!user && user.isCurationAllowed && (
                                        <Button size="sm" onClick={() => setShowAssignObservatory(true)} color="link">
                                            <Icon icon={faPen} /> Edit
                                        </Button>
                                    )}
                                </p>
                                <h4 className="mb-3">
                                    <Link to={reverse(ROUTES.OBSERVATORY, { id: props.provenance.id })}>{props.provenance.name}</Link>
                                </h4>
                            </>
                        )}
                        {props.creator && props.creator.id && (
                            <>
                                <i>Added by</i>
                                <br />
                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: props.creator.id })}>{props.creator.display_name}</Link>
                            </>
                        )}
                        <br /> <br />
                        {isEmpty(props.provenance) && !!user && user.isCurationAllowed && (
                            <Button size="sm" outline onClick={() => setShowAssignObservatory(true)}>
                                Assign to observatory
                            </Button>
                        )}
                    </div>
                </div>
                {props.provenance && props.provenance.organization && (
                    <div className="col-4">
                        <div className={!props.provenance.organization.logo ? 'm-4' : ''}>
                            {props.provenance.organization.logo && (
                                <StyledOrganizationCard className="card h-100">
                                    <Link className="logoContainer" to={reverse(ROUTES.ORGANIZATION, { id: props.provenance.organization.id })}>
                                        <img
                                            className="mx-auto p-2"
                                            src={props.provenance.organization.logo}
                                            alt={`${props.provenance.organization.name} logo`}
                                        />
                                    </Link>
                                </StyledOrganizationCard>
                            )}
                            {!props.provenance.organization.logo && (
                                <Card className="h-100">
                                    <CardBody className="d-flex">
                                        <CardTitle className="align-self-center text-center flex-grow-1">
                                            <Link to={reverse(ROUTES.ORGANIZATION, { id: props.provenance.organization.id })}>
                                                {props.provenance.organization.name}
                                            </Link>
                                        </CardTitle>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </div>
                )}

                <ObservatoryModal
                    callBack={props.changeObservatory}
                    showDialog={showAssignObservatory}
                    resourceId={props.resourceId}
                    toggle={() => setShowAssignObservatory(v => !v)}
                />
            </Row>
        </div>
    );
}

ProvenanceBox.propTypes = {
    provenance: PropTypes.object,
    creator: PropTypes.object,
    changeObservatory: PropTypes.func,
    resourceId: PropTypes.string
};

export default ProvenanceBox;
