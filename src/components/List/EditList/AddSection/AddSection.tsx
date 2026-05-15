import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup } from '@heroui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import useList from '@/components/List/hooks/useList';
import { LiteratureListSectionType } from '@/services/backend/types';

type AddSectionProps = {
    index: number;
};

const AddSection: FC<AddSectionProps> = ({ index }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const { list, createSection } = useList();
    const refToolbar = useRef<HTMLDivElement>(null);

    useClickAway(refToolbar, () => {
        setIsToolbarVisible(false);
    });

    if (!list) {
        return null;
    }

    const handleAddSection = async (sectionType: LiteratureListSectionType) => {
        setIsToolbarVisible(false);
        createSection({ sectionType, atIndex: index });
    };

    return (
        <div className="add relative flex items-center justify-center">
            <Button
                isIconOnly
                variant="ghost"
                aria-label="Add section"
                onPress={() => setIsToolbarVisible((v) => !v)}
                className="my-1 h-auto min-w-0 bg-transparent p-0 text-2xl text-secondary hover:bg-transparent hover:text-secondary-darker"
            >
                <FontAwesomeIcon icon={faPlusCircle} />
            </Button>
            <AnimatePresence>
                {isToolbarVisible && (
                    <motion.div
                        ref={refToolbar}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute -top-6 left-1/2 -translate-x-1/2"
                    >
                        <ButtonGroup size="sm">
                            <Button variant="secondary" onPress={() => handleAddSection('text')}>
                                Text
                            </Button>
                            <Button variant="secondary" onPress={() => handleAddSection('list')}>
                                List
                            </Button>
                        </ButtonGroup>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddSection;
