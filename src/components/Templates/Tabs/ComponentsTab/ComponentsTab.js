import { useState, useCallback } from 'react';
import { Row, Col, FormGroup, Input, Label } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import { updateComponents, updateIsStrict } from 'slices/templateEditorSlice';
import TemplateComponent from 'components/Templates/TemplateComponent/TemplateComponent';
import AddPropertyView from 'components/StatementBrowser/AddProperty/AddPropertyView';
import update from 'immutability-helper';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';

const ComponentsTab = () => {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const dispatch = useDispatch();
    const components = useSelector(state => state.templateEditor.components);
    const editMode = useSelector(state => state.templateEditor.editMode);
    const isStrictTemplate = useSelector(state => state.templateEditor.isStrict);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const [propertyIndex, setPropertyIndex] = useState(null);

    const handleDeleteTemplateComponent = index => {
        dispatch(updateComponents(components.filter((item, j) => index !== j)));
    };

    const handlePropertiesSelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            setIsOpenConfirmModal(true);
            setPropertyLabel(selected.label);
            setPropertyIndex(index);
        } else {
            const templateComponents = components.map((item, j) => {
                const _item = { ...item };
                if (j === index) {
                    _item.property = !selected ? null : selected;
                }
                return _item;
            });
            dispatch(updateComponents(templateComponents));
        }
    };

    const handleCreate = ({ id }) => {
        let templateComponents = [];

        // when updating existing components the propertyIndex is set, otherwise a new component is added
        if (propertyIndex) {
            const selected = { id, label: propertyLabel };
            templateComponents = components.map((item, j) => {
                const _item = { ...item };
                if (j === propertyIndex) {
                    _item.property = !selected ? null : selected;
                }
                return _item;
            });
        } else {
            templateComponents = [
                ...components,
                {
                    property: { id, label: propertyLabel },
                    value: {},
                    validationRules: {},
                    minOccurs: '0',
                    maxOccurs: null,
                    order: null,
                },
            ];
            setShowAddProperty(false);
        }
        dispatch(updateComponents(templateComponents));
        setIsOpenConfirmModal(false);
        setPropertyIndex(null);
    };

    const handleClassOfPropertySelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected = { id: newClass.id, label: newClass.label };
            } else {
                return null;
            }
        }
        const templateComponents = components.map((item, j) => {
            const _item = { ...item };
            if (j === index) {
                _item.value = !selected ? null : selected;
                _item.validationRules = {};
            }
            return _item;
        });

        dispatch(updateComponents(templateComponents));
    };

    const handleSelectNewProperty = ({ id, value: label }) => {
        const templateComponents = [
            ...components,
            { property: { id, label }, value: {}, validationRules: {}, minOccurs: '0', maxOccurs: null, order: null },
        ];
        dispatch(updateComponents(templateComponents));
        setShowAddProperty(false);
    };

    const toggleConfirmNewProperty = async label => {
        setIsOpenConfirmModal(true);
        setPropertyLabel(label);
        setPropertyIndex(null);
    };

    const moveCard = useCallback(
        (dragIndex, hoverIndex) => {
            const dragCard = components[dragIndex];
            dispatch(
                updateComponents(
                    update(components, {
                        $splice: [[dragIndex, 1], [hoverIndex, 0, dragCard]],
                    }),
                ),
            );
        },
        [components, dispatch],
    );

    const handleSwitchIsStrictTemplate = event => {
        dispatch(updateIsStrict(event.target.checked));
    };

    return (
        <div className="p-4">
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal(v => !v)}
                    shouldPerformCreate
                />
            )}
            <div className="pb-4">
                {components && components.length > 0 && (
                    <Row className="text-center">
                        <Col md={6}>Property</Col>
                        <Col md={5}>Type</Col>
                    </Row>
                )}
                {components &&
                    components.length > 0 &&
                    components.map((templateProperty, index) => (
                        <TemplateComponent
                            key={`tc${templateProperty.property.id}`}
                            handleDeleteTemplateComponent={handleDeleteTemplateComponent}
                            id={index}
                            moveCard={moveCard}
                            property={templateProperty.property}
                            value={templateProperty.value}
                            minOccurs={templateProperty.minOccurs}
                            maxOccurs={templateProperty.maxOccurs}
                            validationRules={templateProperty.validationRules}
                            handlePropertiesSelect={handlePropertiesSelect}
                            handleClassOfPropertySelect={handleClassOfPropertySelect}
                        />
                    ))}
                {components && components.length === 0 && <i>No properties specified.</i>}
                {editMode && (
                    <>
                        <AddPropertyView
                            showAddProperty={showAddProperty}
                            handlePropertySelect={handleSelectNewProperty}
                            toggleConfirmNewProperty={toggleConfirmNewProperty}
                            setShowAddProperty={setShowAddProperty}
                        />
                    </>
                )}
                <FormGroup className="mt-3">
                    <div>
                        <Input
                            onChange={handleSwitchIsStrictTemplate}
                            checked={isStrictTemplate}
                            id="switchIsStrictTemplate"
                            type="switch"
                            name="customSwitch"
                            disabled={!editMode}
                        />{' '}
                        <Label for="switchIsStrictTemplate" className="mb-0">
                            This template is strict (users cannot add additional properties themselves)
                        </Label>
                    </div>
                </FormGroup>
            </div>
        </div>
    );
};

export default ComponentsTab;
