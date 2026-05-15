import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Skeleton, Table as HeroUITable, tableVariants } from '@heroui/react';
import { capitalize, orderBy, times } from 'lodash';
import React, { FC, useMemo, useState } from 'react';
import useSWR from 'swr';

import useReview from '@/components/Review/hooks/useReview';
import OntologyItem from '@/components/Review/Sections/Ontology/OntologyItem/OntologyItem';
import SelectEntitiesModal from '@/components/Review/Sections/Ontology/SelectEntitiesModal/SelectEntitiesModal';
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
    const tableSlots = tableVariants({ variant: 'primary' });

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
        const allStatements = review?.published ? (publishedContents?.flatMap(({ statements }) => statements) ?? []) : (liveContents?.flat() ?? []);
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

    const hasLabels = (section.entities?.length ?? 0) > 0;
    const hasProperties = (section.predicates?.length ?? 0) > 0;
    const hasValues = (entityStatements?.length ?? 0) > 0;

    const renderEmptyAlert = () => {
        if (!hasLabels && !hasProperties) {
            return (
                <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>Nothing selected</Alert.Title>
                        <Alert.Description>Select labels and properties to populate this ontology section.</Alert.Description>
                    </Alert.Content>
                </Alert>
            );
        }
        if (hasLabels && !hasProperties) {
            return (
                <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>No properties selected</Alert.Title>
                        <Alert.Description>Labels are selected; pick the properties you want to display for them.</Alert.Description>
                    </Alert.Content>
                </Alert>
            );
        }
        if (hasLabels && hasProperties && !hasValues) {
            return (
                <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>No values to display</Alert.Title>
                        <Alert.Description>Labels and properties are set, but the selected entities have no matching values.</Alert.Description>
                    </Alert.Content>
                </Alert>
            );
        }
        return null;
    };

    return (
        <>
            <HeroUITable className={tableSlots.base()}>
                <table className={tableSlots.content()}>
                    <thead className="table__header">
                        <tr>
                            <th className="table__column w-1/5">
                                <div className="flex items-center justify-between">
                                    <span>Label</span>
                                    {isEditMode && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onPress={() => handleOpenEditModal('entities')}
                                            aria-label="Edit labels"
                                        >
                                            <FontAwesomeIcon icon={faPen} /> Edit
                                        </Button>
                                    )}
                                </div>
                            </th>
                            <th className="table__column w-1/5">
                                <div className="flex items-center justify-between">
                                    <span>Property</span>
                                    {isEditMode && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onPress={() => handleOpenEditModal('properties')}
                                            aria-label="Edit properties"
                                        >
                                            <FontAwesomeIcon icon={faPen} /> Edit
                                        </Button>
                                    )}
                                </div>
                            </th>
                            <th className="table__column w-3/5 align-middle">Value</th>
                        </tr>
                    </thead>
                    <tbody className="table__body">
                        {entityStatements?.map((entityStatement, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <tr key={index} className="table__row">
                                <td className="table__cell">
                                    {!entityStatements[index - 1] ||
                                    (entityStatements[index - 1] && entityStatement.subject?.label !== entityStatements[index - 1].subject?.label) ? (
                                        <OntologyItem
                                            id={entityStatement.subject?.id}
                                            label={capitalize(entityStatement.subject?.label)}
                                            type={entityStatement.subject?._class === 'resource' ? 'resource' : 'property'}
                                            isEditable={
                                                entityStatement.object?._class === 'resource' && entityStatement.subject?.shared > 1
                                                    ? false
                                                    : isEditMode
                                            }
                                            handleReloadData={handleReloadData}
                                        />
                                    ) : (
                                        ''
                                    )}
                                </td>
                                <td className="table__cell">
                                    {entityStatement.predicate?.label ? (
                                        capitalize(entityStatement.predicate?.label)
                                    ) : (
                                        <em className="text-muted">No data</em>
                                    )}
                                </td>
                                <td className="table__cell">
                                    {entityStatement.object?._class === 'resource' ? (
                                        <OntologyItem
                                            id={entityStatement.object?.id}
                                            label={entityStatement.object?.label}
                                            isEditable={
                                                entityStatement.object?._class === 'resource' && entityStatement.subject?.shared > 1
                                                    ? false
                                                    : isEditMode
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
                                <tr key={i} className="table__row">
                                    <td className="table__cell">
                                        <Skeleton className="w-full h-4 rounded" />
                                    </td>
                                    <td className="table__cell">
                                        <Skeleton className="w-full h-4 rounded" />
                                    </td>
                                    <td className="table__cell">
                                        <Skeleton className="w-full h-4 rounded" />
                                    </td>
                                </tr>
                            ))}

                        {(!entityStatements || (entityStatements.length === 0 && !isLoading)) && (
                            <tr className="table__row">
                                <td colSpan={3} className="table__cell p-4">
                                    {renderEmptyAlert()}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </HeroUITable>
            {isOpenEntityModal && <SelectEntitiesModal type={editType} toggle={() => setIsOpenEntityModal((v) => !v)} section={section} />}
        </>
    );
};

export default SectionOntology;
