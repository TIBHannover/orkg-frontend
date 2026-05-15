import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Modal } from '@heroui/react';
import { useEffect, useState } from 'react';
import type { ControlProps, GroupBase } from 'react-select';
import { components } from 'react-select';
import useSWR from 'swr';

import useClassHierarchy from '@/components/Autocomplete/hooks/useClassHierarchy';
import { OptionType } from '@/components/Autocomplete/types';
import TreeView from '@/components/Class/TreeView';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { classesUrl, getClassById } from '@/services/backend/classes';

const Control = ({ children, ...props }: ControlProps<OptionType, boolean, GroupBase<OptionType>>) => {
    const [showTree, setShowTree] = useState(false);
    const toggleTree = () => setShowTree((prev) => !prev);

    // rootBaseClass is the original baseClass prop value (never changes)
    // baseClass is the effective baseClass (can be overridden by user selection)
    const { rootBaseClass, baseClass: baseClassId = '' } = props.selectProps;
    const { hasChildren } = useClassHierarchy({
        id: rootBaseClass ?? '',
    });

    const [selectedClass, setSelectedClass] = useState<string | null>(baseClassId);

    useEffect(() => {
        setSelectedClass(baseClassId);
    }, [baseClassId]);

    const { data: classObject } = useSWR(selectedClass ? [selectedClass, classesUrl, 'getClassById'] : null, ([params]) => getClassById(params));

    const showTreeButton = props.selectProps.entityType === ENTITIES.RESOURCE && !!baseClassId && baseClassId !== CLASSES.RESOURCE && !!hasChildren;

    return (
        <components.Control {...props}>
            {showTreeButton && (
                <>
                    <Button
                        onPress={() => setShowTree(true)}
                        variant={baseClassId !== rootBaseClass ? 'primary' : 'secondary'}
                        size="sm"
                        className="px-2 py-0 m-0 rounded-none border-none"
                    >
                        <DescriptionTooltip id={selectedClass ?? ''} _class={ENTITIES.CLASS} showURL>
                            <FontAwesomeIcon icon={faSitemap} size="sm" />
                        </DescriptionTooltip>
                    </Button>
                    <Modal.Backdrop
                        isOpen={showTree}
                        onOpenChange={(open) => {
                            if (!open) toggleTree();
                        }}
                        isDismissable={false}
                        isKeyboardDismissDisabled
                    >
                        <Modal.Container className="mt-[73px] max-h-[calc(100vh-73px)]" size="lg">
                            <Modal.Dialog>
                                <Modal.Header>
                                    <Modal.CloseTrigger />
                                    <Modal.Heading>Tree view</Modal.Heading>
                                </Modal.Header>
                                <Modal.Body className="p-6">
                                    <Alert status="accent" className="mb-3">
                                        <Alert.Indicator />
                                        <Alert.Content>
                                            <Alert.Description>
                                                Selected class:{' '}
                                                <DescriptionTooltip id={selectedClass ?? ''} _class={ENTITIES.CLASS} showURL>
                                                    {classObject?.label ?? 'No label'}
                                                </DescriptionTooltip>
                                            </Alert.Description>
                                        </Alert.Content>
                                    </Alert>
                                    <TreeView
                                        id={baseClassId}
                                        onSelect={(selectedKeys, { node: n }) => {
                                            if (selectedKeys?.length) {
                                                setSelectedClass(n.id);
                                            }
                                        }}
                                        rootNodeId={rootBaseClass}
                                        reloadTree={false}
                                    />
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button variant="secondary" onPress={toggleTree}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onPress={() => {
                                            if (selectedClass) {
                                                props.selectProps.onBaseClassChange?.(selectedClass);
                                                setShowTree(false);
                                            }
                                        }}
                                    >
                                        Save
                                    </Button>
                                </Modal.Footer>
                            </Modal.Dialog>
                        </Modal.Container>
                    </Modal.Backdrop>
                </>
            )}
            {children}
        </components.Control>
    );
};

export default Control;
