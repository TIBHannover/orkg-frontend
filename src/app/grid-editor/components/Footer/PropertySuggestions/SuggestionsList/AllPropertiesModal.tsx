import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Modal } from '@heroui/react';
import { FC } from 'react';

import { useGridDispatch } from '@/app/grid-editor/context/GridContext';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { Predicate, Template } from '@/services/backend/types';

type AllPropertiesModalProps = {
    isOpen: boolean;
    toggle: () => void;
    template: Template;
    properties: Predicate[];
};

const AllPropertiesModal: FC<AllPropertiesModalProps> = ({ isOpen, toggle, template, properties }) => {
    const dispatch = useGridDispatch();

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && toggle()} isDismissable>
            <Modal.Container size="lg">
                <Modal.Dialog>
                    <Modal.Header>
                        <Modal.CloseTrigger />
                        <Modal.Heading>
                            All properties for {template.label} ({properties.length})
                        </Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="bg-surface border border-border rounded-[var(--radius)] shadow-sm overflow-hidden">
                            <div className="divide-y divide-border">
                                {properties.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        className="w-full text-left px-4 py-3 cursor-pointer hover:bg-default/40 transition-colors duration-150 border-0 bg-transparent"
                                        onClick={() => dispatch({ type: 'ADD_PROPERTY', payload: { predicate: p } })}
                                    >
                                        <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE}>
                                            <div className="flex items-center">
                                                <FontAwesomeIcon icon={faPlus} className="text-muted mr-3 text-sm" />
                                                <span className="text-base text-foreground">{p.label}</span>
                                            </div>
                                        </DescriptionTooltip>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onPress={toggle}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default AllPropertiesModal;
