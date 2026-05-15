import { faCheck, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Chip } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';
import useSWR from 'swr';

import ActionButton from '@/components/ActionButton/ActionButton';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { classesUrl, getClassById } from '@/services/backend/classes';
import { Mentioning } from '@/services/backend/types';

type MentioningItemProps = {
    item: Mentioning;
    isEditMode: boolean;
    onDelete: (id: string) => void;
};

const MentioningItem: FC<MentioningItemProps> = ({ item, isEditMode, onDelete }) => {
    const { data: classes } = useSWR(item.classes.length > 0 ? [item.classes, classesUrl, 'getClassById'] : null, ([classIds]) =>
        Promise.all(classIds.map((_id) => getClassById(_id))),
    );

    return (
        <div className="group flex items-center flex-wrap gap-2 py-2 px-3">
            <DescriptionTooltip id={item.id} _class={ENTITIES.RESOURCE}>
                <span>
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`} target="_blank">
                        {item?.label}
                    </Link>
                </span>
            </DescriptionTooltip>

            {classes &&
                classes.map((_class) => (
                    <Link key={_class.id} href={reverse(ROUTES.CLASS, { id: _class.id })} target="_blank">
                        <Chip size="sm" color="default">
                            {_class.label}
                        </Chip>
                    </Link>
                ))}

            {isEditMode && (
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
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
                </div>
            )}
        </div>
    );
};

export default MentioningItem;
