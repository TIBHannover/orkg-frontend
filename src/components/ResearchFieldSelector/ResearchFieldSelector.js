import { faMinusSquare, faPlusSquare, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Autocomplete from 'components/Autocomplete/Autocomplete';
import { CLASSES, MISC } from 'constants/graphSettings';
import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { resourcesUrl } from 'services/backend/resources';
import { getParentResearchFields, getStatementsBySubjects } from 'services/backend/statements';
import styled from 'styled-components';

const FieldItem = styled(Button)`
    &&& {
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
            background: ${props => props.theme.darkblue};
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
    padding-left: 50px;
`;

const IndicatorContainer = styled.div`
    width: 30px;
    text-align: center;
`;

const ResearchFieldSelector = ({ selectedResearchField, researchFields, updateResearchField }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingId, setLoadingId] = useState(null);

    const handleFieldSelect = selected => {
        setIsLoading(true);
        getParentResearchFields(selected.id).then(async parents => {
            parents = parents.reverse();
            let fields = [...researchFields];

            for (const parent of parents) {
                fields = await getChildFields(parent.id, fields);
            }

            updateResearchField({
                researchFields: fields,
                selectedResearchField: selected.id
            });
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
            selectedResearchField: shouldSetActive ? fieldId : undefined
        };

        updateResearchField(payload);
    };

    const getFieldsByIds = useCallback(async (ids, previousFields = []) => {
        const fields = [...previousFields];
        const subfieldStatements = await getStatementsBySubjects({ ids });

        for (const { id, statements } of subfieldStatements) {
            const hasChildren = statements.length > 0;
            if (hasChildren) {
                statements.map(statement =>
                    fields.push({
                        label: statement.object.label,
                        id: statement.object.id,
                        parent: id,
                        hasChildren: null,
                        isExpanded: false
                    })
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
            const fields = [...previousFields];
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
        [getFieldsByIds]
    );

    useEffect(() => {
        // select the main field is none is selected yet (i.e. first time visiting this step)
        if (!selectedResearchField) {
            const initializeFields = async () => {
                setIsLoading(true);

                let fields = await getFieldsByIds([MISC.RESEARCH_FIELD_MAIN]);
                fields = await getChildFields(MISC.RESEARCH_FIELD_MAIN, fields);

                updateResearchField({
                    researchFields: fields
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
                        <IndicatorContainer onClick={e => handleFieldClick(e, field.id, false)}>
                            {field.hasChildren && (
                                <Icon icon={icon} spin={isLoading} className={selectedResearchField !== field.id ? 'text-darkblue' : ''} />
                            )}
                        </IndicatorContainer>
                        {field.label}
                    </FieldItem>
                    {field.isExpanded && !isLoading && <SubList>{fieldList(field.id)}</SubList>}
                </li>
            );
        });
    };

    let researchFieldLabel;
    if (researchFields && researchFields.length > 0) {
        const field = researchFields.find(rf => rf.id === selectedResearchField);
        researchFieldLabel = field ? field.label : selectedResearchField;
    }

    return (
        <>
            <div className="mb-3">
                <Autocomplete
                    requestUrl={resourcesUrl}
                    optionsClass={CLASSES.RESEARCH_FIELD}
                    placeholder="Search for fields..."
                    onItemSelected={handleFieldSelect}
                    value={selectedResearchField !== MISC.RESEARCH_FIELD_MAIN ? { id: selectedResearchField, label: researchFieldLabel } : null}
                    allowCreate={false}
                    autoLoadOption={true}
                />
            </div>
            {isLoading && (
                <div className="mb-2">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}

            <List>{fieldList(MISC.RESEARCH_FIELD_MAIN)}</List>
        </>
    );
};

ResearchFieldSelector.propTypes = {
    selectedResearchField: PropTypes.string,
    researchFields: PropTypes.array,
    updateResearchField: PropTypes.func
};

export default ResearchFieldSelector;
