import { faMinusSquare, faPlusSquare, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Skeleton } from '@heroui/react';
import { find, sortBy, uniq } from 'lodash';
import { FC, useEffect, useState } from 'react';
import useSWR from 'swr';

import Autocomplete from '@/components/Autocomplete/Autocomplete';
import FieldStatistics from '@/components/ResearchFieldSelector/FieldStatistics';
import PreviouslySelectedResearchField from '@/components/ResearchFieldSelector/PreviouslySelectedResearchField/PreviouslySelectedResearchField';
import SmartSuggestionsFields from '@/components/ResearchFieldSelector/SmartSuggestionsFields/SmartSuggestionsFields';
import { CLASSES, ENTITIES, RESOURCES } from '@/constants/graphSettings';
import { FieldChildren, getFieldChildren, getFieldParents, researchFieldUrl } from '@/services/backend/researchFields';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { Node } from '@/services/backend/types';

export type ResearchField = {
    label: string;
    id: string;
    parent: string;
    hasChildren: boolean | null;
    isExpanded: boolean;
};

type ResearchFieldSelectorProps = {
    selectedResearchFieldId: string;
    updateResearchField: (selectedResearchField?: Node, submit?: boolean) => void;
    insideModal?: boolean;
    showPreviouslySelected?: boolean;
    title?: string | null;
    abstract?: string | null;
    showStatistics?: boolean;
};

const ResearchFieldSelector: FC<ResearchFieldSelectorProps> = ({
    selectedResearchFieldId = RESOURCES.RESEARCH_FIELD_MAIN,
    updateResearchField,
    insideModal = false,
    showPreviouslySelected = true,
    title = '',
    abstract = '',
    showStatistics = false,
}) => {
    const [loadingSubFieldsId, setLoadingSubFieldsId] = useState<string | null>(null);
    const [researchFields, setResearchFields] = useState<ResearchField[]>([]);

    const { data: selectedResearchField } = useSWR(
        selectedResearchFieldId ? [selectedResearchFieldId, resourcesUrl, 'getResource'] : null,
        ([params]) => getResource(params),
    );

    const { data: parentResearchFields, isLoading: isParentLoading } = useSWR(
        selectedResearchFieldId ? [{ fieldId: selectedResearchFieldId }, researchFieldUrl, 'getFieldParents'] : null,
        ([params]) => getFieldParents(params),
    );

    const path = uniq([selectedResearchFieldId, ...(parentResearchFields?.map((field) => field.id) ?? [])]);
    const fieldsToLoad = path.filter((id) => {
        const hasChildren = researchFields.find((f) => f.id === id)?.hasChildren;
        const loadedSubFields = researchFields.filter((f) => f.parent === id);
        return (hasChildren && loadedSubFields.length === 0) || hasChildren === undefined;
    });

    const { data: childrenResearchFields, isLoading } = useSWR(
        !isParentLoading && path.length > 0 ? [path, researchFieldUrl, 'getFieldChildren'] : null,
        ([params]) =>
            Promise.all(params.map((id) => (fieldsToLoad.includes(id) ? getFieldChildren({ fieldId: id }) : []))).then((data) =>
                data.map((d, index) => ({ children: d, parent: params[index] })),
            ),
    );

    useEffect(() => {
        if (childrenResearchFields) {
            const fields: ResearchField[] = [];
            const _path = childrenResearchFields.map((field) => field.parent);
            childrenResearchFields?.forEach((field) => {
                field.children.forEach((child) => {
                    if (_path.find((f) => f === child.resource.id)) {
                        fields.push({
                            label: child.resource.label,
                            id: child.resource.id,
                            parent: field.parent,
                            hasChildren: child.child_count > 0,
                            isExpanded: true,
                        });
                        return;
                    }
                    fields.push({
                        label: child.resource.label,
                        id: child.resource.id,
                        parent: field.parent,
                        hasChildren: child.child_count > 0,
                        isExpanded: false,
                    });
                });
            });
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResearchFields((v) => {
                const oldFields = v.filter((f) => !fields.find((f2) => f2.id === f.id));
                return [...oldFields, ...fields].map((f) =>
                    _path.find((f2) => f2 === f.id)
                        ? {
                              ...f,
                              isExpanded: true,
                          }
                        : {
                              ...f,
                              isExpanded: v.find((f2) => f2.id === f.id)?.isExpanded ?? false,
                          },
                );
            });
        }
    }, [childrenResearchFields]);

    const handleFieldSelect = async (selected: Node, submit = false) => {
        updateResearchField(selected, submit);
    };

    const handleFieldClick = async (field: Node, shouldSetActive = true) => {
        if (shouldSetActive) {
            updateResearchField(field);
        } else {
            // load subfields
            const hasChildren = researchFields.find((f) => f.id === field.id)?.hasChildren;
            const subFields = researchFields.filter((f) => f.parent === field.id);
            let loadedSubFields: FieldChildren[] = [];
            if (hasChildren && subFields.length === 0) {
                setLoadingSubFieldsId(field.id);
                loadedSubFields = await getFieldChildren({ fieldId: field.id });
                setLoadingSubFieldsId(null);
            }
            setResearchFields((v) => [
                ...v.map((f) => (field.id === f.id ? { ...f, isExpanded: !f.isExpanded } : f)),
                ...loadedSubFields.map((f) => ({
                    label: f.resource.label,
                    id: f.resource.id,
                    parent: field.id,
                    hasChildren: f.child_count > 0,
                    isExpanded: false,
                })),
            ]);
        }
    };

    const fieldList = (selectedField: string) => {
        const subFields = sortBy(
            researchFields.filter((field) => field.parent === selectedField),
            'label',
        );
        if (subFields.length === 0) {
            return null;
        }
        return subFields.map((field) => {
            const _isLoading = loadingSubFieldsId === field.id || (fieldsToLoad.includes(field.id) && isLoading);
            let icon;
            if (_isLoading) {
                icon = faSpinner;
            } else if (field.isExpanded) {
                icon = faMinusSquare;
            } else {
                icon = faPlusSquare;
            }

            const isActive = selectedResearchFieldId === field.id;

            return (
                <li key={field.id}>
                    <button
                        type="button"
                        onClick={() => handleFieldClick(field)}
                        className={`w-full rounded-md px-2 py-1.5 mb-1 flex items-center text-left text-sm transition-none min-w-0 ${
                            isActive
                                ? 'bg-[var(--color-secondary)] text-white'
                                : 'bg-[var(--background)] text-inherit hover:bg-[var(--surface)] focus:ring-2 focus:ring-[var(--color-secondary)]/25'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        <div className="grow flex items-center min-w-0">
                            <div
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleFieldClick(field, false);
                                }}
                                onKeyDown={(e: React.KeyboardEvent) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation();
                                        handleFieldClick(field, false);
                                    }
                                }}
                                className="w-8 shrink-0 mr-2 text-center"
                            >
                                {field.hasChildren && (
                                    <FontAwesomeIcon icon={icon} spin={_isLoading} className={!isActive ? 'text-[var(--color-secondary)]' : ''} />
                                )}
                            </div>
                            <span className="truncate">{find(path, (pId) => pId === field.id) ? <b>{field.label}</b> : field.label}</span>
                        </div>
                        {showStatistics && <FieldStatistics field={field} />}
                    </button>
                    {field.isExpanded && !_isLoading && <ul className="pl-4 list-none">{fieldList(field.id)}</ul>}
                </li>
            );
        });
    };

    return (
        <>
            <div className="mb-4">
                <Autocomplete
                    entityType={ENTITIES.RESOURCE}
                    includeClasses={[CLASSES.RESEARCH_FIELD]}
                    placeholder="Search for fields..."
                    onChange={(value, { action }) => {
                        if (action === 'select-option' && value) {
                            handleFieldSelect({
                                id: value.id,
                                label: value.label,
                            });
                        }
                    }}
                    value={selectedResearchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN ? selectedResearchField : null}
                    enableExternalSources={false}
                    allowCreate={false}
                    aria-label="Search research fields"
                />
            </div>
            <div className="flex flex-wrap items-stretch">
                <div
                    className={`${insideModal ? 'shrink-0 grow-0 w-12/12 basis-12/12 max-w-12/12' : 'w-full md:shrink-0 md:grow-0 md:w-4/12 md:basis-4/12 md:max-w-4/12 order-md-2'}`}
                >
                    <SmartSuggestionsFields handleFieldSelect={handleFieldSelect} title={title} abstract={abstract} />
                    {showPreviouslySelected && (
                        <PreviouslySelectedResearchField selectedResearchField={selectedResearchFieldId} handleFieldSelect={handleFieldSelect} />
                    )}
                </div>

                <div
                    className={`${insideModal || !showPreviouslySelected ? 'shrink-0 grow-0 w-12/12 basis-12/12 max-w-12/12' : 'w-full md:shrink-0 md:grow-0 md:w-8/12 md:basis-8/12 md:max-w-8/12 order-md-1'} overflow-hidden`}
                >
                    {!isParentLoading && path.length === 1 && selectedResearchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                        <Alert status="accent">This research field is not part of the ORKG taxonomy.</Alert>
                    )}
                    <div className="flex">
                        <h3 className="font-bold text-lg mt-1 mb-0">Browse taxonomy</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            isDisabled={!find(researchFields, (f) => f.isExpanded)}
                            className="ms-auto p-0 text-[var(--color-secondary)]"
                            onPress={() => setResearchFields((v) => v.map((f) => ({ ...f, isExpanded: false })))}
                            aria-label="Collapse all fields"
                        >
                            <FontAwesomeIcon icon={faMinusSquare} className="mr-1" />
                            <span className="underline">Collapse all</span>
                        </Button>
                    </div>
                    {!researchFields && isLoading ? (
                        <div className="flex flex-col gap-2" aria-label="Loading research fields">
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-full h-5 rounded" />
                        </div>
                    ) : (
                        <ul className="pt-4 list-none overflow-hidden" role="tree" aria-label="Research field hierarchy">
                            {fieldList(RESOURCES.RESEARCH_FIELD_MAIN)}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default ResearchFieldSelector;
