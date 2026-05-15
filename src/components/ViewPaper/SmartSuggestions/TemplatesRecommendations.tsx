import { AnimatePresence, motion } from 'framer-motion';
import { FC } from 'react';

import useTemplatesRecommendation from '@/components/ViewPaper/hooks/useTemplatesRecommendation';
import TemplateButton from '@/components/ViewPaper/SmartSuggestions/TemplateButton';

type TemplatesRecommendationsProps = {
    resourceId: string;
    title?: string;
    abstract?: string;
};

const TemplatesRecommendations: FC<TemplatesRecommendationsProps> = ({ title = '', abstract = '', resourceId }) => {
    const { recommendedTemplates, isContributionLevel } = useTemplatesRecommendation({ title, abstract, resourceId });

    if (!isContributionLevel || !recommendedTemplates?.length) {
        return null;
    }

    return (
        <div className="mt-4 pt-3 border-t border-border">
            <div className="text-sm font-semibold mb-2">Templates</div>
            <div className="flex flex-wrap min-w-0">
                <AnimatePresence>
                    {recommendedTemplates.map((template, index) => (
                        <motion.div
                            key={`tr${template.id}`}
                            className="flex items-center max-w-full min-w-0"
                            initial={{ opacity: 0, x: -30, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: -30, scale: 0.95 }}
                            transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
                        >
                            <TemplateButton template={template} isSmart resourceId={resourceId} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TemplatesRecommendations;
