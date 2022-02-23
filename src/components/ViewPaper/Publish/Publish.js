import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { createResourceStatement } from 'services/backend/statements';
import { generateDOIForORKGArtefact } from 'services/backend/misc';
import { createLiteral } from 'services/backend/literals';
import Tooltip from 'components/Utils/Tooltip';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { reverse } from 'named-urls';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import styled from 'styled-components';
import { PREDICATES, CLASSES, ENTITIES } from 'constants/graphSettings';
import { getContributorsByResourceId } from 'services/backend/resources';
import env from '@beam-australia/react-env';
import { getPublicUrl } from 'utils';
import { getStatementsBySubject, getStatementsBySubjects } from 'services/backend/statements';
import { filterObjectOfStatementsByPredicateAndClass } from 'utils';

const AuthorTag = styled.div`
    background-color: #e9ecef;
    display: flex;
    margin: 0 0 4px 0;
    box-sizing: border-box;
    color: rgb(147, 147, 147);
    cursor: default;
    border-radius: 12px;
    overflow: hidden;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    &:hover {
        background-color: #ffbdad;
        color: #de350b;
    }

    .name {
        padding: 8px 10px;
        color: #495057;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
        flex: 1;
        display: flex;
    }
`;

function Publish(props) {
    const [isLoading, setIsLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [subject, setSubject] = useState('');
    //const [isLoadingContributors, setIsLoadingContributors] = useState(true);
    const [contributors, setContributors] = useState([]);
    const [globalDepth, setGlobalDepth] = useState(1);

    //const handleCreatorsChange = creators => {
    //creators = creators ? creators : [];
    //setPaperCreators(creators);
    //};

    useEffect(() => {
        const loadContributors = () => {
            //setIsLoadingContributors(true);
            console.log(props.paperId);
            getContributorsByResourceId(props.paperId)
                .then(contributors => {
                    console.log(contributors);
                    setContributors(contributors ? contributors.reverse() : []);
                    //setIsLoadingContributors(false);
                })
                .catch(error => {
                    //setIsLoadingContributors(false);
                });
        };
        setTitle(props.label);
        loadContributors();
    }, [props.label, props.paperId]);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        try {
            publishDOI(props.paperId);
        } catch (error) {
            toast.error(`Error publishing a paper : ${error.message}`);
            setIsLoading(false);
        }
    };

    const getResourceAndStatements = async (resourceId, list) => {
        const statements = await getStatementsBySubject({ id: resourceId });
        list.push(...statements);
        if (statements.length > 0) {
            //console.log(resourceId + '-' + statements.length);
            //list.push(...statements);
            for (const statement of statements) {
                console.log(statement);
                if (statement.object._class === 'resource') {
                    console.log(true);
                    await getResourceAndStatements(statement.object.id, list);
                }
            }

            return list;
        } else {
            return list;
        }
    };

    const getPaperStatements = async paperId => {
        //console.log(paperId);
        const statements = await getStatementsBySubject({ id: paperId });
        //console.log(statements);
        const result = filterObjectOfStatementsByPredicateAndClass(statements, PREDICATES.HAS_CONTRIBUTION, false, CLASSES.CONTRIBUTION);
        //console.log(result);
        const ids = result.map(stmt => stmt.id);
        //console.log(ids);
        const c = await getStatementsBySubjects({ ids: ids });
        //console.log(c);
        for (let i = 0; i < c.length; i++) {
            const ct = c[i];
            //console.log(ct);
            // for property of each contribution
            for (let j = 0; j < ct.statements.length; j++) {
                //console.log(ct.statements[j]);
                const st = await getResourceAndStatements(ct.statements[j].object.id, []);
                console.log(st);
            }
        }
    };

    const publishDOI = async paperId => {
        //if (props.paperId) {
        //await saveCreators([''], props.paperId);
        //}
        // Load ORCID of curators
        // prpend orkg in the title
        // make it no editable
        // history of paper
        getPaperStatements(paperId);
        if (title && title.trim() !== '' && description && description.trim() !== '') {
            console.log(props.paperLink.replace('https://doi.org/', ''));
            //resource_id, title, subject, related_resources, description, authors, url, type, resourceType
            generateDOIForORKGArtefact(
                paperId,
                title,
                subject ? subject.label : '',
                props.paperLink ? [props.paperLink.replace('https://doi.org/', '')] : [''],
                description,
                contributors.map(creator => ({ creator: creator.created_by.display_name, orcid: '' })),
                `${getPublicUrl()}${reverse(ROUTES.VIEW_PAPER, { resourceId: paperId })}`,
                CLASSES.PAPER,
                CLASSES.DATASET
            )
                .then(doiResponse => {
                    createLiteral(doiResponse.data.attributes.doi).then(doiLiteral => {
                        createResourceStatement(paperId, PREDICATES.HAS_DOI, doiLiteral.id);
                        props.setPaperMetaData(doiResponse.data.attributes.doi);
                        setIsLoading(false);
                        toast.success('DOI has been registered successfully');
                    });
                })
                .catch(error => {
                    toast.error(`Error publishing a DOI`);
                    setIsLoading(false);
                });
        } else {
            throw Error('Please enter a title and a description');
        }
        setIsLoading(false);
    };

    return (
        <Modal size="lg" isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Publish ORKG paper</ModalHeader>
            <ModalBody>
                <Alert color="info">
                    {props.paperId && !props.dataCiteDoi && (
                        <>
                            A published paper is made public to other users.
                            {` A DOI ${env('DATACITE_DOI_PREFIX')}/${props.paperId} 
                            will be assigned to published paper and it cannot be changed in future.`}
                        </>
                    )}
                    {props.paperId && props.dataCiteDoi && <> This paper is already published, you can find the persistent link below. </>}
                </Alert>
                {props.dataCiteDoi && (
                    <FormGroup>
                        <Label for="paper_link">Paper link</Label>
                        <InputGroup>
                            <Input
                                id="paper_link"
                                value={`${window.location.href}${reverse(ROUTES.VIEW_PAPER, { resourceId: props.paperId })}`}
                                disabled
                            />
                            <CopyToClipboard
                                text={`${window.location.href}${reverse(ROUTES.VIEW_PAPER, { resourceId: props.paperId })}`}
                                onCopy={() => {
                                    toast.dismiss();
                                    toast.success(`Paper link copied!`);
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    <Icon icon={faClipboard} />
                                </Button>
                            </CopyToClipboard>
                        </InputGroup>
                    </FormGroup>
                )}
                {props.dataCiteDoi && (
                    <FormGroup>
                        <Label for="doi_link">DOI</Label>
                        <InputGroup>
                            <Input id="doi_link" value={`https://doi.org/${props.dataCiteDoi}`} disabled />
                            <CopyToClipboard
                                text={`https://doi.org/${props.dataCiteDoi}`}
                                onCopy={() => {
                                    toast.dismiss();
                                    toast.success(`DOI link copied!`);
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    <Icon icon={faClipboard} />
                                </Button>
                            </CopyToClipboard>
                        </InputGroup>
                    </FormGroup>
                )}
                {!props.dataCiteDoi && (
                    <>
                        {' '}
                        <FormGroup>
                            <Label for="title">
                                <Tooltip message="Title of the paper">Title</Tooltip>
                            </Label>
                            <Input
                                type="text"
                                name="title"
                                value={title}
                                disabled={Boolean(props.paperId)}
                                id="title"
                                onChange={e => setTitle(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">
                                <Tooltip message="Describe the goal and what is being compared">Description</Tooltip>
                            </Label>
                            <Input
                                type="textarea"
                                name="description"
                                value={description}
                                id="description"
                                onChange={e => setDescription(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="research-field">
                                <Tooltip message="Enter a subject of the comparison">Research Field</Tooltip>
                            </Label>

                            <Autocomplete
                                entityType={ENTITIES.RESOURCE}
                                optionsClass={CLASSES.RESEARCH_FIELD}
                                placeholder="Enter a research field"
                                onItemSelected={i => {
                                    setSubject({ ...i, label: i.value });
                                }}
                                value={subject}
                                autoLoadOption={true}
                                openMenuOnFocus={false}
                                allowCreate={false}
                                inputId="research-field"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="Creator">
                                <Tooltip message="The creator or creators of ORKG paper. Enter both the first and last name">Creators</Tooltip>
                            </Label>
                            {/* {!props.dataCiteDOI && ( */}
                            {/* <AuthorsInput */}
                            {/* disabled={Boolean(contributors.length > 0)} */}
                            {/* itemLabel="creator" */}
                            {/* handler={handleCreatorsChange} */}
                            {/* value={contributors} */}
                            {/* /> */}
                            {/* )} */}
                            {!props.dataCiteDoi &&
                                props.paperId &&
                                contributors.map((creator, index) => (
                                    <AuthorTag key={`creator${index}`}>
                                        <div className="name"> {creator.created_by.display_name} </div>
                                    </AuthorTag>
                                ))}
                        </FormGroup>
                    </>
                )}

                <></>
            </ModalBody>
            {!props.dataCiteDoi && (
                <ModalFooter>
                    {!props.dataCiteDoi && (
                        <div className="text-align-center mt-2">
                            <Button color="primary" disabled={isLoading} onClick={handleSubmit}>
                                {isLoading && <span className="fa fa-spinner fa-spin" />} Publish DOI
                            </Button>
                        </div>
                    )}
                </ModalFooter>
            )}
        </Modal>
    );
}

Publish.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    paperId: PropTypes.string,
    label: PropTypes.string,
    dataCiteDoi: PropTypes.string,
    paperLink: PropTypes.string,
    setPaperMetaData: PropTypes.func.isRequired
};

export default Publish;
