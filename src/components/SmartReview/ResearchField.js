import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { setResearchField } from 'actions/smartReview';
import ResearchFieldSelectorModal from 'components/ResearchFieldSelector/ResearchFieldSelectorModal';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';

const ResearchField = () => {
    const researchField = useSelector(state => state.smartReview.researchField);
    const paper = useSelector(state => state.smartReview.paper);
    const dispatch = useDispatch();
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);

    const handleSelectField = researchField => {
        dispatch(
            setResearchField({
                researchField,
                statementId: researchField?.statementId,
                paperId: paper.id
            })
        );
    };

    return (
        <div>
            <Tippy content="Research field">
                <span>
                    <Button
                        size="sm"
                        color="light"
                        className="me-2 mb-2"
                        onClick={() => setIsOpenResearchFieldModal(true)}
                        aria-label={`Selected research field: ${researchField?.label ?? 'none'}`}
                    >
                        <Icon icon={faBars} className="text-secondary" /> {researchField?.label ?? 'Research field'}
                    </Button>
                </span>
            </Tippy>
            {isOpenResearchFieldModal && (
                <ResearchFieldSelectorModal isOpen toggle={v => setIsOpenResearchFieldModal(v => !v)} onSelectField={handleSelectField} />
            )}
        </div>
    );
};

export default ResearchField;
