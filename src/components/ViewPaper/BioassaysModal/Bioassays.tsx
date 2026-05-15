import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { FC, useState } from 'react';

import useParams from '@/components/useParams/useParams';
import BioassaysModal from '@/components/ViewPaper/BioassaysModal/BioassaysModal';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { BIOASSAYS_FIELDS_LIST } from '@/constants/nlpFieldLists';

type BioassaysProps = {
    resourceId: string;
};

const Bioassays: FC<BioassaysProps> = ({ resourceId }) => {
    const [isOpenBioassays, setIsOpenBioassays] = useState(false);
    const { resourceId: paperId } = useParams();
    const { paper } = useViewPaper({ paperId });
    const researchFieldId = paper?.research_fields?.[0]?.id ?? null;
    const isBioassayField = BIOASSAYS_FIELDS_LIST.includes(researchFieldId ?? '');

    if (!isBioassayField) {
        return null;
    }

    return (
        <>
            <Button onPress={() => setIsOpenBioassays((v) => !v)} variant="outline" size="sm" className="button--orkg-smart w-full">
                <FontAwesomeIcon icon={faFlask} className="mr-1" /> Add Bioassay
            </Button>
            {isOpenBioassays && (
                <BioassaysModal selectedResource={resourceId} showDialog={isOpenBioassays} toggle={() => setIsOpenBioassays((v) => !v)} />
            )}
        </>
    );
};

export default Bioassays;
