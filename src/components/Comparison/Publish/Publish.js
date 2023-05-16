import { Modal, ModalHeader, ModalBody, ModalFooter, Input, Button, Label, FormGroup, Alert, InputGroup } from 'reactstrap';
import { toast } from 'react-toastify';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import Tooltip from 'components/Utils/Tooltip';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import AuthorsInput from 'components/AuthorsInput/AuthorsInput';
import ShareCreatedContent from 'components/ShareLinkMarker/ShareCreatedContent';
import NewerVersionWarning from 'components/Comparison/HistoryModal/NewerVersionWarning';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faOrcid } from '@fortawesome/free-brands-svg-icons';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { slugify, getPublicUrl } from 'utils';
import styled from 'styled-components';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { CLASSES, ENTITIES, MISC } from 'constants/graphSettings';
import env from '@beam-australia/react-env';
import ResearchFieldSelectorModal from 'components/ResearchFieldSelector/ResearchFieldSelectorModal';
import usePublish from 'components/Comparison/hooks/usePublish';
import { CONFERENCE_REVIEW_MISC } from 'constants/organizationsTypes';
import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';

const StyledCustomInput = styled(Input)`
    margin-right: 0;
`;

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
    const {
        displayName,
        comparisonResource,
        id,
        assignDOI,
        title,
        description,
        comparisonCreators,
        researchField,
        inputValue,
        conference,
        references,
        conferencesList,
        isLoading,
        isOpenResearchFieldModal,
        setTitle,
        setDescription,
        setResearchField,
        setInputValue,
        setIsOpenResearchFieldModal,
        setAssignDOI,
        setReferences,
        setConference,
        handleSelectField,
        handleCreatorsChange,
        handleRemoveReferenceClick,
        handleReferenceChange,
        handleSubmit,
    } = usePublish();

    // if case user session expired
    if (!displayName) {
        return null;
    }
    return (
        <Modal size="lg" isOpen toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Publish comparison</ModalHeader>
            <ModalBody>
                {!id && comparisonResource.hasPreviousVersion && props.nextVersions?.length > 0 && (
                    <NewerVersionWarning
                        versions={props.nextVersions}
                        comparisonId={comparisonResource.hasPreviousVersion.id}
                        showViewHistory={false}
                    />
                )}
                <Alert color="info">
                    {!id && (
                        <>
                            A published comparison is made public to other users. The state of the comparison is saved and a persistent link is
                            created.
                        </>
                    )}
                    {id && !comparisonResource.doi && (
                        <>This comparison is already published, you can find the persistent link below, or create a DOI for this comparison.</>
                    )}
                    {id && comparisonResource.doi && <>This comparison is already published, you can find the persistent link and the DOI below.</>}
                </Alert>
                {!id && comparisonResource.hasPreviousVersion && (
                    <Alert color="info">
                        You are publishing a new version of a published comparison. The comparison you are about to publish will be marked as a new
                        version of the{' '}
                        <Link target="_blank" to={reverse(ROUTES.COMPARISON, { comparisonId: comparisonResource.hasPreviousVersion.id })}>
                            original comparison{' '}
                        </Link>
                        {comparisonResource.hasPreviousVersion.created_by !== MISC.UNKNOWN_ID && (
                            <>
                                {' created by '}
                                <UserAvatar showDisplayName={true} userId={comparisonResource.hasPreviousVersion.created_by} />
                            </>
                        )}
                    </Alert>
                )}
                {id && (
                    <FormGroup>
                        <Label for="comparison_link">Comparison link</Label>
                        <InputGroup>
                            <Input id="comparison_link" value={`${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId: id })}`} disabled />
                            <CopyToClipboard
                                text={`${getPublicUrl()}${reverse(ROUTES.COMPARISON, { comparisonId: id })}`}
                                onCopy={() => {
                                    toast.dismiss();
                                    toast.success('Comparison link copied!');
                                }}
                            >
                                <Button color="primary" className="ps-3 pe-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    <Icon icon={faClipboard} />
                                </Button>
                            </CopyToClipboard>
                        </InputGroup>
                    </FormGroup>
                )}
                {comparisonResource.doi && (
                    <FormGroup>
                        <Label for="doi_link">DOI</Label>
                        <InputGroup>
                            <Input id="doi_link" value={`https://doi.org/${comparisonResource.doi}`} disabled />
                            <CopyToClipboard
                                text={`https://doi.org/${comparisonResource.doi}`}
                                onCopy={() => {
                                    toast.dismiss();
                                    toast.success('DOI link copied!');
                                }}
                            >
                                <Button color="primary" className="ps-3 pe-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    <Icon icon={faClipboard} />
                                </Button>
                            </CopyToClipboard>
                        </InputGroup>
                    </FormGroup>
                )}
                {id && !comparisonResource.doi && !comparisonResource.anonymized && (
                    <FormGroup>
                        <div>
                            <Tooltip
                                message={`A DOI ${env('DATACITE_DOI_PREFIX')}/${id} 
                                will be assigned to published comparison and it cannot be changed in future.`}
                            >
                                <StyledCustomInput
                                    onChange={e => {
                                        setAssignDOI(e.target.checked);
                                    }}
                                    checked={assignDOI}
                                    id="switchAssignDoi"
                                    type="switch"
                                    name="customSwitch"
                                />{' '}
                                <Label for="switchAssignDoi" className="mb-0">
                                    Assign a DOI to the comparison
                                </Label>
                            </Tooltip>
                        </div>
                    </FormGroup>
                )}
                {id && (
                    <ShareCreatedContent
                        typeOfLink="comparison"
                        title={`An @orkg_org comparison on '${title}' in the area of ${
                            researchField?.label ? `%23${slugify(researchField.label)}` : ''
                        }`}
                    />
                )}
                {!comparisonResource.doi && (!id || (id && assignDOI)) && (
                    <>
                        {' '}
                        <FormGroup>
                            <Label for="title">
                                <Tooltip message="Enter the title of the comparison">Title</Tooltip>
                            </Label>
                            <Input
                                type="text"
                                name="title"
                                value={title}
                                disabled={Boolean(id)}
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
                                disabled={Boolean(id)}
                                id="description"
                                onChange={e => setDescription(e.target.value)}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="research-field">
                                <Tooltip message="Enter the research field of the comparison">Research field</Tooltip>
                            </Label>
                            <InputGroup>
                                <Autocomplete
                                    allowCreate={false}
                                    entityType={ENTITIES.RESOURCE}
                                    optionsClass={CLASSES.RESEARCH_FIELD}
                                    onItemSelected={i => {
                                        setResearchField({ ...i, label: i.value });
                                    }}
                                    placeholder="Search or choose a research field"
                                    autoFocus
                                    cacheOptions
                                    value={researchField || null}
                                    isClearable={false}
                                    onBlur={() => setInputValue('')}
                                    onChangeInputValue={e => setInputValue(e)}
                                    inputValue={inputValue}
                                    ols={false}
                                />
                                <Button color="secondary" onClick={() => setIsOpenResearchFieldModal(true)}>
                                    Choose
                                </Button>

                                {isOpenResearchFieldModal && (
                                    <ResearchFieldSelectorModal
                                        isOpen
                                        toggle={() => setIsOpenResearchFieldModal(v => !v)}
                                        onSelectField={handleSelectField}
                                    />
                                )}
                            </InputGroup>
                        </FormGroup>
                        <FormGroup>
                            <Label for="Creator">
                                <Tooltip message="The creator or creators of the comparison. Enter both the first and last name">Creators</Tooltip>
                            </Label>
                            {!comparisonResource.doi && (!id || comparisonResource?.authors?.length === 0) && (
                                <AuthorsInput
                                    disabled={Boolean(comparisonCreators.length > 0)}
                                    itemLabel="creator"
                                    handler={handleCreatorsChange}
                                    value={comparisonCreators}
                                />
                            )}
                            {!comparisonResource.doi &&
                                id &&
                                comparisonResource?.authors?.length !== 0 &&
                                comparisonResource?.authors.map((creator, index) => (
                                    <AuthorTag key={`creator${index}`}>
                                        <div className="name">
                                            {creator.label}
                                            {creator.orcid && <Icon style={{ margin: '4px' }} icon={faOrcid} />}
                                        </div>
                                    </AuthorTag>
                                ))}
                        </FormGroup>
                        {!id && (!conference || conference.metadata.review_process !== CONFERENCE_REVIEW_MISC.DOUBLE_BLIND) && (
                            <FormGroup>
                                <div>
                                    <Tooltip message="A DOI will be assigned to published comparison and it cannot be changed in future.">
                                        <StyledCustomInput
                                            onChange={e => {
                                                setAssignDOI(e.target.checked);
                                            }}
                                            checked={assignDOI}
                                            id="switchAssignDoi"
                                            type="switch"
                                            name="customSwitch"
                                            label="Assign a DOI to the comparison"
                                        />{' '}
                                        <Label for="switchAssignDoi" className="mb-0">
                                            Assign a DOI to the comparison
                                        </Label>
                                    </Tooltip>
                                </div>
                            </FormGroup>
                        )}
                        {!id /* Hide those fields because they are not part of the DOI metadata */ && (
                            <>
                                <FormGroup>
                                    <Label>
                                        <Tooltip message="Enter a reference to the data sources from which the comparison is generated">
                                            Reference (optional)
                                        </Tooltip>
                                    </Label>
                                    {references &&
                                        references.map((reference, i) => (
                                            <InputGroup className="mb-1" key={`ref${i}`}>
                                                <Input
                                                    disabled={Boolean(id)}
                                                    type="text"
                                                    name="reference"
                                                    value={reference}
                                                    onChange={e => handleReferenceChange(e, i)}
                                                    id="publish-reference"
                                                />
                                                {!id && (
                                                    <>
                                                        {references.length !== 1 && (
                                                            <Button
                                                                color="light"
                                                                onClick={() => handleRemoveReferenceClick(i)}
                                                                className="ps-3 pe-3"
                                                                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                                            >
                                                                <Icon icon={faTrash} />
                                                            </Button>
                                                        )}
                                                        {references.length - 1 === i && (
                                                            <Button
                                                                color="secondary"
                                                                onClick={() => setReferences([...references, ''])}
                                                                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                                            >
                                                                <Icon icon={faPlus} /> Add
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </InputGroup>
                                        ))}
                                </FormGroup>
                                <FormGroup>
                                    <Label for="conference">
                                        <Tooltip message="Select a conference">
                                            Conference <span className="text-muted fst-italic">(optional)</span>
                                        </Tooltip>
                                    </Label>
                                    <Select
                                        options={conferencesList}
                                        onChange={e => {
                                            setConference(e);
                                        }}
                                        getOptionValue={({ id }) => id}
                                        isSearchable={true}
                                        getOptionLabel={({ name }) => name}
                                        isClearable={true}
                                        classNamePrefix="react-select"
                                        inputId="conference"
                                        value={conference}
                                    />
                                    <SelectGlobalStyle />
                                </FormGroup>
                            </>
                        )}
                    </>
                )}
            </ModalBody>
            {((!comparisonResource.doi && !id) || (id && !comparisonResource.doi && assignDOI)) && (
                <ModalFooter>
                    {!comparisonResource.doi && !id && (
                        <div className="text-align-center mt-2">
                            <ButtonWithLoading color="primary" isLoading={isLoading} onClick={handleSubmit}>
                                Publish
                            </ButtonWithLoading>
                        </div>
                    )}
                    {id && !comparisonResource.doi && assignDOI && (
                        <div className="text-align-center mt-2">
                            <ButtonWithLoading color="primary" isLoading={isLoading} onClick={handleSubmit}>
                                Publish DOI
                            </ButtonWithLoading>
                        </div>
                    )}
                </ModalFooter>
            )}
        </Modal>
    );
}

Publish.propTypes = {
    toggle: PropTypes.func.isRequired,
    nextVersions: PropTypes.array.isRequired,
};

export default Publish;
