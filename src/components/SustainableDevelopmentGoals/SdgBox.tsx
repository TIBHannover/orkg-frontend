import { faEllipsis, faPen } from '@fortawesome/free-solid-svg-icons';
import Image from 'components/NextJsMigration/Image';
import Link from 'components/NextJsMigration/Link';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import SdgModal from 'components/SustainableDevelopmentGoals/SdgModal/SdgModal';
import { getImage, getSdgNumber, sortSdgs } from 'components/SustainableDevelopmentGoals/helpers';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FC, useState } from 'react';
import { Node } from 'services/backend/types';
import styled from 'styled-components';

const Box = styled.div`
    border: 1px solid ${(props) => props.theme.lightDarker};
    border-radius: ${(props) => props.theme.borderRadius};
`;

const SdgStyled = styled(Link)`
    transition: transform 0.2s ease-in-out;
    &:hover {
        transform: scale(1.8);
        z-index: 30 !important;
    }
`;

type SdgBoxProps = {
    handleSave: (sdgs: Node[]) => void;
    sdgs?: Node[];
    maxWidth?: number | string;
    maxItems?: number;
    isEditable?: boolean;
};

const SdgBox: FC<SdgBoxProps> = ({ handleSave, sdgs = [], maxWidth = 200, maxItems = 4, isEditable = false }) => {
    const [isOpenModal, setIsOpenModal] = useState(false);

    return (
        (sdgs.length > 0 || isEditable) && (
            <Box className="p-1 pb-0 pe-0 d-flex mb-2 flex-wrap" style={{ maxWidth }}>
                {sdgs.length === 0 && <span className="text-muted ms-2 fst-italic">No SDGs assigned</span>}
                {sortSdgs(sdgs)
                    .slice(0, maxItems)
                    .map((sdg) => (
                        // @ts-expect-error
                        <SdgStyled
                            href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg: sdg.id })}
                            className="position-relative position-relative me-1 mb-1"
                            key={sdg.id}
                        >
                            <Image
                                src={getImage(sdg.id)}
                                style={{ width: 65, height: 'auto' }}
                                className="rounded"
                                alt={`Sustainable Development Goal ${getSdgNumber(sdg.id)}`}
                            />
                        </SdgStyled>
                    ))}
                <div className="d-flex flex-column justify-content-around ms-2 mb-1">
                    {(sdgs.length > maxItems || isEditable) && (
                        <ActionButtonView
                            // @ts-expect-error
                            icon={isEditable ? faPen : faEllipsis}
                            action={() => setIsOpenModal(true)}
                            isDisabled={false}
                            title="Edit"
                        />
                    )}
                </div>
                {isOpenModal && <SdgModal toggle={() => setIsOpenModal((v) => !v)} sdgs={sdgs} handleSave={handleSave} isEditing={isEditable} />}
            </Box>
        )
    );
};

export default SdgBox;
