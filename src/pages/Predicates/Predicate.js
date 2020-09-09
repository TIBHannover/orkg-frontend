import React, { useState, useEffect } from 'react';
import { Container, Button } from 'reactstrap';
import { getPredicate } from 'network';
import StatementBrowser from 'components/StatementBrowser/Statements/StatementsContainer';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import { EditModeHeader, Title } from 'pages/ViewPaper';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

function Predicate(props) {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const findPredicate = async () => {
            setIsLoading(true);
            try {
                const responseJson = await getPredicate(props.match.params.id);
                document.title = `${responseJson.label} - Property - ORKG`;

                setLabel(responseJson.label);
                setIsLoading(false);
            } catch (err) {
                console.error(err);
                setLabel(null);
                setError(err);
                setIsLoading(false);
            }
        };
        findPredicate();
    }, [location, props.match.params.id]);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <Container className="mt-5 clearfix">
                    {editMode && (
                        <EditModeHeader className="box rounded-top">
                            <Title>
                                Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                            </Title>
                            <Button className="float-left" style={{ marginLeft: 1 }} color="light" size="sm" onClick={() => setEditMode(v => !v)}>
                                Stop editing
                            </Button>
                        </EditModeHeader>
                    )}
                    <div className={`box clearfix pt-4 pb-4 pl-5 pr-5 ${editMode ? 'rounded-bottom' : 'rounded'}`}>
                        <div className="mb-2">
                            <div className="pb-2 mb-3">
                                <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    {label || (
                                        <i>
                                            <small>No label</small>
                                        </i>
                                    )}
                                    <Button className="float-right" color="darkblue" size="sm" onClick={() => setEditMode(v => !v)}>
                                        <Icon icon={faPen} /> Edit
                                    </Button>
                                </h3>
                            </div>
                        </div>
                        <hr />
                        <h3 className="h5">Statements</h3>
                        <div className="clearfix">
                            <StatementBrowser
                                rootNodeType="predicate"
                                enableEdit={editMode}
                                syncBackend={editMode}
                                openExistingResourcesInDialog={false}
                                initialResourceId={props.match.params.id}
                                initialResourceLabel={label}
                                newStore={true}
                                propertiesAsLinks={true}
                                resourcesAsLinks={true}
                            />
                        </div>
                    </div>
                </Container>
            )}
        </>
    );
}

Predicate.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default Predicate;
