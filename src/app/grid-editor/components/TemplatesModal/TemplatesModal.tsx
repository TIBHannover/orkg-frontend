import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import pluralize from 'pluralize';
import { FC } from 'react';
import styled from 'styled-components';

import TemplateButton from '@/app/grid-editor/components/TemplatesModal/TemplateButton/TemplateButton';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import useTemplates from '@/app/grid-editor/hooks/useTemplates';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import TemplatesFilters from '@/components/Templates/TemplatesFilters/TemplatesFilters';
import useTemplateGallery from '@/components/Templates/TemplatesFilters/useTemplateGallery';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
import { Template } from '@/services/backend/types';

const FiltersWrapperStyled = styled.div`
    background: ${(props) => props.theme.light};
`;

const ListWrapperStyled = styled.div``;

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

    const { templates: _usedTemplates } = useTemplates();
    // Filter out resource templates
    const usedTemplates = _usedTemplates?.filter((t) => commonClasses.includes(t.target_class.id));

    const renderListItem = (template: Template) => (
        <TemplateButton isDisabled={commonClasses.includes(template.target_class.id)} template={template} key={`tr${template.id}`} />
    );

    return (
        <div>
            <Modal
                size="xl"
                isOpen={isOpen}
                toggle={toggle}
                onClosed={() => {
                    // reset the page size to the default value for the next time the modal is opened with just one page loaded
                    setPage(0);
                }}
            >
                <ModalHeader toggle={toggle}>Template gallery</ModalHeader>
                <ModalBody>
                    <div className="clearfix">
                        <AnimatePresence>
                            {usedTemplates?.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div>
                                        <p>Applied {pluralize('template', usedTemplates?.length ?? 0, false)}:</p>
                                        {usedTemplates?.map((template) => (
                                            <TemplateButton template={template} key={`tr${template.id}`} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {usedTemplates?.length === 0 && (
                            <Alert color="light">
                                <i className="text-secondary-darker">No templates applied</i>
                            </Alert>
                        )}
                        <FiltersWrapperStyled className="mt-2 p-3 rounded border border-light">
                            <TemplatesFilters isLoading={isLoading} size="sm" key={key} />
                        </FiltersWrapperStyled>

                        <div>
                            <div className="text-muted my-3">
                                {isLoading ? <FontAwesomeIcon icon={faSpinner} spin /> : totalElements}{' '}
                                {isFilterApplied ? 'templates found by applying the filter' : 'templates'}
                                {isFilterApplied && (
                                    <Button onClick={resetFilters} className="ms-1 ps-2 pe-2" size="sm">
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
                                ListGroupComponent={ListWrapperStyled}
                            />
                        </div>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default TemplatesModal;
