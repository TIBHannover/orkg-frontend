import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { ListGroup } from 'reactstrap';

import useTemplatesRecommendation from '@/components/ViewPaper/hooks/useTemplatesRecommendation';
import TemplateButton from '@/components/ViewPaper/SmartSuggestions/TemplateButton';

function TemplatesRecommendations({ title = '', abstract = '', resourceId }) {
    const { recommendedTemplates, isContributionLevel } = useTemplatesRecommendation({ title, abstract, resourceId });

    return (
        <div>
            {isContributionLevel && recommendedTemplates?.length > 0 && <h6 className="mt-2">Templates</h6>}
            {isContributionLevel && (
                <ListGroup>
                    <AnimatePresence>
                        {recommendedTemplates.map((template, index) => (
                            <motion.div
                                key={`tr${template.id}`}
                                className="d-flex align-items-center"
                                initial={{ opacity: 0, x: -100, marginBottom: -40 }}
                                animate={{ opacity: 1, x: 0, marginBottom: 0 }}
                                exit={{ opacity: 0, x: -100, marginBottom: -39 }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                            >
                                <div>
                                    <TemplateButton template={template} isSmart resourceId={resourceId} />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </ListGroup>
            )}
        </div>
    );
}

TemplatesRecommendations.propTypes = {
    resourceId: PropTypes.string.isRequired,
    title: PropTypes.string,
    abstract: PropTypes.string,
};

export default TemplatesRecommendations;
