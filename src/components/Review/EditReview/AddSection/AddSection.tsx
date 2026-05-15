import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup } from '@heroui/react';
import { FC, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import useReview from '@/components/Review/hooks/useReview';
import { ReviewSectionType } from '@/services/backend/types';

type AddSectionProps = {
    index: number;
};

const AddSection: FC<AddSectionProps> = ({ index }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const refToolbar = useRef<HTMLDivElement>(null);
    const { createSection } = useReview();

    const handleShowToolbar = () => {
        setIsToolbarVisible(true);
    };

    const handleAddSection = (sectionType: ReviewSectionType) => {
        setIsToolbarVisible(false);
        createSection({
            atIndex: index,
            sectionType,
        });
    };

    useClickAway(refToolbar, () => {
        setIsToolbarVisible(false);
    });

    return (
        <div className="add relative flex items-center justify-center [&_button]:visible">
            <Button
                variant="ghost"
                isIconOnly
                onPress={handleShowToolbar}
                aria-label="Add section"
                className="!my-[5px] !h-auto !min-w-0 !bg-transparent !p-0 text-[140%] text-secondary hover:!bg-transparent"
            >
                <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
            {isToolbarVisible && (
                <div ref={refToolbar} className="absolute top-[-25px] z-[99]">
                    <ButtonGroup size="sm" variant="secondary">
                        <Button onPress={() => handleAddSection('text')}>Text</Button>
                        <Button onPress={() => handleAddSection('comparison')}>
                            <ButtonGroup.Separator />
                            Comparison
                        </Button>
                        <Button onPress={() => handleAddSection('visualization')}>
                            <ButtonGroup.Separator />
                            Visualization
                        </Button>
                        <Button onPress={() => handleAddSection('resource')}>
                            <ButtonGroup.Separator />
                            Resource
                        </Button>
                        <Button onPress={() => handleAddSection('property')}>
                            <ButtonGroup.Separator />
                            Property
                        </Button>
                        <Button onPress={() => handleAddSection('ontology')}>
                            <ButtonGroup.Separator />
                            Ontology
                        </Button>
                    </ButtonGroup>
                </div>
            )}
        </div>
    );
};

export default AddSection;
