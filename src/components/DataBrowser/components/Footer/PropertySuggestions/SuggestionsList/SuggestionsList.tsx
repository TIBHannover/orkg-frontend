import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { groupBy } from 'lodash';
import { FC } from 'react';
import styled from 'styled-components';

import { useDataBrowserDispatch, useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { getListPropertiesFromTemplate } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
import { ENTITIES } from '@/constants/graphSettings';
import { Predicate, Template } from '@/services/backend/types';

type SuggestionsListProps = {
    template: Template;
};

const ListGroupItemStyled = styled(ListGroupItem)`
    &.header {
        background: ${(props) => props.theme.lightLighter};
        color: ${(props) => props.theme.primary};
    }
`;

const SuggestionsList: FC<SuggestionsListProps> = ({ template }) => {
    const dispatch = useDataBrowserDispatch();
    const { newProperties } = useDataBrowserState();
    const { entity, statements } = useEntity();
    const scopedNewProperties = entity && entity?.id && entity.id in newProperties ? newProperties[entity.id] : [];

    let existingProperties = Object.keys(groupBy(statements, 'predicate.id'));
    existingProperties = [...existingProperties, ...scopedNewProperties.map((p) => p.id)];
    const allProperties = getListPropertiesFromTemplate(template);
    const properties = allProperties.filter((p) => !existingProperties.includes(p.id));

    if (!entity || properties.length === 0) {
        return null;
    }

    return (
        <>
            <ListGroupItemStyled className="header">{template.label}</ListGroupItemStyled>
            {properties.map((p) => (
                <ListGroupItemStyled
                    action
                    style={{ cursor: 'pointer' }}
                    key={p.id}
                    onClick={() => dispatch({ type: 'ADD_PROPERTY', payload: { predicate: p as Predicate, id: entity.id } })}
                >
                    <DescriptionTooltip id={p.id} _class={ENTITIES.PREDICATE}>
                        <div className="d-flex">
                            <div className="flex-grow-1">
                                <FontAwesomeIcon icon={faPlus} className="me-1 text-muted" /> {p.label}
                            </div>
                        </div>
                    </DescriptionTooltip>
                </ListGroupItemStyled>
            ))}
        </>
    );
};

export default SuggestionsList;
