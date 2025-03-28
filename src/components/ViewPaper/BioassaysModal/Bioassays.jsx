import { faFlask } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'reactstrap';

import BioassaysModal from '@/components/ViewPaper/BioassaysModal/BioassaysModal';
import { BIOASSAYS_FIELDS_LIST } from '@/constants/nlpFieldLists';

const Bioassays = ({ resourceId }) => {
    const [isOpenBioassays, setIsOpenBioassays] = useState(false);
    const researchFieldId = useSelector((state) => state.viewPaper.paper.research_fields?.[0])?.id ?? null;
    const isBioassayField = BIOASSAYS_FIELDS_LIST.includes(researchFieldId);

    return isBioassayField ? (
        <>
            <Button onClick={() => setIsOpenBioassays((v) => !v)} outline size="sm" color="smart">
                <FontAwesomeIcon icon={faFlask} /> Add Bioassay
            </Button>
            <BioassaysModal selectedResource={resourceId} showDialog={isOpenBioassays} toggle={() => setIsOpenBioassays((v) => !v)} />
        </>
    ) : null;
};

Bioassays.propTypes = {
    resourceId: PropTypes.string.isRequired,
};

export default Bioassays;
