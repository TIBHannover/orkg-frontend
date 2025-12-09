import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import type { ControlProps, GroupBase } from 'react-select';
import { components } from 'react-select';
import useSWR from 'swr';

import useClassHierarchy from '@/components/Autocomplete/hooks/useClassHierarchy';
import { OptionType } from '@/components/Autocomplete/types';
import TreeView from '@/components/Class/TreeView';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';
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

    const showTreeButton = props.selectProps.entityType === ENTITIES.RESOURCE && baseClassId && baseClassId !== CLASSES.RESOURCE && hasChildren;

    return (
        <components.Control {...props}>
            {showTreeButton && (
                <>
                    <Button
                        onClick={() => {
                            setShowTree(true);
                        }}
                        outline
                        className="px-2 py-0 m-0 tw:!rounded-none tw:!border-none"
                        color={baseClassId !== rootBaseClass ? 'primary' : 'secondary'}
                    >
                        <DescriptionTooltip id={selectedClass ?? ''} _class={ENTITIES.CLASS} showURL>
                            <FontAwesomeIcon icon={faSitemap} size="sm" />
                        </DescriptionTooltip>
                    </Button>
                    <Modal isOpen={showTree} toggle={toggleTree} size="lg" unmountOnClose backdrop="static">
                        <ModalHeader toggle={toggleTree}>Tree view</ModalHeader>
                        <ModalBody>
                            <Alert color="info">
                                Selected class:{' '}
                                <DescriptionTooltip id={selectedClass ?? ''} _class={ENTITIES.CLASS} showURL>
                                    {classObject?.label ?? 'No label'}
                                </DescriptionTooltip>
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
                        </ModalBody>
                        <ModalFooter className="d-flex">
                            <Button className="float-start" color="light" onClick={toggleTree}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                className="float-end"
                                onClick={() => {
                                    if (selectedClass) {
                                        props.selectProps.onBaseClassChange?.(selectedClass);
                                        setShowTree(false);
                                    }
                                }}
                            >
                                Save
                            </Button>
                        </ModalFooter>
                    </Modal>
                </>
            )}
            {children}
        </components.Control>
    );
};

export default Control;
