import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import { Badge, ListGroupItem } from 'reactstrap';
import styled from 'styled-components';
import useSWR from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { classesUrl, getClassById } from '@/services/backend/classes';
import { Mentioning } from '@/services/backend/types';

type MentioningItemProps = {
    item: Mentioning;
    isEditMode: boolean;
    onDelete: (id: string) => void;
};
type ButtonsContainerProps = {
    displayButtonOnHover: boolean;
};
const ItemContainer = styled.div`
    line-height: 27px;
    &:hover .item-buttons {
        display: inline-block;
    }
`;
const ButtonsContainer = styled.div<ButtonsContainerProps>`
    display: ${(props) => (props.displayButtonOnHover ? 'none' : 'inline-block')};
`;

const MentioningItem: FC<MentioningItemProps> = ({ item, isEditMode, onDelete }) => {
    const { data: classes } = useSWR(item.classes.length > 0 ? [item.classes, classesUrl, 'getClassById'] : null, ([classIds]) =>
        Promise.all(classIds.map((_id) => getClassById(_id))),
    );

    return (
        <ListGroupItem>
            <ItemContainer>
                <DescriptionTooltip id={item.id} _class={ENTITIES.RESOURCE}>
                    <span>
                        <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`} target="_blank">
                            {item?.label}
                        </Link>
                    </span>
                </DescriptionTooltip>

                <small>
                    {classes &&
                        classes.map((_class) => (
                            <Link key={_class.id} href={reverse(ROUTES.CLASS, { id: _class.id })} target="_blank">
                                <Badge color="light" size="sm" className="ms-2">
                                    {_class.label}
                                </Badge>
                            </Link>
                        ))}
                </small>

                {isEditMode && (
                    <ButtonsContainer className="item-buttons ms-2" displayButtonOnHover>
                        <ActionButton
                            title="Delete resource"
                            icon={faTrash}
                            requireConfirmation
                            confirmationMessage="Are you sure to delete?"
                            confirmationButtons={[
                                {
                                    title: 'Delete',
                                    color: 'danger',
                                    icon: faCheck,
                                    action: () => onDelete(item.id),
                                },
                                {
                                    title: 'Cancel',
                                    color: 'secondary',
                                    icon: faTimes,
                                },
                            ]}
                        />
                    </ButtonsContainer>
                )}
            </ItemContainer>
        </ListGroupItem>
    );
};

export default MentioningItem;
