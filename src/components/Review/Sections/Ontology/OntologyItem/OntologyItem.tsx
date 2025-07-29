import { FC, memo, useState } from 'react';

import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import Button from '@/components/Ui/Button/Button';

type OntologyItemProps = {
    id: string;
    label: string;
    type: string;
    isEditable: boolean;
    handleReloadData: () => void;
};

const OntologyItem: FC<OntologyItemProps> = ({ id, label, type, isEditable, handleReloadData }) => {
    const [isModelOpen, setIsModalOpen] = useState(false);

    const handleToggleModal = () => {
        if (isModelOpen && isEditable && type === 'property') {
            handleReloadData();
        }
        setIsModalOpen((v) => !v);
    };
    return (
        <>
            <Button color="link" className="p-0 text-wrap text-start" style={{ maxWidth: '100%' }} onClick={() => setIsModalOpen(true)}>
                {label}
            </Button>
            {isModelOpen && <DataBrowserDialog toggleModal={handleToggleModal} id={id} label={label} show isEditMode={isEditable} />}
        </>
    );
};

export default memo(OntologyItem);
