import arrayMove from 'array-move';
import { OptionType } from 'components/Autocomplete/types';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import AddPropertyView from 'components/StatementBrowser/AddProperty/AddPropertyView';
import ConfirmCreatePropertyModal from 'components/StatementBrowser/AddProperty/ConfirmCreatePropertyModal';
import PropertyShape from 'components/Templates/Tabs/PropertyShapesTab/PropertyShape/PropertyShape';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { ChangeEvent, FC, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, SingleValue } from 'react-select';
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';
import { PropertyShapeLiteralType, PropertyShapeResourceType, PropertyShape as PropertyShapeType } from 'services/backend/types';
import { updateIsClosed, updatePropertyShapes } from 'slices/templateEditorSlice';

const PropertyShapesTab: FC<{}> = () => {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const dispatch = useDispatch();
    // @ts-expect-error
    const propertyShapes: PropertyShapeType[] = useSelector((state) => state.templateEditor.properties);
    const { isEditMode } = useIsEditMode();
    // @ts-expect-error
    const isClosedTemplate = useSelector((state) => state.templateEditor.is_closed);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const [propertyIndex, setPropertyIndex] = useState<number | null>(null);

    const handleDeletePropertyShape = (index: number) => {
        dispatch(updatePropertyShapes(propertyShapes.filter((item, j: number) => index !== j)));
    };

    const handlePropertiesSelect = async (selected: SingleValue<OptionType>, action: ActionMeta<OptionType>, index: number) => {
        if (selected && action.action === 'create-option') {
            setIsOpenConfirmModal(true);
            setPropertyLabel(selected.label);
            setPropertyIndex(index);
        } else {
            const templatePropertyShapes = propertyShapes.map((item, j: number) => {
                const _item = { ...item };
                if (j === index) {
                    _item.path = selected as OptionType;
                }
                return _item;
            });
            dispatch(updatePropertyShapes(templatePropertyShapes));
        }
    };

    const handleCreate = ({ id }: { id: string }) => {
        let templatePropertyShapes = [];

        // when updating existing components the propertyIndex is set, otherwise a new component is added
        if (propertyIndex) {
            const selected = { id, label: propertyLabel };
            templatePropertyShapes = propertyShapes.map((item, j: number) => {
                const _item = { ...item };
                if (j === propertyIndex) {
                    _item.path = selected;
                }
                return _item;
            });
        } else {
            templatePropertyShapes = [
                ...propertyShapes,
                {
                    path: { id, label: propertyLabel },
                    value: {},
                    min_count: '0',
                    max_count: null,
                    order: null,
                    max_inclusive: null,
                    min_inclusive: null,
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

    const handleClassOfPropertySelect = async (selected: SingleValue<OptionType>, action: ActionMeta<OptionType>, index: number) => {
        if (selected && action.action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label,
            });
            if (newClass) {
                selected = { id: newClass.id, label: newClass.label } as OptionType;
            } else {
                return null;
            }
        }
        const templatePropertyShapes = propertyShapes.map((item, j: number) => {
            const _item = { ...item };
            if (j === index) {
                if (selected && ['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(selected?.id)) {
                    if ('class' in _item) delete _item.class;
                    (_item as PropertyShapeLiteralType).datatype = selected;
                } else if (selected) {
                    (_item as PropertyShapeResourceType).class = selected;
                    if ('datatype' in _item) delete _item.datatype;
                } else {
                    if ('datatype' in _item) delete _item.datatype;
                    if ('class' in _item) delete _item.class;
                }
            }
            return _item;
        });

        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    const handleSelectNewProperty = ({ id, label }: { id: string; label: string }) => {
        const templatePropertyShapes = [...propertyShapes, { path: { id, label }, value: {}, min_count: '0', max_count: null, order: null }];
        dispatch(updatePropertyShapes(templatePropertyShapes));
        setShowAddProperty(false);
    };

    const toggleConfirmNewProperty = async (label: string) => {
        setIsOpenConfirmModal(true);
        setPropertyLabel(label);
        setPropertyIndex(null);
    };

    const moveCard = useCallback(
        (dragIndex: number, hoverIndex: number) => {
            dispatch(updatePropertyShapes(arrayMove(propertyShapes, dragIndex, hoverIndex)));
        },
        [propertyShapes, dispatch],
    );

    const handleSwitchIsClosedTemplate = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updateIsClosed(e.target.checked));
    };

    return (
        <div className="p-4">
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal((v) => !v)}
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
                    propertyShapes.map((templateProperty, index: number) => (
                        <PropertyShape
                            id={index}
                            key={`tc${templateProperty.path.id}`}
                            handleDeletePropertyShape={handleDeletePropertyShape}
                            moveCard={moveCard}
                            handlePropertiesSelect={handlePropertiesSelect}
                            handleClassOfPropertySelect={handleClassOfPropertySelect}
                        />
                    ))}
                {propertyShapes && propertyShapes.length === 0 && <i>No properties specified.</i>}
                {isEditMode && (
                    <AddPropertyView
                        showAddProperty={showAddProperty}
                        handlePropertySelect={handleSelectNewProperty}
                        toggleConfirmNewProperty={toggleConfirmNewProperty}
                        setShowAddProperty={setShowAddProperty}
                        key={`p${showAddProperty}`}
                    />
                )}
                <FormGroup className="mt-3">
                    <div>
                        <Input
                            onChange={handleSwitchIsClosedTemplate}
                            checked={isClosedTemplate}
                            id="switchIsClosedTemplate"
                            type="switch"
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
