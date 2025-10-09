import { motion } from 'motion/react';
import React, { FC, useState } from 'react';

import Alert from '@/components/Ui/Alert/Alert';
import { CLASSES, ENTITIES } from '@/constants/graphSettings';
import { Thing } from '@/services/backend/things';

type ComparisonSupportWarningProps = {
    selectedEntities: Thing[];
    dismissible?: boolean;
};

const ComparisonSupportWarning: FC<ComparisonSupportWarningProps> = ({ selectedEntities, dismissible = false }) => {
    const isPaper = selectedEntities.find((s) => s._class === ENTITIES.RESOURCE && 'classes' in s && s.classes?.includes(CLASSES.PAPER));

    const [isOpen, setIsOpen] = useState(true);

    if (!isPaper) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
        >
            <Alert color="warning" className="mt-4" isOpen={isOpen || !dismissible} toggle={dismissible ? () => setIsOpen(!isOpen) : undefined}>
                <b>Comparisons</b> can only be made between contributions. Please select contributions from the paper instead of the entire paper.
            </Alert>
        </motion.div>
    );
};

export default ComparisonSupportWarning;
