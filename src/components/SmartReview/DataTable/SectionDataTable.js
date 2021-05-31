import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DataTableEntity from 'components/SmartReview/DataTable/DataTableEntity';
import SelectEntitiesModal from 'components/SmartReview/DataTable/SelectEntitiesModal';
import { capitalize, orderBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { Button, Table } from 'reactstrap';

const SectionDataTable = ({ section, isEditable = false }) => {
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
        <Table size="sm" bordered>
            <thead className="bg-light">
                <tr>
                    <th width="20%">
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Label</span>
                            {isEditable && (
                                <Button color="secondary" size="sm" onClick={() => handleOpenEditModal('entities')}>
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            )}
                        </div>
                    </th>
                    <th width="20%">
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Property</span>
                            {isEditable && (
                                <Button color="secondary" size="sm" onClick={() => handleOpenEditModal('properties')}>
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
                                <DataTableEntity
                                    id={entityStatement.subject?.id}
                                    label={capitalize(entityStatement.subject?.label)}
                                    type={entityStatement.subject?._class === 'resource' ? 'resource' : 'property'}
                                    isEditable={isEditable}
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
                                <DataTableEntity
                                    id={entityStatement.object?.id}
                                    label={entityStatement.object?.label}
                                    isEditable={isEditable}
                                    type="resource"
                                    sectionId={section.id}
                                />
                            ) : (
                                entityStatement.object?.label
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
            {isOpenEntityModal && <SelectEntitiesModal type={editType} toggle={() => setIsOpenEntityModal(v => !v)} section={section} />}
        </Table>
    );
};

SectionDataTable.propTypes = {
    section: PropTypes.object.isRequired,
    isEditable: PropTypes.bool
};

export default SectionDataTable;
