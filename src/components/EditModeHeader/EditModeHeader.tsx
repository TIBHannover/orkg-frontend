import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode } from 'react';

import Container from '@/components/Ui/Structure/Container';

type EditModeHeaderProps = {
    isVisible: boolean;
    message?: string | ReactNode;
};

const EditModeHeader = ({ isVisible, message = null }: EditModeHeaderProps) => (
    <AnimatePresence>
        {isVisible && (
            <motion.div
                className="overflow-hidden"
                initial={{ maxHeight: 0 }}
                animate={{ maxHeight: 50 }}
                exit={{ maxHeight: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <Container>
                    <div className="rounded-t bg-secondary-solid text-white flex items-center py-2 px-4 md:px-12 shadow-[0_-2px_4px_0_rgb(0_0_0/13%)] relative z-[1]">
                        <div className="text-base sm:text-[1.1rem] grow truncate">
                            {!message ? (
                                <>
                                    Edit mode{' '}
                                    <span className="text-sm text-white/70 pl-2 hidden sm:inline">Every change you make is automatically saved</span>
                                </>
                            ) : (
                                message
                            )}
                        </div>
                    </div>
                </Container>
            </motion.div>
        )}
    </AnimatePresence>
);

export default EditModeHeader;
