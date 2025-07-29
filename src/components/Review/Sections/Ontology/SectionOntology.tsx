import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { capitalize, orderBy, times } from 'lodash';
import React, { FC, useMemo, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Table } from 'reactstrap';
import useSWR from 'swr';

import useReview from '@/components/Review/hooks/useReview';
import OntologyItem from '@/components/Review/Sections/Ontology/OntologyItem/OntologyItem';
import SelectEntitiesModal from '@/components/Review/Sections/Ontology/SelectEntitiesModal/SelectEntitiesModal';
import Button from '@/components/Ui/Button/Button';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { getReviewPublishedContents, reviewUrl } from '@/services/backend/reviews';
import { getStatements } from '@/services/backend/statements';
import { ReviewSection, Statement } from '@/services/backend/types';

type SectionOntologyProps = {
    section: ReviewSection;
};

const SectionOntology: FC<SectionOntologyProps> = ({ section }) => {
    const [isOpenEntityModal, setIsOpenEntityModal] = useState(false);
    const [editType, setEditType] = useState<'entities' | 'properties' | null>(null);
    const { review } = useReview();
    const { isEditMode } = useIsEditMode();

    const entityIds = section?.entities?.map(({ id }) => id);

    const {
        data: publishedContents,
        isLoading: isLoadingPublishedContents,
        isValidating: isValidatingPublishedContents,
        mutate: mutatePublishedContents,
    } = useSWR(
        review?.published && section.id && review && entityIds
            ? [{ reviewId: review.id, ids: entityIds }, reviewUrl, 'getReviewPublishedContents']
            : null,
        ([params]) => Promise.all(params.ids.map((_id) => getReviewPublishedContents({ reviewId: review!.id, entityId: _id }))),
    );

    const {
        data: liveContents,
        isLoading: isLoadingLiveContents,
        isValidating: isValidatingLiveContents,
        mutate: mutateLiveContents,
    } = useSWR(
        !review?.published && section.id && review && entityIds ? [{ reviewId: review.id, ids: entityIds }, reviewUrl, 'getStatements'] : null,
        ([params]) => Promise.all(params.ids.map((_id) => getStatements({ subjectId: _id }) as Promise<Statement[]>)),
    );

    const handleReloadData = () => {
        mutatePublishedContents();
        mutateLiveContents();
    };

    const isLoading = isLoadingPublishedContents || isLoadingLiveContents || isValidatingPublishedContents || isValidatingLiveContents;

    const entityStatements = useMemo(() => {
        const allStatements = review?.published ? publishedContents?.flatMap(({ statements }) => statements) ?? [] : liveContents?.flat() ?? [];
        const properties = section.predicates ?? [];
        const propertyIds = properties.map((property) => property.id);

        const entities = section.entities?.map((entity) => {
            const statements = orderBy(
                allStatements.filter((statement) => statement.subject.id === entity.id && propertyIds.includes(statement.predicate.id)),
                (statement) => propertyIds.findIndex((element) => element === statement.predicate.id),
            );
            return {
                ...entity,
                statements,
            };
        });
        return entities?.flatMap((entity) => entity.statements);
    }, [liveContents, publishedContents, review?.published, section.entities, section.predicates]);

    const handleOpenEditModal = (type: 'entities' | 'properties') => {
        setEditType(type);
        setIsOpenEntityModal(true);
    };

    return (
        <Table size="sm" bordered responsive>
            <thead className="bg-light">
                <tr>
                    <th style={{ width: '20%' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Label</span>
                            {isEditMode && (
                                <Button color="secondary" size="sm" onClick={() => handleOpenEditModal('entities')} aria-label="Edit labels">
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </Button>
                            )}
                        </div>
                    </th>
                    <th style={{ width: '20%' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span>Property</span>
                            {isEditMode && (
                                <Button color="secondary" size="sm" onClick={() => handleOpenEditModal('properties')} aria-label="Edit properties">
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </Button>
                            )}
                        </div>
                    </th>
                    <th style={{ width: '60%' }} className="align-middle">
                        Value
                    </th>
                </tr>
            </thead>
            <tbody>
                {entityStatements?.map((entityStatement, index) => (
                    <tr key={index}>
                        <td>
                            {!entityStatements[index - 1] ||
                            (entityStatements[index - 1] && entityStatement.subject?.label !== entityStatements[index - 1].subject?.label) ? (
                                <OntologyItem
                                    id={entityStatement.subject?.id}
                                    label={capitalize(entityStatement.subject?.label)}
                                    type={entityStatement.subject?._class === 'resource' ? 'resource' : 'property'}
                                    isEditable={
                                        entityStatement.object?._class === 'resource' && entityStatement.subject?.shared > 1 ? false : isEditMode
                                    }
                                    handleReloadData={handleReloadData}
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
                                        entityStatement.object?._class === 'resource' && entityStatement.subject?.shared > 1 ? false : isEditMode
                                    }
                                    type="resource"
                                    handleReloadData={handleReloadData}
                                />
                            ) : (
                                <ValuePlugins type="literal">{entityStatement.object?.label}</ValuePlugins>
                            )}
                        </td>
                    </tr>
                ))}
                {isLoading &&
                    times(5, (i) => (
                        <tr key={i}>
                            <td>
                                <Skeleton width="100%" />
                            </td>
                            <td>
                                <Skeleton width="100%" />
                            </td>
                            <td>
                                <Skeleton width="100%" />
                            </td>
                        </tr>
                    ))}

                {(!entityStatements || (entityStatements.length === 0 && !isLoading)) && (
                    <tr>
                        <td colSpan={3} className="text-center text-muted font-italic">
                            No entities added
                        </td>
                    </tr>
                )}
            </tbody>
            {isOpenEntityModal && <SelectEntitiesModal type={editType} toggle={() => setIsOpenEntityModal((v) => !v)} section={section} />}
        </Table>
    );
};

export default SectionOntology;
