import { motion } from 'framer-motion';
import { FC } from 'react';

import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import PaperMenuBar from '@/components/ViewPaper/PaperHeaderBar/PaperMenuBar';

type PaperHeaderBarProps = {
    editMode: boolean;
    disableEdit: boolean;
    toggle: (key: string) => void;
};

const PaperHeaderBar: FC<PaperHeaderBarProps> = ({ editMode, disableEdit, toggle }) => {
    const { resourceId } = useParams();
    const { paper } = useViewPaper({ paperId: resourceId });

    return (
        <motion.div
            className="overflow-hidden"
            initial={{ maxHeight: 0 }}
            animate={{ maxHeight: 60 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div
                id="paperHeaderBar"
                className="fixed top-[72px] inset-x-0 z-[1000] bg-surface-secondary border-b border-border shadow-[0_2px_8px_-2px_rgba(0,0,0,0.13)]"
            >
                <Container className="flex items-center py-2 gap-3">
                    <div className="grow truncate text-secondary-darker">
                        {editMode ? (
                            <>
                                Edit mode <span className="pl-2">Every change you make is automatically saved</span>
                            </>
                        ) : (
                            paper?.title || ''
                        )}
                    </div>
                    <div className="action-bar inline-flex shrink-0 items-center">
                        <PaperMenuBar disableEdit={disableEdit} editMode={editMode} toggle={toggle} />
                    </div>
                </Container>
            </div>
        </motion.div>
    );
};

export default PaperHeaderBar;
