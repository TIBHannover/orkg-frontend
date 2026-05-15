import { faTimes } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import { getImage, getSdgNumber } from '@/components/SustainableDevelopmentGoals/helpers';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Node } from '@/services/backend/types';

type SdgProps = {
    sdg: Node;
    label: string;
    onDelete: (sdg: string) => void;
    isEditing?: boolean;
};

const Sdg: FC<SdgProps> = ({ sdg, label, onDelete, isEditing = false }) => (
    <div className="p-2 rounded mb-1 flex justify-between items-center bg-default">
        <div className="grow flex items-center gap-2">
            <Image
                src={getImage(sdg.id)}
                style={{ width: 45, height: 'auto' }}
                className="rounded shrink-0"
                alt={`Sustainable Development Goal ${getSdgNumber(sdg.id)}`}
            />
            <Link key={sdg.id} href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg: sdg.id })}>
                <span>
                    {getSdgNumber(sdg.id)}. {sdg.label}
                </span>
            </Link>
        </div>
        {isEditing && <ActionButton title="Remove SDG" icon={faTimes} action={() => onDelete(sdg.id)} />}
    </div>
);

export default Sdg;
