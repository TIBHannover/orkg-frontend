import { faAngleDoubleDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy, { useSingleton } from '@tippyjs/react';
import TemplateButton from 'components/DataBrowser/components/TemplatesModal/TemplateButton/TemplateButton';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useFeaturedTemplates from 'components/DataBrowser/hooks/useFeaturedTemplates';
import useRecommendedTemplates from 'components/DataBrowser/hooks/useRecommendedTemplates';
import useTemplates from 'components/DataBrowser/hooks/useTemplates';
import TemplatesFilters from 'components/Templates/TemplatesFilters/TemplatesFilters';
import useTemplateGallery from 'components/Templates/TemplatesFilters/useTemplateGallery';
import Tooltip from 'components/Utils/Tooltip';
import { CLASSES } from 'constants/graphSettings';
import pluralize from 'pluralize';
import { FC } from 'react';
import { CSSTransition } from 'react-transition-group';
import { Alert, Button, ListGroupItem, Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled from 'styled-components';

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

const FiltersWrapperStyled = styled.div`
    background: ${(props) => props.theme.light};
`;

type TemplatesModalProps = {
    isOpen: boolean;
    toggle: () => void;
};

const TemplatesModal: FC<TemplatesModalProps> = ({ isOpen, toggle }) => {
    const {
        key,
        data,
        isLoadingTemplates,
        totalElements,
        isLastPageReached,
        hasNextPage,
        size,
        setSize,
        handleLoadMore,
        isFilterApplied,
        resetFilters,
    } = useTemplateGallery({ pageSize: 15 });

    const { featuredTemplates } = useFeaturedTemplates();
    const { recommendedTemplates } = useRecommendedTemplates();

    const [source, target] = useSingleton();

    const { entity } = useEntity();
    const { templates: _usedTemplates } = useTemplates();
    // Filter out resource templates
    const usedTemplates = _usedTemplates?.filter((t) => t.target_class.id !== CLASSES.RESOURCE);

    return (
        <div>
            <Tippy singleton={source} delay={500} />
            <Modal
                size="xl"
                isOpen={isOpen}
                toggle={toggle}
                onClosed={() => {
                    // reset the page size to the default value for the next time the modal is opened with just one page loaded
                    setSize(1);
                }}
            >
                <ModalHeader toggle={toggle}>Template gallery</ModalHeader>
                <ModalBody>
                    <div className="clearfix">
                        <AnimationContainer in={usedTemplates?.length > 0} timeout={600} classNames="zoom" unmountOnExit>
                            <div>
                                <p>Applied {pluralize('template', usedTemplates?.length ?? 0, false)}:</p>
                                {usedTemplates?.map((template) => (
                                    <TemplateButton template={template} key={`tr${template.id}`} />
                                ))}
                            </div>
                        </AnimationContainer>
                        {usedTemplates?.length === 0 && (
                            <Alert color="light">
                                <i className="text-secondary-darker">No templates applied</i>
                            </Alert>
                        )}
                        <FiltersWrapperStyled className="mt-2 p-3 rounded border border-light">
                            <TemplatesFilters isLoading={isLoadingTemplates} size="sm" key={key} />
                        </FiltersWrapperStyled>

                        {!isFilterApplied && recommendedTemplates && recommendedTemplates.length > 0 && (
                            <div className="text-muted my-3">
                                <p>
                                    <Tooltip message="The suggestions listed below are automatically generated based on the title and abstract from the paper. Using these suggestions is optional.">
                                        Suggestions
                                    </Tooltip>
                                </p>
                                <div>
                                    {recommendedTemplates.map((template) => (
                                        <TemplateButton
                                            isDisabled={entity && 'classes' in entity && entity?.classes?.includes(template.target_class.id)}
                                            template={template}
                                            key={`tr${template.id}`}
                                            isSmart
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isFilterApplied && featuredTemplates && featuredTemplates.length > 0 && (
                            <div className="text-muted my-3">
                                <p>Featured templates:</p>
                                <div>
                                    {featuredTemplates.map((template) => (
                                        <TemplateButton
                                            isDisabled={entity && 'classes' in entity && entity?.classes?.includes(template.target_class.id)}
                                            template={template}
                                            key={`tr${template.id}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {(isFilterApplied || !featuredTemplates || featuredTemplates?.length === 0) && (
                            <div>
                                <div className="text-muted my-3">
                                    {totalElements === 0 && isLoadingTemplates ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements}{' '}
                                    {isFilterApplied ? 'templates found by applying the filter' : 'templates'}
                                    {isFilterApplied && (
                                        <Button onClick={resetFilters} className="ms-1 ps-2 pe-2" size="sm">
                                            Reset
                                        </Button>
                                    )}
                                </div>
                                {data?.map((_templates) =>
                                    _templates.content?.map((template) => (
                                        <TemplateButton
                                            isDisabled={entity && 'classes' in entity && entity?.classes?.includes(template.target_class.id)}
                                            template={template}
                                            key={`tr${template.id}`}
                                        />
                                    )),
                                )}
                                {!isLoadingTemplates && hasNextPage && (
                                    <ListGroupItem
                                        style={{ cursor: 'pointer' }}
                                        className="text-center rounded p-1"
                                        action
                                        onClick={!isLoadingTemplates ? handleLoadMore : undefined}
                                    >
                                        <FontAwesomeIcon icon={faAngleDoubleDown} /> Load more templates
                                    </ListGroupItem>
                                )}
                                {isLoadingTemplates && (
                                    <ListGroupItem tag="div" className="text-center">
                                        <FontAwesomeIcon icon={faSpinner} spin /> Loading
                                    </ListGroupItem>
                                )}
                                {!hasNextPage && isLastPageReached && size !== 1 && (
                                    <ListGroupItem tag="div" className="text-center">
                                        You have reached the last page
                                    </ListGroupItem>
                                )}
                            </div>
                        )}
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default TemplatesModal;
