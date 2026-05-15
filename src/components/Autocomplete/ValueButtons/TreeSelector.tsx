import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, ReactNode, useEffect, useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import TreeView, { TreeNode } from '@/components/Class/TreeView';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Alert from '@/components/Ui/Alert/Alert';
import Button from '@/components/Ui/Button/Button';
import Modal from '@/components/Ui/Modal/Modal';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalFooter from '@/components/Ui/Modal/ModalFooter';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

type TreeSelectorButtonProps = {
    value: SingleValue<OptionType>;
    isDisabled?: boolean;
    onChange: (value: OptionType, actionMeta: ActionMeta<OptionType>) => void;
    /**
     * Optional render function for a custom trigger. When provided, it replaces the default trigger button
     * and is responsible for opening the modal via the supplied `open` handler.
     */
    renderTrigger?: (args: { open: () => void; isDisabled?: boolean; hasValue: boolean }) => ReactNode;
};

const TreeSelectorButton: FC<TreeSelectorButtonProps> = ({ value, isDisabled, onChange, renderTrigger }) => {
    const [showTree, setShowTree] = useState(false);
    const [valueFromTree, setValueFromTree] = useState(value);
    const toggleTree = () => setShowTree((prev) => !prev);
    const open = () => setShowTree(true);

    useEffect(() => {
        setValueFromTree(value);
    }, [value]);

    if (!value && !renderTrigger) {
        return null;
    }

    return (
        <>
            {renderTrigger ? (
                renderTrigger({ open, isDisabled, hasValue: !!value?.id })
            ) : (
                <Button disabled={!value || !value?.id} onClick={open} outline className="px-2">
                    <Tooltip content="Show class tree">
                        <span>
                            <FontAwesomeIcon icon={faSitemap} size="sm" />
                        </span>
                    </Tooltip>
                </Button>
            )}
            <Modal isOpen={showTree} toggle={toggleTree} size="lg">
                <ModalHeader toggle={toggleTree}>Tree view</ModalHeader>
                <ModalBody>
                    {!isDisabled && <Alert color="info">Selected class: {valueFromTree?.label}</Alert>}
                    <TreeView
                        id={value?.id ?? ''}
                        onSelect={
                            !isDisabled
                                ? (_info: string[], { node }: { node: TreeNode }) => {
                                      if (_info?.length) {
                                          setValueFromTree(node);
                                      }
                                  }
                                : () => null
                        }
                        reloadTree={false}
                    />
                </ModalBody>
                <ModalFooter className="flex">
                    <Button className="float-left" color="light" onClick={toggleTree}>
                        Cancel
                    </Button>
                    {!isDisabled && (
                        <Button
                            color="primary"
                            className="float-right"
                            onClick={() => {
                                if (valueFromTree) {
                                    onChange(valueFromTree, { option: valueFromTree, action: 'select-option' });
                                    setShowTree(false);
                                }
                            }}
                        >
                            Save
                        </Button>
                    )}
                </ModalFooter>
            </Modal>
        </>
    );
};

export default TreeSelectorButton;
