import { Button } from '@heroui/react';
import { FC, memo, useState } from 'react';

import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';

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
            <Button
                variant="ghost"
                onPress={() => setIsModalOpen(true)}
                className="!h-auto !min-w-0 !max-w-full !whitespace-normal !bg-transparent !p-0 !text-left text-primary underline-offset-2 hover:!bg-transparent hover:underline"
            >
                {label}
            </Button>
            {isModelOpen && <DataBrowserDialog toggleModal={handleToggleModal} id={id} show isEditMode={isEditable} />}
        </>
    );
};

export default memo(OntologyItem);
