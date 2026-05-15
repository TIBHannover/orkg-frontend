import { faEllipsis, faPen } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import { getImage, getSdgNumber, sortSdgs } from '@/components/SustainableDevelopmentGoals/helpers';
import SdgModal from '@/components/SustainableDevelopmentGoals/SdgModal/SdgModal';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Node } from '@/services/backend/types';

type SdgBoxProps = {
    handleSave: (sdgs: Node[]) => void;
    sdgs?: Node[];
    maxWidth?: number | string;
    maxItems?: number;
    isEditable?: boolean;
};

const SdgBox: FC<SdgBoxProps> = ({ handleSave, sdgs = [], maxWidth = 200, maxItems = 4, isEditable = false }) => {
    const [isOpenModal, setIsOpenModal] = useState(false);

    if (sdgs.length === 0 && !isEditable) {
        return null;
    }

    const visibleSdgs = sortSdgs(sdgs).slice(0, maxItems);
    const showAction = sdgs.length > maxItems || isEditable;

    return (
        <div className="inline-flex items-center gap-2 p-1 border border-default rounded-md bg-surface" style={{ maxWidth }}>
            {sdgs.length === 0 && <span className="text-gray-500 italic text-sm px-2">No SDGs assigned</span>}
            {visibleSdgs.map((sdg) => (
                <Link
                    href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg: sdg.id })}
                    key={sdg.id}
                    className="relative block shrink-0 transition-[scale,z-index] duration-200 ease-in-out hover:scale-[1.8] hover:z-30"
                >
                    <Image
                        src={getImage(sdg.id)}
                        style={{ width: 56, height: 'auto' }}
                        className="rounded block"
                        alt={`Sustainable Development Goal ${getSdgNumber(sdg.id)}`}
                    />
                </Link>
            ))}
            {showAction && (
                <div className="ml-auto shrink-0">
                    <ActionButton
                        title={isEditable ? 'Edit SDGs' : 'Show all SDGs'}
                        icon={isEditable ? faPen : faEllipsis}
                        action={() => setIsOpenModal(true)}
                    />
                </div>
            )}
            {isOpenModal && <SdgModal toggle={() => setIsOpenModal((v) => !v)} sdgs={sdgs} handleSave={handleSave} isEditing={isEditable} />}
        </div>
    );
};

export default SdgBox;
