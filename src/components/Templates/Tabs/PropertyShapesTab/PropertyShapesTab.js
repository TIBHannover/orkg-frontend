import arrayMove from 'array-move';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import AddPropertyView from 'components/StatementBrowser/AddProperty/AddPropertyView';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';
import PropertyShape from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/PropertyShape';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { updateIsClosed, updatePropertyShapes } from 'slices/templateEditorSlice';

const PropertyShapesTab = () => {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const dispatch = useDispatch();
    const propertyShapes = useSelector(state => state.templateEditor.propertyShapes);
    const { isEditMode } = useIsEditMode();
    const isClosedTemplate = useSelector(state => state.templateEditor.isClosed);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const [propertyIndex, setPropertyIndex] = useState(null);

    const handleDeletePropertyShape = index => {
        dispatch(updatePropertyShapes(propertyShapes.filter((item, j) => index !== j)));
    };

    const handlePropertiesSelect = async (selected, action, index) => {
        if (action.action === 'create-option') {
            setIsOpenConfirmModal(true);
            setPropertyLabel(selected.label);
            setPropertyIndex(index);
        } else {
            const templatePropertyShapes = propertyShapes.map((item, j) => {
                const _item = { ...item };
                if (j === index) {
                    _item.property = !selected ? null : selected;
                }
                return _item;
            });
            dispatch(updatePropertyShapes(templatePropertyShapes));
        }
    };

    const handleCreate = ({ id }) => {
        let templatePropertyShapes = [];

        // when updating existing components the propertyIndex is set, otherwise a new component is added
        if (propertyIndex) {
            const selected = { id, label: propertyLabel };
            templatePropertyShapes = propertyShapes.map((item, j) => {
                const _item = { ...item };
                if (j === propertyIndex) {
                    _item.property = !selected ? null : selected;
                }
                return _item;
            });
        } else {
            templatePropertyShapes = [
                ...propertyShapes,
                {
                    property: { id, label: propertyLabel },
                    value: {},
                    minCount: '0',
                    maxCount: null,
                    order: null,
                    maxInclusive: null,
                    minInclusive: null,
                    placeholder: '',
                    description: '',
                },
            ];
            setShowAddProperty(false);
        }
        dispatch(updatePropertyShapes(templatePropertyShapes));
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
        const templatePropertyShapes = propertyShapes.map((item, j) => {
            const _item = { ...item };
            if (j === index) {
                _item.value = !selected ? null : selected;
            }
            return _item;
        });

        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    const handleSelectNewProperty = ({ id, value: label }) => {
        const templatePropertyShapes = [...propertyShapes, { property: { id, label }, value: {}, minCount: '0', maxCount: null, order: null }];
        dispatch(updatePropertyShapes(templatePropertyShapes));
        setShowAddProperty(false);
    };

    const toggleConfirmNewProperty = async label => {
        setIsOpenConfirmModal(true);
        setPropertyLabel(label);
        setPropertyIndex(null);
    };

    const moveCard = useCallback(
        (dragIndex, hoverIndex) => {
            dispatch(updatePropertyShapes(arrayMove(propertyShapes, dragIndex, hoverIndex)));
        },
        [propertyShapes, dispatch],
    );

    const handleSwitchIsClosedTemplate = event => {
        dispatch(updateIsClosed(event.target.checked));
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
                {propertyShapes && propertyShapes.length > 0 && (
                    <Row className="text-center">
                        <Col md={6}>Property</Col>
                        <Col md={5}>Type</Col>
                    </Row>
                )}
                {propertyShapes &&
                    propertyShapes.length > 0 &&
                    propertyShapes.map((templateProperty, index) => (
                        <PropertyShape
                            id={index}
                            key={`tc${templateProperty.property.id}`}
                            handleDeletePropertyShape={handleDeletePropertyShape}
                            moveCard={moveCard}
                            handlePropertiesSelect={handlePropertiesSelect}
                            handleClassOfPropertySelect={handleClassOfPropertySelect}
                        />
                    ))}
                {propertyShapes && propertyShapes.length === 0 && <i>No properties specified.</i>}
                {isEditMode && (
                    <>
                        <AddPropertyView
                            showAddProperty={showAddProperty}
                            handlePropertySelect={handleSelectNewProperty}
                            toggleConfirmNewProperty={toggleConfirmNewProperty}
                            setShowAddProperty={setShowAddProperty}
                            key={showAddProperty}
                        />
                    </>
                )}
                <FormGroup className="mt-3">
                    <div>
                        <Input
                            onChange={handleSwitchIsClosedTemplate}
                            checked={isClosedTemplate}
                            id="switchIsClosedTemplate"
                            type="switch"
                            name="customSwitch"
                            disabled={!isEditMode}
                        />{' '}
                        <Label for="switchIsClosedTemplate" className="mb-0">
                            This template is strict (users cannot add additional properties themselves)
                        </Label>
                    </div>
                </FormGroup>
            </div>
        </div>
    );
};

export default PropertyShapesTab;
