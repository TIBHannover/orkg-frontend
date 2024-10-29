import useTemplatesRecommendation from 'components/ViewPaper/hooks/useTemplatesRecommendation';
import { AnimationContainer } from 'components/ViewPaper/SmartSuggestions/styled';
import TemplateButton from 'components/ViewPaper/SmartSuggestions/TemplateButton';
import PropTypes from 'prop-types';
import { TransitionGroup } from 'react-transition-group';
import { ListGroup } from 'reactstrap';

function TemplatesRecommendations({ title = '', abstract = '', resourceId }) {
    const { recommendedTemplates, isContributionLevel } = useTemplatesRecommendation({ title, abstract, resourceId });

    return (
        <div>
            {isContributionLevel && recommendedTemplates?.length > 0 && <h6 className="mt-2">Templates</h6>}
            {isContributionLevel && (
                <ListGroup>
                    <TransitionGroup component={null} height="30px">
                        {recommendedTemplates.map((template) => (
                            <AnimationContainer
                                key={`tr${template.id}`}
                                classNames="slide-left"
                                className="d-flex align-items-center"
                                timeout={{ enter: 600, exit: 600 }}
                            >
                                <div>
                                    <TemplateButton template={template} isSmart resourceId={resourceId} />
                                </div>
                            </AnimationContainer>
                        ))}
                    </TransitionGroup>
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
