import { faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import TreeView from 'components/Class/TreeView';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

const TreeSelector = props => {
    const [showTree, setShowTree] = useState(false);
    const [valueFromTree, setValueFromTree] = useState(props.value);
    const toggleTree = () => setShowTree(prev => !prev);

    useEffect(() => {
        setValueFromTree(props.value);
    }, [props.value]);

    return (
        <>
            <Button
                disabled={!props.value || !props.value?.id}
                onClick={() => {
                    setShowTree(true);
                }}
                outline
            >
                <Tippy content="Show class tree">
                    <span>
                        <Icon icon={faSitemap} size="sm" />
                    </span>
                </Tippy>
            </Button>
            <Modal isOpen={showTree} toggle={toggleTree} size="lg">
                <ModalHeader toggle={toggleTree}>Tree view</ModalHeader>
                <ModalBody>
                    {!props.isDisabled && <Alert color="info">Selected class: {valueFromTree?.label}</Alert>}
                    <TreeView
                        id={props.value?.id}
                        label={props.value?.label}
                        onSelect={
                            !props.isDisabled
                                ? (_info, { node }) => {
                                      if (_info?.length) {
                                          setValueFromTree(node);
                                      }
                                  }
                                : () => null
                        }
                    />
                </ModalBody>
                <ModalFooter className="d-flex">
                    <Button className="float-start" color="light" onClick={toggleTree}>
                        Cancel
                    </Button>
                    {!props.isDisabled && (
                        <Button
                            color="primary"
                            className="float-end"
                            onClick={() => {
                                if (valueFromTree) {
                                    props.handleExternalSelect(valueFromTree, { action: 'select-option' });
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

TreeSelector.propTypes = {
    value: PropTypes.object,
    isDisabled: PropTypes.bool,
    handleExternalSelect: PropTypes.func,
};

export default TreeSelector;
