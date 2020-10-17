import React, { useState, useEffect } from 'react';
import { Container, Table, ButtonGroup, Button } from 'reactstrap';
import { getStatementsByObjectAndPredicate } from 'services/backend/statements';
import { getClassById } from 'services/backend/classes';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faFileCsv } from '@fortawesome/free-solid-svg-icons';
import ClassInstances from 'components/ClassInstances/ClassInstances';
import ImportCSVInstances from 'components/ClassInstances/ImportCSVInstances';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import InternalServerError from 'pages/InternalServerError';
import NotFound from 'pages/NotFound';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { useLocation } from 'react-router-dom';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

function ClassDetails(props) {
    const location = useLocation();
    const [error, setError] = useState(null);
    const [label, setLabel] = useState('');
    const [keyInstances, setKeyInstances] = useState(1);
    const [template, setTemplate] = useState(null);
    const [uri, setURI] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [modalImportIsOpen, setModalImportIsOpen] = useState(false);

    useEffect(() => {
        const findClass = async () => {
            setIsLoading(true);
            try {
                const responseJson = await getClassById(props.match.params.id);
                document.title = `${responseJson.label} - Class - ORKG`;
                // Get the template of the class
                getStatementsByObjectAndPredicate({
                    objectId: props.match.params.id,
                    predicateId: PREDICATES.TEMPLATE_OF_CLASS
                })
                    .then(statements =>
                        Promise.all(
                            statements.filter(statement => statement.subject.classes?.includes(CLASSES.CONTRIBUTION_TEMPLATE)).map(st => st.subject)
                        )
                    )
                    .then(templates => {
                        if (templates.length > 0) {
                            setTemplate(templates[0]);
                        } else {
                            setTemplate(null);
                        }
                    });
                setLabel(responseJson.label);
                setURI(responseJson.uri);
                setIsLoading(false);
                setError(null);
            } catch (err) {
                console.error(err);
                setLabel(null);
                setTemplate(null);
                setError(err);
                setIsLoading(false);
            }
        };
        findClass();
    }, [location, props.match.params.id]);

    return (
        <>
            {isLoading && <Container className="box rounded pt-4 pb-4 pl-5 pr-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && (
                <Container className="mt-5 clearfix">
                    <div className="box clearfix pt-4 pb-4 pl-5 pr-5 rounded">
                        <div className="mb-2">
                            <div className="pb-2 mb-3">
                                <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                    Class:{' '}
                                    {label || (
                                        <i>
                                            <small>No label</small>
                                        </i>
                                    )}
                                    <ButtonGroup className="float-right mb-4 ml-1">
                                        <RequireAuthentication
                                            component={Link}
                                            to={`${ROUTES.ADD_RESOURCE}?classes=${props.match.params.id}`}
                                            className="float-right btn btn-darkblue flex-shrink-0 btn-sm"
                                        >
                                            <Icon icon={faPlus} /> Add resource
                                        </RequireAuthentication>
                                        <RequireAuthentication
                                            component={Button}
                                            size="sm"
                                            color="darkblue"
                                            onClick={() => setModalImportIsOpen(true)}
                                        >
                                            <Icon icon={faFileCsv} /> Import Instances
                                        </RequireAuthentication>
                                    </ButtonGroup>
                                </h3>
                            </div>
                        </div>
                        <Table bordered>
                            <tbody>
                                <tr>
                                    <th scope="row">Class ID</th>
                                    <td> {props.match.params.id}</td>
                                </tr>
                                <tr>
                                    <th scope="row">Class URI</th>
                                    <td>
                                        <i>{uri && uri !== 'null' ? <a href={uri}>{uri}</a> : 'Not Defined'}</i>
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row">Template</th>
                                    <td>
                                        {template ? (
                                            <Link to={reverse(ROUTES.CONTRIBUTION_TEMPLATE, { id: template.id })}>{template.label}</Link>
                                        ) : (
                                            <i>
                                                Not Defined{' '}
                                                <Link to={`${reverse(ROUTES.CONTRIBUTION_TEMPLATE)}?classID=${props.match.params.id}`}>
                                                    Create a template
                                                </Link>
                                            </i>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                        <ClassInstances classId={props.match.params.id} key={keyInstances} />
                        <ImportCSVInstances
                            classId={props.match.params.id}
                            showDialog={modalImportIsOpen}
                            toggle={() => setModalImportIsOpen(v => !v)}
                            callBack={() => setKeyInstances(Math.random())}
                        />
                    </div>
                </Container>
            )}
        </>
    );
}

ClassDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired
};

export default ClassDetails;
