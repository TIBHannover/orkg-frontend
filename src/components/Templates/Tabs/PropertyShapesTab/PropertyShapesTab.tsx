import { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, SingleValue } from 'react-select';
import { Col, FormGroup, Input, Label, Row } from 'reactstrap';

import { OptionType } from '@/components/Autocomplete/types';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import ConfirmCreatePropertyModal from '@/components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import { createInstanceId, createListMonitor, performReorder, type ReorderParams } from '@/components/shared/dnd/dragAndDropUtils';
import AddPropertyView from '@/components/Templates/Tabs/PropertyShapesTab/AddProperty/AddPropertyView';
import PropertyShape, { isPropertyShapeData } from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/PropertyShape';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShape as PropertyShapeType, PropertyShapeLiteralType, PropertyShapeResourceType } from '@/services/backend/types';
import { updateIsClosed, updatePropertyShapes } from '@/slices/templateEditorSlice';

const PropertyShapesTab: FC<{}> = () => {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [instanceId] = useState(() => createInstanceId('property-shapes-tab'));
    const dispatch = useDispatch();
    // @ts-expect-error
    const propertyShapes: PropertyShapeType[] = useSelector((state) => state.templateEditor.properties);
    const { isEditMode } = useIsEditMode();
    // @ts-expect-error
    const isClosedTemplate = useSelector((state) => state.templateEditor.is_closed);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const [propertyIndex, setPropertyIndex] = useState<number | null>(null);

    const reorderPropertyShapes = useCallback(
        ({ startIndex, indexOfTarget, closestEdgeOfTarget }: ReorderParams) => {
            const reorderedShapes = performReorder({
                items: propertyShapes,
                startIndex,
                indexOfTarget,
                closestEdgeOfTarget,
                axis: 'vertical',
            });

            if (reorderedShapes !== propertyShapes) {
                dispatch(updatePropertyShapes(reorderedShapes));
            }
        },
        [propertyShapes, dispatch],
    );

    useEffect(() => {
        const cleanup = createListMonitor({
            instanceId,
            items: propertyShapes,
            isDragData: isPropertyShapeData,
            onReorder: reorderPropertyShapes,
            getItemId: (shape) => shape.path?.id || `shape-${propertyShapes.indexOf(shape)}`,
        });

        return () => {
            cleanup?.();
        };
    }, [instanceId, propertyShapes, reorderPropertyShapes]);

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

    const handleSwitchIsClosedTemplate = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(updateIsClosed(e.target.checked));
    };

    return (
        <div className="p-4">
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    isOpen={isOpenConfirmModal}
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal((v) => !v)}
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
                            key={`tc${templateProperty.path?.id || index}`}
                            instanceId={instanceId}
                            propertyShape={templateProperty}
                            handleDeletePropertyShape={handleDeletePropertyShape}
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
