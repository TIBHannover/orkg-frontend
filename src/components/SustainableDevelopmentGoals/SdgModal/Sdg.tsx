import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';

import { getImage, getSdgNumber } from '@/components/SustainableDevelopmentGoals/helpers';
import Button from '@/components/Ui/Button/Button';
import ROUTES from '@/constants/routes';
import { Node } from '@/services/backend/types';

const SdgStyled = styled.div`
    background-color: #e9ecef;
`;

type SdgProps = {
    sdg: Node;
    label: string;
    onDelete: (sdg: string) => void;
    isEditing?: boolean;
};

const Sdg: FC<SdgProps> = ({ sdg, label, onDelete, isEditing = false }) => (
    <SdgStyled className="p-2 rounded mb-1 d-flex justify-content-between">
        <div className="flex-grow-1">
            <Image
                src={getImage(sdg.id)}
                style={{ width: 45, height: 'auto' }}
                className="rounded"
                alt={`Sustainable Development Goal ${getSdgNumber(sdg.id)}`}
            />
            <Link key={sdg.id} href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg: sdg.id })}>
                <span className="ms-2">
                    {getSdgNumber(sdg.id)}. {sdg.label}
                </span>
            </Link>
        </div>
        {isEditing && (
            <Button color="link" className="p-0 me-2 text-grey" style={{ fontSize: '130%' }} onClick={() => onDelete(sdg.id)}>
                <FontAwesomeIcon icon={faTimes} />
            </Button>
        )}
    </SdgStyled>
);

export default Sdg;
