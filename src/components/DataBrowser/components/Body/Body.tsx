import { groupBy, sortBy, uniqBy } from 'lodash';
import { Fragment, ReactElement } from 'react';
import Skeleton from 'react-loading-skeleton';

import AddStatement from '@/components/DataBrowser/components/Body/AddStatement/AddStatement';
import NoData from '@/components/DataBrowser/components/Body/NoData/NoData';
import SingleStatement from '@/components/DataBrowser/components/Body/Statement/Statement';
import ValuePreviewFactory from '@/components/DataBrowser/components/Body/ValuePreviewFactory/ValuePreviewFactory';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useListOrdering from '@/components/DataBrowser/hooks/useListOrdering';
import useTemplates from '@/components/DataBrowser/hooks/useTemplates';
import { getListPropertiesFromTemplate, prioritizeDescriptionStatements } from '@/components/DataBrowser/utils/dataBrowserUtils';
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

    const _statements2 = groupBy(sortBy(statements, 'predicate.label'), 'predicate.label');

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
                requiredProperties
                    // Show only description property
                    .filter((p) => p.id === PREDICATES.DESCRIPTION)
                    .map((p) => <AddStatement key={p.id} predicate={p as Predicate} canDelete={false} />)}
            <ConditionalWrapper condition={entity && !config.valuesAsLinks && 'classes' in entity} wrapper={valueWrapper}>
                {prioritizeDescriptionStatements(_statements2).map((g) => (
                    <Fragment key={g}>
                        {entity && _statements2[g].map((s: Statement) => <SingleStatement level={0} key={s.id} statement={s} path={[entity.id]} />)}
                        {canEdit && isEditMode && (
                            <AddStatement predicate={_statements2[g][0].predicate} canDelete={false} showDeleteButton={false} />
                        )}
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

            {Object.keys(_statements2).length === 0 &&
                Object.keys(requiredProperties.filter((p) => p.id !== PREDICATES.DESCRIPTION || isEditMode || entity?._class !== ENTITIES.RESOURCE))
                    .length === 0 &&
                scopedNewProperties.length === 0 && <NoData />}
        </div>
    );
};

export default Body;
