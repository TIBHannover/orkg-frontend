import AddStatement from 'components/DataBrowser/components/Body/AddStatement/AddStatement';
import NoData from 'components/DataBrowser/components/Body/NoData/NoData';
import SingleStatement from 'components/DataBrowser/components/Body/Statement/Statement';
import ValuePreviewFactory from 'components/DataBrowser/components/Body/ValuePreviewFactory/ValuePreviewFactory';
import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import useCanEdit from 'components/DataBrowser/hooks/useCanEdit';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import useTemplates from 'components/DataBrowser/hooks/useTemplates';
import { getListPropertiesFromTemplate } from 'components/DataBrowser/utils/dataBrowserUtils';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { groupBy, sortBy } from 'lodash';
import { Fragment, ReactElement } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Predicate, Resource, Statement } from 'services/backend/types';

const Body = () => {
    const { error, entity, statements, isLoadingStatements } = useEntity();
    const { templates } = useTemplates();
    const { newProperties, config } = useDataBrowserState();
    const { isEditMode } = config;
    const scopedNewProperties = entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];
    let existingProperties = Object.keys(groupBy(statements, 'predicate.id'));
    const _newProperties = scopedNewProperties.filter((p) => !existingProperties.includes(p.id));

    existingProperties = [...existingProperties, ...scopedNewProperties.map((p) => p.id)];
    const allRequiredProperties = templates?.map((t) => getListPropertiesFromTemplate(t, true))?.flat() ?? [];
    const requiredProperties = allRequiredProperties.filter((p) => !existingProperties.includes(p.id));

    const _statements2 = groupBy(sortBy(statements, 'predicate.label'), 'predicate.label');

    const { canEdit } = useCanEdit();

    if (error) {
        return null;
    }

    if (isLoadingStatements) {
        return <Skeleton count={2} />;
    }

    const valueWrapper = (children: ReactElement) => <ValuePreviewFactory value={entity as Resource}>{children}</ValuePreviewFactory>;

    return (
        <div>
            <ConditionalWrapper condition={entity && !config.valuesAsLinks && 'classes' in entity} wrapper={valueWrapper}>
                {Object.keys(_statements2).map((g) => (
                    <Fragment key={g}>
                        {entity && _statements2[g].map((s: Statement) => <SingleStatement level={0} key={s.id} statement={s} path={[entity.id]} />)}
                        {canEdit && isEditMode && (
                            <AddStatement predicate={_statements2[g][0].predicate} canDelete={false} showDeleteButton={false} />
                        )}
                    </Fragment>
                ))}
            </ConditionalWrapper>
            {requiredProperties.map((p) => (
                <AddStatement key={p.id} predicate={p as Predicate} canDelete={false} />
            ))}

            {canEdit && _newProperties.map((p) => <AddStatement key={p.id} predicate={p} canDelete />)}

            {Object.keys(_statements2).length === 0 && Object.keys(requiredProperties).length === 0 && scopedNewProperties.length === 0 && <NoData />}
        </div>
    );
};

export default Body;
