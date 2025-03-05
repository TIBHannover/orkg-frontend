import { faMinusSquare, faPlusSquare, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import FieldStatistics from 'components/ResearchFieldSelector/FieldStatistics';
import PreviouslySelectedResearchField from 'components/ResearchFieldSelector/PreviouslySelectedResearchField/PreviouslySelectedResearchField';
import SmartSuggestionsFields from 'components/ResearchFieldSelector/SmartSuggestionsFields/SmartSuggestionsFields';
import { CLASSES, ENTITIES, RESOURCES } from 'constants/graphSettings';
import { find, sortBy, uniq } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { Alert, Button } from 'reactstrap';
import { FieldChildren, getFieldChildren, getFieldParents, researchFieldUrl } from 'services/backend/researchFields';
import { getResource, resourcesUrl } from 'services/backend/resources';
import { Node } from 'services/backend/types';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

const FieldItem = styled(Button)`
    &&& {
        // &&& https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
        background: ${(props) => props.theme.light};
        border-radius: 6px;
        padding: 6px 7px;
        margin-bottom: 4px;
        width: 100%;
        text-align: left;
        display: flex;
        text-decoration: none;
        color: inherit;
        transition: none;

        &.active {
            background: ${(props) => props.theme.secondary};
            color: #fff;
        }

        &:focus {
            box-shadow: 0 0 0 0.2rem rgba(232, 97, 97, 0.25);
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
    }
`;

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
    const theme = useTheme();
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

            return (
                <li key={field.id}>
                    <FieldItem onClick={() => handleFieldClick(field)} color="link" className={selectedResearchFieldId === field.id ? 'active' : ''}>
                        <div className="flex-grow-1 d-flex">
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
                                className="w-10 me-2 text-center"
                            >
                                {field.hasChildren && (
                                    <FontAwesomeIcon
                                        icon={icon}
                                        spin={_isLoading}
                                        className={selectedResearchFieldId !== field.id ? 'text-secondary' : ''}
                                    />
                                )}
                            </div>
                            {find(path, (pId) => pId === field.id) ? <b>{field.label}</b> : field.label}
                        </div>
                        {showStatistics && <FieldStatistics field={field} />}
                    </FieldItem>
                    {field.isExpanded && !_isLoading && <ul className="ps-3 list-unstyled">{fieldList(field.id)}</ul>}
                </li>
            );
        });
    };

    return (
        <>
            <div className="mb-3">
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

            <div className="row">
                <div className={`${insideModal ? 'col-12' : 'col-md-4 order-md-2'}`}>
                    <SmartSuggestionsFields handleFieldSelect={handleFieldSelect} title={title} abstract={abstract} />
                    {showPreviouslySelected && (
                        <PreviouslySelectedResearchField selectedResearchField={selectedResearchFieldId} handleFieldSelect={handleFieldSelect} />
                    )}
                </div>

                <div className={`${insideModal || !showPreviouslySelected ? 'col-12' : 'col-md-8 order-md-1'}`}>
                    {!isParentLoading && path.length === 1 && selectedResearchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                        <Alert color="info">This research field is not part of the ORKG taxonomy.</Alert>
                    )}
                    <div className="d-flex">
                        <h3 className="fw-bold h6 mt-1 mb-0">Browse taxonomy</h3>
                        <Button
                            size="sm"
                            color="link"
                            disabled={!find(researchFields, (f) => f.isExpanded)}
                            className="ms-auto text-decoration-none p-0"
                            onClick={() => setResearchFields((v) => v.map((f) => ({ ...f, isExpanded: false })))}
                            aria-label="Collapse all fields"
                            style={{ color: theme.secondary }}
                        >
                            <FontAwesomeIcon icon={faMinusSquare} className="me-1" />
                            <span className="text-decoration-underline">Collapse all</span>
                        </Button>
                    </div>
                    {!researchFields && isLoading ? (
                        <div>
                            <ContentLoader
                                width="100%"
                                speed={2}
                                viewBox="0 0 100 30"
                                style={{ width: '100% !important' }}
                                aria-label="Loading research fields"
                            >
                                <rect x="0" y="0" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="6" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="12" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="18" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="24" rx="1" ry="1" width="100" height="5" />
                            </ContentLoader>
                        </div>
                    ) : (
                        <ul className="pt-3 list-unstyled" role="tree" aria-label="Research field hierarchy">
                            {fieldList(RESOURCES.RESEARCH_FIELD_MAIN)}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
};

export default ResearchFieldSelector;
