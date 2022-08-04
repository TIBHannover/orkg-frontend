import { useCallback, useEffect, useState } from 'react';
import { Button, Badge } from 'reactstrap';
import { faMinusSquare, faPlusSquare, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import PreviouslySelectedResearchField from 'components/PreviouslySelectedResearchField/PreviouslySelectedResearchField';
import { CLASSES, RESOURCES, ENTITIES } from 'constants/graphSettings';
import { sortBy, find, set, cloneDeep } from 'lodash';
import { getParentResearchFields, getStatementsBySubjects } from 'services/backend/statements';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';

const FieldItem = styled(Button)`
    &&& {
        // &&& https://styled-components.com/docs/faqs#how-can-i-override-styles-with-higher-specificity
        background: ${props => props.theme.light};
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
            background: ${props => props.theme.secondary};
            color: #fff;
        }
    }
`;

const List = styled.ul`
    list-style: none;
    padding: 10px 0 0 0;
`;

const SubList = styled.ul`
    list-style: none;
    padding-left: 20px;
`;

const IndicatorContainer = styled.div`
    width: 20px;
    margin-right: 5px;
    text-align: center;
`;

const CollapseButton = styled(Button)`
    && {
        color: ${props => props.theme.secondary};
    }
`;

const ResearchFieldSelector = ({
    selectedResearchField,
    researchFields,
    updateResearchField,
    researchFieldStats,
    insideModal,
    showPreviouslySelected,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);

    const handleFieldSelect = (selected, submit = false) => {
        setIsLoading(true);
        getParentResearchFields(selected.id).then(async parents => {
            parents = parents.reverse();
            let fields = cloneDeep(researchFields);

            for (const parent of parents) {
                fields = await getChildFields(parent.id, fields);
            }

            updateResearchField(
                {
                    researchFields: fields,
                    selectedResearchField: selected.id,
                    selectedResearchFieldLabel: selected.label,
                },
                submit,
            );
            setIsLoading(false);
        });
    };

    const handleFieldClick = async (e, fieldId, shouldSetActive = true) => {
        // prevent triggering outer handler when the icon is pressed
        e.stopPropagation();
        setLoadingId(fieldId);
        const fields = await getChildFields(fieldId, researchFields, true);
        setLoadingId(null);

        const payload = {
            researchFields: fields,
            selectedResearchField: shouldSetActive ? fieldId : undefined,
        };

        updateResearchField(payload);
    };

    const getFieldsByIds = useCallback(async (ids, previousFields = []) => {
        const fields = cloneDeep(previousFields);
        const subfieldStatements = await getStatementsBySubjects({ ids });

        for (const { id, statements } of subfieldStatements) {
            const hasChildren = statements.length > 0;
            if (hasChildren) {
                statements.map(statement =>
                    statement.object.classes && statement.object.classes.length && statement.object.classes.includes(CLASSES.RESEARCH_FIELD) // Make sure that the object is research field
                        ? fields.push({
                              label: statement.object.label,
                              id: statement.object.id,
                              parent: id,
                              hasChildren: null,
                              isExpanded: false,
                          })
                        : {},
                );
            }

            const fieldIndex = fields.findIndex(field => field.id === id);
            if (fieldIndex !== -1) {
                fields[fieldIndex].hasChildren = hasChildren;
            }
        }
        return sortBy(fields, ['label']);
    }, []);

    const getChildFields = useCallback(
        async (fieldId, previousFields, toggleExpand = false) => {
            const fields = cloneDeep(previousFields);
            const fieldIndex = fields.findIndex(field => field.id === fieldId);

            if (fieldIndex !== -1) {
                const field = fields[fieldIndex];
                // don't toggle if the search input is used, always expand
                fields[fieldIndex].isExpanded = toggleExpand ? !field.isExpanded : true;
            }

            const children = fields.filter(field => field.parent === fieldId && field.hasChildren === null);
            const childrenIds = children.map(field => field.id);

            if (!childrenIds.length) {
                return fields;
            }

            return await getFieldsByIds(childrenIds, fields);
        },
        [getFieldsByIds],
    );

    useEffect(() => {
        // select the main field is none is selected yet (i.e. first time visiting this step)
        if (!selectedResearchField) {
            const initializeFields = async () => {
                setIsLoading(true);

                let fields = await getFieldsByIds([RESOURCES.RESEARCH_FIELD_MAIN]);
                fields = await getChildFields(RESOURCES.RESEARCH_FIELD_MAIN, fields);

                updateResearchField({
                    researchFields: fields,
                });
                setIsLoading(false);
            };
            initializeFields();
        }
    }, [getChildFields, getFieldsByIds, selectedResearchField, updateResearchField]);

    const fieldList = selectedField => {
        const subFields = researchFields.filter(field => field.parent === selectedField);
        if (subFields.length === 0) {
            return null;
        }
        return subFields.map(field => {
            const isLoading = loadingId === field.id;
            let icon;
            if (isLoading) {
                icon = faSpinner;
            } else if (field.isExpanded) {
                icon = faMinusSquare;
            } else {
                icon = faPlusSquare;
            }

            return (
                <li key={field.id}>
                    <FieldItem onClick={e => handleFieldClick(e, field.id)} color="link" className={selectedResearchField === field.id && 'active'}>
                        <div className="flex-grow-1 d-flex">
                            <IndicatorContainer onClick={e => handleFieldClick(e, field.id, false)}>
                                {field.hasChildren && (
                                    <Icon icon={icon} spin={isLoading} className={selectedResearchField !== field.id ? 'text-secondary' : ''} />
                                )}
                            </IndicatorContainer>
                            {find(parents, p => p.id === field.id) ? <b>{field.label}</b> : field.label}
                        </div>
                        {researchFieldStats && (
                            <div className="justify-content-end">
                                <Badge color="light" pill>
                                    {researchFieldStats[field.id]}
                                </Badge>
                            </div>
                        )}
                    </FieldItem>
                    {field.isExpanded && !isLoading && <SubList>{fieldList(field.id)}</SubList>}
                </li>
            );
        });
    };

    const getParents = (field, parents) => {
        const f = field ? find(researchFields, f => f.id === field.parent) : null;
        if (f) {
            parents.push(f);
            return getParents(f, parents);
        }
        return parents;
    };

    let researchFieldLabel;
    let parents = [];
    if (researchFields && researchFields.length > 0) {
        const field = researchFields.find(rf => rf.id === selectedResearchField);
        researchFieldLabel = field ? field.label : selectedResearchField;
        parents = getParents(field, []);
    }

    return (
        <>
            <div className="mb-3">
                <Autocomplete
                    entityType={ENTITIES.RESOURCE}
                    optionsClass={CLASSES.RESEARCH_FIELD}
                    placeholder="Search for fields..."
                    onItemSelected={handleFieldSelect}
                    value={selectedResearchField !== RESOURCES.RESEARCH_FIELD_MAIN ? { id: selectedResearchField, label: researchFieldLabel } : null}
                    allowCreate={false}
                    ols={false}
                    autoLoadOption={true}
                />
            </div>

            <div className="row">
                {showPreviouslySelected && (
                    <div className={`${insideModal ? 'col-12' : 'col-md-4 order-md-2'}`}>
                        <PreviouslySelectedResearchField selectedResearchField={selectedResearchField} handleFieldSelect={handleFieldSelect} />
                    </div>
                )}

                <div className={`${insideModal || !showPreviouslySelected ? 'col-12' : 'col-md-8 order-md-1'}`}>
                    <CollapseButton
                        size="sm"
                        color="link"
                        disabled={!find(researchFields, f => f.isExpanded)}
                        className="float-end pe-0 text-decoration-none"
                        onClick={() => {
                            const fields = cloneDeep(researchFields);
                            updateResearchField({
                                researchFields: fields.map(f => set(f, 'isExpanded', false)),
                            });
                        }}
                    >
                        <Icon icon={faMinusSquare} /> <span className="text-decoration-underline">Collapse all</span>
                    </CollapseButton>
                    {isLoading && (
                        <div>
                            <ContentLoader
                                width="100%"
                                speed={2}
                                viewBox="0 0 100 30"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="6" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="12" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="18" rx="1" ry="1" width="100" height="5" />
                                <rect x="0" y="24" rx="1" ry="1" width="100" height="5" />
                            </ContentLoader>
                        </div>
                    )}
                    <List>{fieldList(RESOURCES.RESEARCH_FIELD_MAIN)}</List>
                </div>
            </div>
        </>
    );
};

ResearchFieldSelector.propTypes = {
    selectedResearchField: PropTypes.string,
    researchFields: PropTypes.array,
    updateResearchField: PropTypes.func,
    researchFieldStats: PropTypes.object,
    insideModal: PropTypes.bool.isRequired,
    showPreviouslySelected: PropTypes.bool.isRequired,
};

ResearchFieldSelector.defaultProps = {
    insideModal: false,
    showPreviouslySelected: true,
};

export default ResearchFieldSelector;
