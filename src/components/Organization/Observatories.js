import { useState, useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getAllObservatoriesByOrganizationId } from 'services/backend/organizations';
import ContentLoader from 'react-content-loader';
import { Link } from 'react-router-dom';
import Dotdotdot from 'react-dotdotdot';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

const Observatories = ({ organizationsId }) => {
    const [isLoadingObservatories, setIsLoadingObservatories] = useState(null);
    const [observatories, setObservatories] = useState([]);

    useEffect(() => {
        const loadObservatories = () => {
            setIsLoadingObservatories(true);
            getAllObservatoriesByOrganizationId(organizationsId)
                .then(observatories => {
                    if (observatories.length > 0) {
                        setObservatories(observatories);
                        setIsLoadingObservatories(false);
                    } else {
                        setIsLoadingObservatories(false);
                    }
                })
                .catch(error => {
                    setIsLoadingObservatories(false);
                });
        };

        loadObservatories();
    }, [organizationsId]);

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Observatories</h1>
                </div>
            </Container>
            <Container className="p-0">
                {observatories?.length > 0 && (
                    <ListGroup className="box">
                        {observatories.map((observatory, index) => {
                            return (
                                <div key={`c${index}`} className="list-group-item list-group-item-action pr-2 p-3">
                                    <div>
                                        <div>
                                            <Link to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}>{observatory.name}</Link>
                                        </div>
                                        <Dotdotdot clamp={3}>
                                            <small className="text-muted">{observatory.description}</small>
                                        </Dotdotdot>
                                    </div>
                                </div>
                            );
                        })}
                    </ListGroup>
                )}
                {observatories.length === 0 && !isLoadingObservatories && (
                    <div className="container box rounded">
                        <div className="p-5 text-center mt-4 mb-4">No Observatories</div>
                    </div>
                )}
                {isLoadingObservatories && (
                    <div className={`text-center mt-4 mb-4 p-5 container box rounded'`}>
                        <div className="text-left">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={50}
                                viewBox="0 0 400 50"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
};

Observatories.propTypes = {
    organizationsId: PropTypes.string.isRequired
};

export default Observatories;
