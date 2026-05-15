import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import pluralize from 'pluralize';
import { FC } from 'react';

import TemplateButton from '@/app/grid-editor/components/TemplatesModal/TemplateButton/TemplateButton';
import TemplateListItem from '@/app/grid-editor/components/TemplatesModal/TemplateListItem/TemplateListItem';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TemplatesFilters from '@/components/Templates/TemplatesFilters/TemplatesFilters';
import useTemplateGallery from '@/components/Templates/TemplatesFilters/useTemplateGallery';
import { CONTENT_TYPES_WITH_SPECIAL_SCHEMA } from '@/constants/contentTypes';
import { ENTITY_CLASSES } from '@/constants/graphSettings';
import { Template } from '@/services/backend/types';

type TemplatesModalProps = {
    isOpen: boolean;
    toggle: () => void;
};

const TemplatesModal: FC<TemplatesModalProps> = ({ isOpen, toggle }) => {
    const {
        key,
        items,
        isLoading,
        totalElements,
        hasNextPage,
        page,
        totalPages,
        setPage,
        error,
        pageSize,
        isFilterApplied,
        resetFilters,
        setPageSize,
    } = useTemplateGallery({ pageSize: 15 });

    const { commonClasses } = useEntities();
    const { user } = useAuthentication();
    const isCurationAllowed = user?.isCurationAllowed ?? false;
    const { templates: _usedTemplates } = useTemplates();
    const usedTemplates = _usedTemplates?.filter((t) => commonClasses.includes(t.target_class.id));

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            toggle();
            setPage(0);
        }
    };

    const renderListItem = (template: Template) => (
        <TemplateListItem
            isDisabled={
                ENTITY_CLASSES.includes(template.target_class.id) ||
                (CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(template.target_class.id) && !isCurationAllowed)
            }
            template={template}
            key={`tr${template.id}`}
        />
    );

    return (
        <Modal.Backdrop className="z-[1055]" isOpen={isOpen} onOpenChange={handleOpenChange} isDismissable>
            <Modal.Container>
                <Modal.Dialog className="max-w-6xl">
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>Template gallery</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="flow-root">
                            <AnimatePresence>
                                {usedTemplates?.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p>Applied {pluralize('template', usedTemplates?.length ?? 0, false)}:</p>
                                        {usedTemplates?.map((template) => (
                                            <TemplateButton
                                                isDisabled={
                                                    CONTENT_TYPES_WITH_SPECIAL_SCHEMA.includes(template.target_class.id) && !isCurationAllowed
                                                }
                                                template={template}
                                                key={`tr${template.id}`}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {usedTemplates?.length === 0 && (
                                <Alert status="default" className="!bg-secondary-100 dark:!bg-secondary-800/40">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <i className="text-secondary-darker">No templates applied</i>
                                    </Alert.Content>
                                </Alert>
                            )}
                            <div className="mt-2 p-4 rounded border border-default bg-surface-secondary">
                                <TemplatesFilters isLoading={isLoading} size="sm" key={key} />
                            </div>

                            <div>
                                <div className="text-muted my-4">
                                    {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements}{' '}
                                    {isFilterApplied ? 'templates found by applying the filter' : 'templates'}
                                    {isFilterApplied && (
                                        <Button onPress={resetFilters} className="ml-1 px-2" size="sm" variant="secondary">
                                            Reset
                                        </Button>
                                    )}
                                </div>
                                <ListPaginatedContent<Template>
                                    renderListItem={renderListItem}
                                    pageSize={pageSize}
                                    label="templates"
                                    isLoading={isLoading}
                                    items={items ?? []}
                                    hasNextPage={hasNextPage}
                                    page={page}
                                    setPage={setPage}
                                    setPageSize={setPageSize}
                                    totalElements={totalElements}
                                    error={error}
                                    totalPages={totalPages}
                                    boxShadow={false}
                                    flush={false}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default TemplatesModal;
