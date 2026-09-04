import { Alert, Switch } from '@heroui/react';
import { reorderList, useAutoScroll, useSortableList } from '@orkg/pragmatic-dnd-hooks';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionMeta, SingleValue } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';
import ConfirmClass from '@/components/ConfirmationModal/ConfirmationModal';
import ConfirmCreatePropertyModal from '@/components/DataBrowser/components/Footer/AddProperty/ConfirmCreatePropertyModal';
import AddPropertyView from '@/components/Templates/Tabs/PropertyShapesTab/AddProperty/AddPropertyView';
import PropertyShape from '@/components/Templates/Tabs/PropertyShapesTab/PropertyShape/PropertyShape';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { PropertyShape as PropertyShapeType, PropertyShapeLiteralType, PropertyShapeResourceType } from '@/services/backend/types';
import { updateIsClosed, updatePropertyShapes } from '@/slices/templateEditorSlice';
import { RootStore } from '@/slices/types';

const PropertyShapesTab: FC = () => {
    const [showAddProperty, setShowAddProperty] = useState(false);
    const dispatch = useDispatch();
    const propertyShapes = useSelector((state: RootStore) => state.templateEditor.properties);
    const { isEditMode } = useIsEditMode();
    const isClosedTemplate = useSelector((state: RootStore) => state.templateEditor.is_closed);
    const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
    const [propertyLabel, setPropertyLabel] = useState('');
    const [propertyIndex, setPropertyIndex] = useState<number | null>(null);

    const { instanceId, moveItem } = useSortableList({
        itemCount: propertyShapes.length,
        onReorder: (event) => dispatch(updatePropertyShapes(reorderList(propertyShapes, event))),
    });

    // the list scrolls with the page, so only the window needs to scroll while dragging
    useAutoScroll({ instanceId, includeWindow: true });

    const handleDeletePropertyShape = (index: number) => {
        dispatch(updatePropertyShapes(propertyShapes.filter((_item, j: number) => index !== j)));
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
        let templatePropertyShapes: PropertyShapeType[] = [];

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
                    placeholder: '',
                    description: '',
                    min_count: '0',
                },
            ];
            setShowAddProperty(false);
        }
        dispatch(updatePropertyShapes(templatePropertyShapes));
        setPropertyIndex(null);
    };

    const handleClassOfPropertySelect = async (selected: SingleValue<OptionType>, action: ActionMeta<OptionType>, index: number) => {
        let resolved: OptionType | null = selected;
        if (resolved && action.action === 'create-option') {
            const newClass = await ConfirmClass({
                label: resolved.label,
            });
            if (newClass) {
                resolved = { id: newClass.id, label: newClass.label } as OptionType;
            } else {
                return;
            }
        }
        const templatePropertyShapes = propertyShapes.map((item, j: number) => {
            const _item = { ...item };
            if (j === index) {
                if (resolved && ['Decimal', 'Integer', 'String', 'Boolean', 'Date', 'URI'].includes(resolved?.id)) {
                    if ('class' in _item) delete (_item as PropertyShapeResourceType).class;
                    (_item as PropertyShapeLiteralType).datatype = resolved;
                } else if (resolved) {
                    (_item as PropertyShapeResourceType).class = resolved;
                    if ('datatype' in _item) delete (_item as PropertyShapeLiteralType).datatype;
                } else {
                    if ('datatype' in _item) delete (_item as PropertyShapeLiteralType).datatype;
                    if ('class' in _item) delete (_item as PropertyShapeResourceType).class;
                }
            }
            return _item;
        });

        dispatch(updatePropertyShapes(templatePropertyShapes));
    };

    const handleSelectNewProperty = ({ id, label }: { id: string; label: string }) => {
        const templatePropertyShapes: PropertyShapeType[] = [
            ...propertyShapes,
            { path: { id, label }, placeholder: '', description: '', min_count: '0' },
        ];
        dispatch(updatePropertyShapes(templatePropertyShapes));
        setShowAddProperty(false);
    };

    const toggleConfirmNewProperty = async (label: string) => {
        setIsOpenConfirmModal(true);
        setPropertyLabel(label);
        setPropertyIndex(null);
    };

    const handleSwitchIsClosedTemplate = (isSelected: boolean) => {
        dispatch(updateIsClosed(isSelected));
    };

    return (
        <div className="p-6">
            {isOpenConfirmModal && (
                <ConfirmCreatePropertyModal
                    isOpen={isOpenConfirmModal}
                    onCreate={handleCreate}
                    label={propertyLabel}
                    toggle={() => setIsOpenConfirmModal((v) => !v)}
                />
            )}
            <div className="pb-6">
                {propertyShapes && propertyShapes.length > 0 && (
                    <div className="grid grid-cols-12 text-center text-sm text-muted mb-2">
                        <div className="col-span-12 md:col-span-5 px-2">Property</div>
                        <div className="col-span-12 md:col-span-7 px-2">Type</div>
                    </div>
                )}
                {propertyShapes &&
                    propertyShapes.length > 0 &&
                    propertyShapes.map((templateProperty, index: number) => (
                        <PropertyShape
                            id={index}
                            key={`tc${templateProperty.path?.id || index}`}
                            instanceId={instanceId}
                            moveItem={moveItem}
                            propertyShape={templateProperty}
                            handleDeletePropertyShape={handleDeletePropertyShape}
                            handlePropertiesSelect={handlePropertiesSelect}
                            handleClassOfPropertySelect={handleClassOfPropertySelect}
                        />
                    ))}
                {propertyShapes && propertyShapes.length === 0 && (
                    <Alert status="default">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>No properties specified.</Alert.Title>
                        </Alert.Content>
                    </Alert>
                )}
                {isEditMode && (
                    <AddPropertyView
                        showAddProperty={showAddProperty}
                        handlePropertySelect={handleSelectNewProperty}
                        toggleConfirmNewProperty={toggleConfirmNewProperty}
                        setShowAddProperty={setShowAddProperty}
                        key={`p${showAddProperty}`}
                    />
                )}
                <Switch className="mt-6 flex gap-3" isSelected={isClosedTemplate} onChange={handleSwitchIsClosedTemplate} isDisabled={!isEditMode}>
                    <Switch.Content>
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                        This template is strict (users cannot add additional properties themselves)
                    </Switch.Content>
                </Switch>
            </div>
        </div>
    );
};

export default PropertyShapesTab;
