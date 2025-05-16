import { faAngleDoubleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CSSTransition } from 'react-transition-group';
import { Alert, Button, FormGroup, Input, InputGroup, Label, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled from 'styled-components';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import useTemplates from '@/components/ContributionEditor/TableCellForm/hooks/useTemplates';
import SearchFieldSelector from '@/components/ContributionEditor/TemplatesModal/SearchFieldSelector/SearchFieldSelector';
import TemplateButton from '@/components/ContributionEditor/TemplatesModal/TemplateButton/TemplateButton';
import ResearchFieldSelectorModal from '@/components/ResearchFieldSelector/ResearchFieldSelectorModal';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import { setIsTemplateModalOpen } from '@/slices/contributionEditorSlice';

const AnimationContainer = styled(CSSTransition)`
    &.zoom-enter {
        opacity: 0;
        transform: scale(0.9);
    }
    &.zoom-enter-active {
        opacity: 1;
        transform: translateX(0);
        transition: opacity 300ms, transform 300ms;
    }
    &.zoom-exit {
        opacity: 1;
    }
    &.zoom-exit-active {
        opacity: 0;
        transform: scale(0.9);
        transition: opacity 300ms, transform 300ms;
    }
`;

const TemplatesModal = ({ isTemplatesModalOpen: isTemplatesModalOpenProp, setIsTemplatesModalOpen = undefined }) => {
    const isTemplatesModalOpen = useSelector((state) => isTemplatesModalOpenProp ?? state.contributionEditor.isTemplatesModalOpen);
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);
    const onlyFeatured = true;
    const {
        filterOptions,
        templates,
        featuredTemplates,
        usedTemplates,
        isLoadingFeatured,
        isNextPageLoading,
        hasNextPage,
        labelFilter,
        targetFilter,
        selectedFilter,
        handleTargetFilterChange,
        handleSelectedFilterChange,
        handleLabelFilterChange,
        loadMoreTemplates,
    } = useTemplates({ onlyFeatured, isContributionEditor: true });

    const dispatch = useDispatch();

    const handleSelectField = ({ id, label }) => {
        handleTargetFilterChange({
            id,
            label,
        });
    };

    return (
        <Modal
            size="lg"
            isOpen={isTemplatesModalOpen}
            toggle={() => setIsTemplatesModalOpen?.(!isTemplatesModalOpen) ?? dispatch(setIsTemplateModalOpen({ isOpen: !isTemplatesModalOpen }))}
        >
            <ModalHeader
                toggle={() => setIsTemplatesModalOpen?.(!isTemplatesModalOpen) ?? dispatch(setIsTemplateModalOpen({ isOpen: !isTemplatesModalOpen }))}
            >
                Template gallery
            </ModalHeader>
            <ModalBody>
                <div className="clearfix">
                    <AnimationContainer in={usedTemplates?.length > 0} timeout={600} classNames="zoom" unmountOnExit>
                        <div>
                            <p>Used templates:</p>
                            {usedTemplates?.map((template) => (
                                <TemplateButton
                                    addMode={false}
                                    key={`tr${template.id}`}
                                    id={template.id}
                                    label={template.label}
                                    classId={template.target_class.id}
                                />
                            ))}
                            <hr />
                        </div>
                    </AnimationContainer>
                    <FormGroup>
                        <Label for="labelFilter">Browse templates</Label>
                        <InputGroup>
                            <div className="col-3 m-0 p-0">
                                <SearchFieldSelector options={filterOptions} value={selectedFilter} setValue={handleSelectedFilterChange} />
                            </div>
                            {selectedFilter.id === CLASSES.NODE_SHAPE && (
                                <Input
                                    placeholder="Search template by label"
                                    value={labelFilter}
                                    type="text"
                                    name="labelFilter"
                                    onChange={handleLabelFilterChange}
                                    maxLength={MAX_LENGTH_INPUT}
                                />
                            )}
                            {selectedFilter.id !== CLASSES.NODE_SHAPE && (
                                <ConditionalWrapper
                                    condition={selectedFilter.id === CLASSES.RESEARCH_FIELD}
                                    wrapper={(children) => (
                                        <>
                                            {children}

                                            <Button color="secondary" onClick={() => setIsOpenResearchFieldModal(true)}>
                                                Choose
                                            </Button>

                                            {isOpenResearchFieldModal && (
                                                <ResearchFieldSelectorModal
                                                    isOpen
                                                    toggle={(v) => setIsOpenResearchFieldModal((v) => !v)}
                                                    onSelectField={handleSelectField}
                                                />
                                            )}
                                        </>
                                    )}
                                >
                                    <Autocomplete
                                        entityType={selectedFilter.entityType}
                                        includeClasses={selectedFilter.entityType === ENTITIES.RESOURCE ? [selectedFilter.id] : []}
                                        placeholder={selectedFilter.placeholder}
                                        onChange={(i, { action }) => {
                                            if (action === 'select-option') {
                                                handleTargetFilterChange({ ...i, label: i.label });
                                            } else if (action === 'clear') {
                                                handleTargetFilterChange(null);
                                            }
                                        }}
                                        value={targetFilter}
                                        key={selectedFilter.id}
                                        openMenuOnFocus={false}
                                        enableExternalSources={false}
                                        cacheOptions={false}
                                        inputId={selectedFilter.id}
                                        isClearable
                                    />
                                </ConditionalWrapper>
                            )}
                        </InputGroup>
                    </FormGroup>

                    {!isNextPageLoading && (targetFilter || labelFilter) && templates.length === 0 && (
                        <Alert color="info">
                            No templates
                            {(labelFilter || targetFilter) && ' match this filter'}.
                        </Alert>
                    )}

                    {(templates.length > 0 || (featuredTemplates.length > 0 && !labelFilter && !targetFilter)) && (
                        <Alert color="info">
                            Choose a template to use it in <b>all contributions</b>.
                            <br />
                            <small>
                                Clicking on one of the templates will add it to <b>all contributions</b>
                            </small>
                        </Alert>
                    )}

                    {!isNextPageLoading && !targetFilter && !labelFilter && templates.length === 0 && featuredTemplates.length === 0 && (
                        <Alert color="info">
                            Use the template browser below to find a suitable template for <b>all contributions</b>.
                            <br />
                            <small>You can search by label or filter by research field, research problem or class.</small>
                        </Alert>
                    )}

                    {!labelFilter && !targetFilter && featuredTemplates?.length > 0 && (
                        <FormGroup>
                            <p>Featured templates:</p>
                            <div>
                                {featuredTemplates?.map((template) => (
                                    <TemplateButton key={`t${template.id}`} id={template.id} label={template.label} />
                                ))}
                            </div>
                        </FormGroup>
                    )}

                    {(isLoadingFeatured || isNextPageLoading) && templates.length === 0 && (
                        <ContentLoader height="100%" width="100%" viewBox="0 0 100 5" style={{ width: '100% !important' }} speed={2}>
                            <rect x="0" y="0" rx="1" ry="1" width="10" height="3" />
                            <rect x="12" y="0" rx="1" ry="1" width="10" height="3" />
                            <rect x="24" y="0" rx="1" ry="1" width="10" height="3" />
                            <rect x="36" y="0" rx="1" ry="1" width="10" height="3" />
                        </ContentLoader>
                    )}

                    {templates?.length > 0 && (
                        <FormGroup>
                            {labelFilter === '' && !targetFilter && !onlyFeatured && featuredTemplates.length > 0 && <p>Other templates:</p>}
                            {targetFilter && (
                                <p>
                                    Templates for <i>{targetFilter.label}</i> {selectedFilter.label}:
                                </p>
                            )}
                            <div>
                                {templates?.map((template) => (
                                    <TemplateButton key={`t${template.id}`} id={template.id} label={template.label} />
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
                            <FontAwesomeIcon icon={faAngleDoubleDown} /> Load more templates
                        </ListGroupItem>
                    )}

                    {isNextPageLoading && hasNextPage && (
                        <ListGroupItem className="action text-center rounded p-1">
                            <FontAwesomeIcon icon={faSpinner} spin /> Loading...
                        </ListGroupItem>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
};

TemplatesModal.propTypes = {
    isTemplatesModalOpen: PropTypes.bool,
    setIsTemplatesModalOpen: PropTypes.func,
};

export default TemplatesModal;
