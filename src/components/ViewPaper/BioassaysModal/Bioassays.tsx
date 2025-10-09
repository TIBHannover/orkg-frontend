import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';

import Button from '@/components/Ui/Button/Button';
import BioassaysModal from '@/components/ViewPaper/BioassaysModal/BioassaysModal';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { BIOASSAYS_FIELDS_LIST } from '@/constants/nlpFieldLists';

type BioassaysProps = {
    resourceId: string;
};

const Bioassays: FC<BioassaysProps> = ({ resourceId }) => {
    const [isOpenBioassays, setIsOpenBioassays] = useState(false);
    const { paper } = useViewPaper({ paperId: resourceId });
    const researchFieldId = paper?.research_fields?.[0]?.id ?? null;
    const isBioassayField = BIOASSAYS_FIELDS_LIST.includes(researchFieldId ?? '');

    return isBioassayField ? (
        <>
            <Button onClick={() => setIsOpenBioassays((v) => !v)} outline size="sm" color="smart">
                <FontAwesomeIcon icon={faFlask} /> Add Bioassay
            </Button>
            <BioassaysModal selectedResource={resourceId} showDialog={isOpenBioassays} toggle={() => setIsOpenBioassays((v) => !v)} />
        </>
    ) : null;
};

export default Bioassays;
