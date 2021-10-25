import { useState } from 'react';
import { Button, FormGroup, Modal, ModalHeader, ModalBody, Label, Input, ListGroupItem, Alert, InputGroup, InputGroupAddon } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import ResearchFieldSelectorModal from 'components/ResearchFieldSelector/ResearchFieldSelectorModal';
import { setIsTemplateModalOpen } from 'actions/statementBrowser';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDoubleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ContentLoader from 'react-content-loader';
import Tippy, { useSingleton } from '@tippyjs/react';
import AddTemplateButton from 'components/StatementBrowser/AddTemplateButton/AddTemplateButton';
import SearchFieldSelector from 'components/StatementBrowser/TemplatesModal/SearchFieldSelector/SearchFieldSelector';
import useTemplates from './hooks/useTemplates';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';

const TemplatesModal = props => {
    const [source, target] = useSingleton();
    const isTemplatesModalOpen = useSelector(state => state.statementBrowser.isTemplatesModalOpen);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);
    const {
        filterOptions,
        templates,
        featuredTemplates,
        isLoadingFeatured,
        isNextPageLoading,
        hasNextPage,
        labelFilter,
        targetFilter,
        selectedFilter,
        handleTargetFilterChange,
        handleSelectedFilterChange,
        handleLabelFilterChange,
        loadMoreTemplates
    } = useTemplates({ onlyFeatured: false });

    const dispatch = useDispatch();

    const handleSelectField = ({ id, label }) => {
        handleTargetFilterChange({
            id,
            label
        });
    };

    return (
        <>
            <Tippy singleton={source} delay={500} />
            <Modal size="lg" isOpen={isTemplatesModalOpen} toggle={() => dispatch(setIsTemplateModalOpen({ isOpen: !isTemplatesModalOpen }))}>
                <ModalHeader toggle={() => dispatch(setIsTemplateModalOpen({ isOpen: !isTemplatesModalOpen }))}>Template gallery</ModalHeader>
                <ModalBody>
                    <div className="clearfix">
                        <FormGroup>
                            <Label for="labelFilter">Browse templates</Label>
                            <InputGroup>
                                <div className="col-3 m-0 p-0">
                                    <SearchFieldSelector options={filterOptions} value={selectedFilter} setValue={handleSelectedFilterChange} />
                                </div>
                                {selectedFilter.id === CLASSES.TEMPLATE && (
                                    <Input
                                        placeholder="Search template by label"
                                        value={labelFilter}
                                        type="text"
                                        name="labelFilter"
                                        onChange={handleLabelFilterChange}
                                    />
                                )}
                                {selectedFilter.id !== CLASSES.TEMPLATE && (
                                    <ConditionalWrapper
                                        condition={selectedFilter.id === CLASSES.RESEARCH_FIELD}
                                        wrapper={children => (
                                            <>
                                                {children}
                                                <InputGroupAddon addonType="append">
                                                    <Button color="secondary" onClick={() => setIsOpenResearchFieldModal(true)}>
                                                        Choose
                                                    </Button>
                                                </InputGroupAddon>

                                                {isOpenResearchFieldModal && (
                                                    <ResearchFieldSelectorModal
                                                        isOpen
                                                        toggle={v => setIsOpenResearchFieldModal(v => !v)}
                                                        onSelectField={handleSelectField}
                                                    />
                                                )}
                                            </>
                                        )}
                                    >
                                        <Autocomplete
                                            entityType={selectedFilter.entityType}
                                            optionsClass={selectedFilter.entityType === ENTITIES.RESOURCE ? selectedFilter.id : undefined}
                                            placeholder={selectedFilter.placeholder}
                                            onItemSelected={i => {
                                                handleTargetFilterChange({ ...i, label: i.value });
                                            }}
                                            value={targetFilter}
                                            key={selectedFilter.id}
                                            autoLoadOption={true}
                                            openMenuOnFocus={false}
                                            allowCreate={false}
                                            cacheOptions={false}
                                            inputId={selectedFilter.id}
                                        />
                                    </ConditionalWrapper>
                                )}
                            </InputGroup>
                        </FormGroup>

                        {/*!isNextPageLoading && loadingFailed && <UncontrolledAlert color="info">Failed to load templates</UncontrolledAlert>*/}
                        {(templates.length > 0 || (featuredTemplates.length > 0 && labelFilter === '')) && (
                            <Alert color="info">
                                Choose a template to use it in <b>{resource.label}</b> resource.
                                <br />
                                <small>Clicking on one of the templates will add it to the resource</small>
                            </Alert>
                        )}

                        {labelFilter === '' && !targetFilter && featuredTemplates.length > 0 && (
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
                                {labelFilter === '' && !targetFilter && featuredTemplates.length > 0 && <p>Other templates:</p>}
                                {targetFilter && (
                                    <p>
                                        Templates for {targetFilter.label} {selectedFilter.label}:
                                    </p>
                                )}
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
                                onClick={!isNextPageLoading ? () => loadMoreTemplates(selectedFilter, targetFilter, labelFilter) : undefined}
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
                                {(labelFilter || targetFilter) && ' match this filter'}.
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
