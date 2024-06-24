import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import useList from 'components/List/hooks/useList';
import ResearchFieldSelectorModal from 'components/ResearchFieldSelector/ResearchFieldSelectorModal';
import { useState } from 'react';
import { Button } from 'reactstrap';
import { Node } from 'services/backend/types';

const EditResearchField = () => {
    const { list, updateList } = useList();
    const [isOpenResearchFieldModal, setIsOpenResearchFieldModal] = useState(false);

    if (!list) {
        return null;
    }

    const handleSelectField = (researchField: Node) => {
        updateList({ research_fields: [researchField] });
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
                        aria-label={`Selected research field: ${list.research_fields[0]?.label ?? 'none'}`}
                    >
                        <Icon icon={faBars} className="text-secondary" /> {list.research_fields[0]?.label ?? 'Research field'}
                    </Button>
                </span>
            </Tippy>
            {isOpenResearchFieldModal && (
                <ResearchFieldSelectorModal isOpen toggle={(v) => setIsOpenResearchFieldModal((v) => !v)} onSelectField={handleSelectField} />
            )}
        </div>
    );
};

export default EditResearchField;
