import { groupBy, uniqBy } from 'lodash';
import { Fragment, ReactElement } from 'react';
import Skeleton from 'react-loading-skeleton';

import AddStatement from '@/components/DataBrowser/components/Body/AddStatement/AddStatement';
import NoData from '@/components/DataBrowser/components/Body/NoData/NoData';
import SingleStatement from '@/components/DataBrowser/components/Body/Statement/Statement';
import ValuePreviewFactory from '@/components/DataBrowser/components/Body/ValuePreviewFactory/ValuePreviewFactory';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useComparisonRecommendations from '@/components/DataBrowser/hooks/useComparisonRecommendations';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useListOrdering from '@/components/DataBrowser/hooks/useListOrdering';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';
import { Predicate, Resource, Statement } from '@/services/backend/types';

const Body = () => {
    const { error, entity, statements, isLoadingStatements, mutateStatements } = useEntity();

    const { templates } = useTemplates();
    const { newProperties, config } = useDataBrowserState();
    const { isEditMode } = config;
    const scopedNewProperties = entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];
    let existingProperties = Object.keys(groupBy(statements, 'predicate.id'));
    const _newProperties = scopedNewProperties.filter((p) => !existingProperties.includes(p.id));

    existingProperties = [...existingProperties, ...scopedNewProperties.map((p) => p.id)];
    const allRequiredProperties = templates?.map((t) => getListPropertiesFromTemplate(t, true))?.flat() ?? [];

    const requiredProperties = uniqBy(
        allRequiredProperties.filter((p) => !existingProperties.includes(p.id)),
        'id',
    );

    const { statementsOrdered, visibleProperties } = useComparisonRecommendations({ statements });

    const { canEdit } = useCanEdit();

    useListOrdering({
        statements,
        entity,
        isEditMode,
        mutateStatements,
    });

    if (error) {
        return null;
    }

    if (isLoadingStatements) {
        return <Skeleton count={2} />;
    }

    const valueWrapper = (children: ReactElement) => <ValuePreviewFactory value={entity as Resource}>{children}</ValuePreviewFactory>;

    return (
        <div>
            {/* for resource entity show only description property if in edit mode and can edit */}
            {((entity?._class === ENTITIES.RESOURCE && isEditMode && canEdit) || entity?._class !== ENTITIES.RESOURCE) &&
                config.showFooter &&
                requiredProperties
                    // Show only description property
                    .filter((p) => p.id === PREDICATES.DESCRIPTION)
                    .map((p) => <AddStatement key={p.id} predicate={p as Predicate} canDelete={false} />)}
            <ConditionalWrapper condition={entity && !config.valuesAsLinks && 'classes' in entity} wrapper={valueWrapper}>
                {statementsOrdered.map((g) => (
                    <Fragment key={g.predicate.id}>
                        {entity &&
                            g.statements.map((s: Statement) => (
                                <SingleStatement
                                    level={0}
                                    key={s.id}
                                    statement={s}
                                    path={[entity.id]}
                                    isHiddenInComparison={!visibleProperties.find((predicateId) => predicateId === g.predicate.id)}
                                />
                            ))}
                        {canEdit && isEditMode && <AddStatement predicate={g.predicate} canDelete={false} showDeleteButton={false} />}
                    </Fragment>
                ))}
            </ConditionalWrapper>
            {requiredProperties
                // Show all properties except description
                .filter((p) => p.id !== PREDICATES.DESCRIPTION)
                .map((p) => (
                    <AddStatement key={p.id} predicate={p as Predicate} canDelete={false} />
                ))}

            {canEdit && _newProperties.map((p) => <AddStatement key={p.id} predicate={p} canDelete />)}

            {statementsOrdered.length === 0 &&
                requiredProperties.filter((p) => p.id !== PREDICATES.DESCRIPTION || (isEditMode && canEdit) || entity?._class !== ENTITIES.RESOURCE)
                    .length === 0 &&
                scopedNewProperties.length === 0 && <NoData />}
        </div>
    );
};

export default Body;
