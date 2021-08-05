import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import OntologyItem from 'components/SmartReview/DataTable/OntologyItem';
import SelectEntitiesModal from 'components/SmartReview/DataTable/SelectEntitiesModal';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { capitalize, orderBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { Button, Table } from 'reactstrap';

const SectionOntology = ({ section, isEditable = false }) => {
    const [isOpenEntityModal, setIsOpenEntityModal] = useState(false);
    const [editType, setEditType] = useState();
    const entityStatements = useMemo(() => {
        if (section?.dataTable) {
            const properties = section.dataTable.properties ?? [];
            const propertyIds = properties.map(property => property.id);

            const entities = section.dataTable.entities.map(entity => {
                const statements = orderBy(entity.statements.filter(statement => propertyIds.includes(statement.predicate.id)), statement =>
                    propertyIds.findIndex(element => element === statement.predicate.id)
                );

                if (!statements || statements.length === 0) {
                    return {
                        ...entity,
                        statements: [
                            {
                                subject: entity,
                                predicate: null,
                                object: null
                            }
                        ]
                    };
                }
                return {
                    ...entity,
                    statements
                };
            });
            return entities.flatMap(entity => entity.statements);
        }
        return [];
    }, [section.dataTable]);

    const handleOpenEditModal = type => {
        setEditType(type);
        setIsOpenEntityModal(true);
    };

    return (
        <Table size="sm" bordered responsive>
            <thead className="bg-light">
                <tr>
                    <th width="20%">
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Label</span>
                            {isEditable && (
                                <Button color="secondary" size="sm" onClick={() => handleOpenEditModal('entities')} aria-label="Edit labels">
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            )}
                        </div>
                    </th>
                    <th width="20%">
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Property</span>
                            {isEditable && (
                                <Button color="secondary" size="sm" onClick={() => handleOpenEditModal('properties')} aria-label="Edit properties">
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            )}
                        </div>
                    </th>
                    <th width="60%" className="align-middle">
                        Value
                    </th>
                </tr>
            </thead>
            <tbody>
                {entityStatements.map((entityStatement, index) => (
                    <tr key={index}>
                        <td>
                            {!entityStatements[index - 1] ||
                            (entityStatements[index - 1] && entityStatement.subject?.label !== entityStatements[index - 1].subject?.label) ? (
                                <OntologyItem
                                    id={entityStatement.subject?.id}
                                    label={capitalize(entityStatement.subject?.label)}
                                    type={entityStatement.subject?._class === 'resource' ? 'resource' : 'property'}
                                    isEditable={
                                        entityStatement.object?._class === 'resource' && entityStatement.subject?.shared > 1 ? false : isEditable
                                    }
                                    sectionId={section.id}
                                />
                            ) : (
                                ''
                            )}
                        </td>
                        <td>
                            {entityStatement.predicate?.label ? (
                                capitalize(entityStatement.predicate?.label)
                            ) : (
                                <em className="text-muted">No data</em>
                            )}
                        </td>
                        <td>
                            {entityStatement.object?._class === 'resource' ? (
                                <OntologyItem
                                    id={entityStatement.object?.id}
                                    label={entityStatement.object?.label}
                                    isEditable={
                                        entityStatement.object?._class === 'resource' && entityStatement.subject?.shared > 1 ? false : isEditable
                                    }
                                    type="resource"
                                    sectionId={section.id}
                                />
                            ) : (
                                <ValuePlugins type="literal">{entityStatement.object?.label}</ValuePlugins>
                            )}
                        </td>
                    </tr>
                ))}
                {entityStatements.length === 0 && (
                    <tr>
                        <td colSpan="3" className="text-center text-muted font-italic">
                            No entities added
                        </td>
                    </tr>
                )}
            </tbody>
            {isOpenEntityModal && <SelectEntitiesModal type={editType} toggle={() => setIsOpenEntityModal(v => !v)} section={section} />}
        </Table>
    );
};

SectionOntology.propTypes = {
    section: PropTypes.object.isRequired,
    isEditable: PropTypes.bool
};

export default SectionOntology;
