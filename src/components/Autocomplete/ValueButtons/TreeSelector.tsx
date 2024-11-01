import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { OptionType } from 'components/Autocomplete/types';
import TreeView from 'components/Class/TreeView';
import { FC, useEffect, useState } from 'react';
import { ActionMeta, SingleValue } from 'react-select';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

type TreeSelectorButtonProps = {
    value: SingleValue<OptionType>;
    isDisabled?: boolean;
    onChange: (value: OptionType, actionMeta: ActionMeta<OptionType>) => void;
};

const TreeSelectorButton: FC<TreeSelectorButtonProps> = ({ value, isDisabled, onChange }) => {
    const [showTree, setShowTree] = useState(false);
    const [valueFromTree, setValueFromTree] = useState(value);
    const toggleTree = () => setShowTree((prev) => !prev);

    useEffect(() => {
        setValueFromTree(value);
    }, [value]);

    if (!value) {
        return null;
    }

    return (
        <>
            <Button
                disabled={!value || !value?.id}
                onClick={() => {
                    setShowTree(true);
                }}
                outline
                className="px-2"
            >
                <Tippy content="Show class tree">
                    <span>
                        <FontAwesomeIcon icon={faSitemap} size="sm" />
                    </span>
                </Tippy>
            </Button>
            <Modal isOpen={showTree} toggle={toggleTree} size="lg">
                <ModalHeader toggle={toggleTree}>Tree view</ModalHeader>
                <ModalBody>
                    {!isDisabled && <Alert color="info">Selected class: {valueFromTree?.label}</Alert>}
                    <TreeView
                        id={value?.id}
                        label={value?.label}
                        onSelect={
                            !isDisabled
                                ? // @ts-expect-error
                                  (_info: any, { node }) => {
                                      if (_info?.length) {
                                          setValueFromTree(node);
                                      }
                                  }
                                : () => null
                        }
                        reloadTree={false}
                    />
                </ModalBody>
                <ModalFooter className="d-flex">
                    <Button className="float-start" color="light" onClick={toggleTree}>
                        Cancel
                    </Button>
                    {!isDisabled && (
                        <Button
                            color="primary"
                            className="float-end"
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
