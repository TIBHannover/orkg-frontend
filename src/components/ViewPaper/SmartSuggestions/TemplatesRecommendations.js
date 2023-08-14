import TemplateButton from 'components/StatementBrowser/TemplatesModal/TemplateButton/TemplateButton';
import { AnimationContainer } from 'components/ViewPaper/SmartSuggestions/styled';
import useTemplatesRecommendation from 'components/ViewPaper/hooks/useTemplatesRecommendation';
import { CLASSES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { ListGroup } from 'reactstrap';

function TemplatesRecommendations({ target, title = '', abstract = '' }) {
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);

    const isContributionLevel = useSelector(
        state => selectedResource && state.statementBrowser.resources.byId[selectedResource]?.classes?.includes(CLASSES.CONTRIBUTION),
    );
    const { recommendedTemplates } = useTemplatesRecommendation({ title, abstract });

    return (
        <div>
            {isContributionLevel && recommendedTemplates?.length > 0 && <h6 className="mt-2">Templates</h6>}
            {isContributionLevel && (
                <ListGroup>
                    <TransitionGroup component={null} height="30px">
                        {recommendedTemplates.map(template => (
                            <AnimationContainer
                                key={`tr${template.id}`}
                                classNames="slide-left"
                                className="d-flex align-items-center"
                                timeout={{ enter: 600, exit: 600 }}
                            >
                                <div>
                                    <TemplateButton
                                        addMode={true}
                                        tippyTarget={target}
                                        id={template.id}
                                        label={template.label}
                                        resourceId={selectedResource}
                                        syncBackend={false}
                                        isSmart={true}
                                    />
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
    title: PropTypes.string,
    abstract: PropTypes.string,
    target: PropTypes.object,
};

export default TemplatesRecommendations;
