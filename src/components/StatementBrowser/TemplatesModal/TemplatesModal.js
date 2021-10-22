import { FormGroup, Modal, ModalHeader, ModalBody, Label, Input, ListGroupItem, Alert, InputGroup } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setIsTemplateModalOpen } from 'actions/statementBrowser';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ContentLoader from 'react-content-loader';
import Tippy, { useSingleton } from '@tippyjs/react';
import AddTemplateButton from 'components/StatementBrowser/AddTemplateButton/AddTemplateButton';
import SearchFieldSelector from 'components/StatementBrowser/TemplatesModal/SearchFieldSelector/SearchFieldSelector';
import useTemplates from './hooks/useTemplates';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { CLASSES, ENTITIES } from 'constants/graphSettings';

const TemplatesModal = props => {
    const [source, target] = useSingleton();
    const isTemplatesModalOpen = useSelector(state => state.statementBrowser.isTemplatesModalOpen);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const [selectedField, setSelectedField] = useState({ id: 'label', label: 'By Label' });
    const {
        templates,
        featuredTemplates,
        isLoadingFeatured,
        isNextPageLoading,
        hasNextPage,
        filterLabel,
        handleLabelFilter,
        loadMoreTemplates
    } = useTemplates({ onlyFeatured: false });
    const dispatch = useDispatch();

    return (
        <>
            <Tippy singleton={source} delay={500} />
            <Modal size="lg" isOpen={isTemplatesModalOpen} toggle={() => dispatch(setIsTemplateModalOpen({ isOpen: !isTemplatesModalOpen }))}>
                <ModalHeader toggle={() => dispatch(setIsTemplateModalOpen({ isOpen: !isTemplatesModalOpen }))}>Template gallery</ModalHeader>
                <ModalBody>
                    <div className="clearfix">
                        <FormGroup>
                            <Label for="filterLabel">Browser templates</Label>
                            <InputGroup>
                                <div className="col-3 m-0 p-0">
                                    <SearchFieldSelector value={selectedField} setValue={setSelectedField} />
                                </div>
                                {selectedField.id === 'label' && (
                                    <Input
                                        placeholder="Search template by label"
                                        value={filterLabel}
                                        type="text"
                                        name="filterLabel"
                                        onChange={handleLabelFilter}
                                    />
                                )}
                                {selectedField.id !== 'label' && (
                                    <Autocomplete
                                        entityType={ENTITIES.RESOURCE}
                                        optionsClass={selectedField.id === 'rf' ? CLASSES.RESEARCH_FIELD : CLASSES.PROBLEM}
                                        placeholder="Enter a research field"
                                        onItemSelected={i => {
                                            //setSubject({ ...i, label: i.value });
                                        }}
                                        value={null}
                                        autoLoadOption={true}
                                        openMenuOnFocus={false}
                                        allowCreate={false}
                                        inputId="research-field"
                                    />
                                )}
                            </InputGroup>
                        </FormGroup>

                        {/*!isNextPageLoading && loadingFailed && <UncontrolledAlert color="info">Failed to load templates</UncontrolledAlert>*/}
                        {(templates.length > 0 || (featuredTemplates.length > 0 && filterLabel === '')) && (
                            <Alert color="info">
                                Choose a template to use it in <b>{resource.label}</b> resource.
                                <br />
                                <small>Clicking on one of the templates will add it to the resource</small>
                            </Alert>
                        )}

                        {filterLabel === '' && featuredTemplates.length > 0 && (
                            <FormGroup>
                                <p>Featured templates:</p>
                                <div>
                                    {featuredTemplates.map(template => (
                                        <AddTemplateButton
                                            tippyTarget={target}
                                            key={`t${template.id}`}
                                            id={template.id}
                                            label={template.label}
                                            source={template.source}
                                            resourceId={selectedResource}
                                            syncBackend={props.syncBackend}
                                        />
                                    ))}
                                </div>
                            </FormGroup>
                        )}

                        {(isLoadingFeatured || isNextPageLoading) && templates.length === 0 && (
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 5"
                                style={{ width: '100% !important' }}
                                speed={2}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="1" ry="1" width="10" height="3" />
                                <rect x="12" y="0" rx="1" ry="1" width="10" height="3" />
                                <rect x="24" y="0" rx="1" ry="1" width="10" height="3" />
                                <rect x="36" y="0" rx="1" ry="1" width="10" height="3" />
                            </ContentLoader>
                        )}

                        {templates.length > 0 && (
                            <FormGroup>
                                {filterLabel === '' && featuredTemplates.length > 0 && <p>Other templates:</p>}
                                <div>
                                    {templates.map(template => (
                                        <AddTemplateButton
                                            tippyTarget={target}
                                            key={`t${template.id}`}
                                            id={template.id}
                                            label={template.label}
                                            source={template.source}
                                            resourceId={selectedResource}
                                            syncBackend={props.syncBackend}
                                        />
                                    ))}
                                </div>
                            </FormGroup>
                        )}

                        {!isNextPageLoading && hasNextPage && (
                            <ListGroupItem
                                style={{ cursor: 'pointer' }}
                                className="text-center rounded p-1"
                                action
                                onClick={!isNextPageLoading ? () => loadMoreTemplates(null, null, null, filterLabel) : undefined}
                            >
                                <Icon icon={faAngleDoubleDown} /> Load more templates
                            </ListGroupItem>
                        )}

                        {isNextPageLoading && hasNextPage && (
                            <ListGroupItem className="action text-center rounded p-1">
                                <Icon icon={faSpinner} spin /> Loading...
                            </ListGroupItem>
                        )}

                        {templates.length === 0 && !isNextPageLoading && featuredTemplates.length === 0 && (
                            <Alert color="info">
                                No templates
                                {filterLabel && ' match this filter'}.
                            </Alert>
                        )}
                    </div>
                </ModalBody>
            </Modal>
        </>
    );
};

TemplatesModal.propTypes = {
    syncBackend: PropTypes.bool.isRequired
};

export default TemplatesModal;
