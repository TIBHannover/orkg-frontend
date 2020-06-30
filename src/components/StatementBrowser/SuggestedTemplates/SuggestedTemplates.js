import React, { useState, useEffect, useRef } from 'react';
import ContentLoader from 'react-content-loader';
import { getStatementsByObjectAndPredicate, getParentResearchFields } from 'network';
import Tooltip from 'components/Utils/Tooltip';
import AddTemplateButton from 'components/StatementBrowser/AddTemplateButton/AddTemplateButton';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { isEqual, difference, flattenDepth } from 'lodash';
import PropTypes from 'prop-types';
import { FormGroup, Label, UncontrolledAlert } from 'reactstrap';

// https://reactjs.org/docs/hooks-faq.html#how-to-get-the-previous-props-or-state
function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default function SuggestedTemplates(props) {
    const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
    const [isTemplatesFailedLoading, setIsTemplatesFailedLoading] = useState(false);
    const [templates, setTemplates] = useState([]);

    // how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
    // https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
    const prevTarget = usePrevious({ researchField: props.researchField, researchProblems: props.researchProblems });

    useEffect(() => {
        const loadResearchFieldTemplates = () => {
            setIsTemplatesLoading(true);
            setIsTemplatesFailedLoading(false);
            // Load templates of the research field and parents and the research problems
            getParentResearchFields(props.researchField).then(parents => {
                Promise.all([
                    ...parents.map(rf => getTemplatesOfResourceId(rf.id, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD)),
                    ...props.researchProblems.map(rp => getTemplatesOfResourceId(rp, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM))
                ])
                    .then(templates => {
                        setTemplates(templates.flat());
                        setIsTemplatesLoading(false);
                        setIsTemplatesFailedLoading(false);
                    })
                    .catch(e => {
                        setTemplates([]);
                        setIsTemplatesLoading(false);
                        setIsTemplatesFailedLoading(true);
                    });
            });
        };
        if (prevTarget && !isEqual(prevTarget.researchProblems, props.researchProblems)) {
            // update the list of templates when the list research problem changes
            setIsTemplatesLoading(true);
            setIsTemplatesFailedLoading(false);
            const toRemove = difference(prevTarget.researchProblems, props.researchProblems);
            const toAdd = difference(props.researchProblems, prevTarget.researchProblemss);
            let newTemplates = templates;
            if (toRemove.length > 0) {
                newTemplates = newTemplates.filter(template => {
                    return !toRemove.includes(template.source.id);
                });
            }
            const fetchTemplatesPromise = toAdd.map(problemId => {
                return getTemplatesOfResourceId(problemId, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM);
            });
            Promise.all(fetchTemplatesPromise).then(addtemplates => {
                setTemplates([...newTemplates, ...flattenDepth(addtemplates, 2)]);
                setIsTemplatesLoading(false);
                setIsTemplatesFailedLoading(false);
            });
        }
        if (!prevTarget || prevTarget.researchField !== props.researchField) {
            loadResearchFieldTemplates();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.researchField, props.researchProblems, props.selectedResource]);

    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = (resourceId, predicateId) => {
        return getStatementsByObjectAndPredicate({ objectId: resourceId, predicateId: predicateId }).then(statements => {
            // Filter statement with subjects of type Contribution Template
            const source = statements.length > 0 ? statements[0].object : '';
            return statements
                .filter(statement => statement.subject.classes.includes(process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE))
                .map(st => ({ id: st.subject.id, label: st.subject.label, source })); // return the template Object
        });
    };

    const uniqueTemplates = [];
    templates.forEach(obj => {
        if (!uniqueTemplates.some(o => o.id === obj.id)) {
            uniqueTemplates.push({ ...obj });
        }
    });

    return (
        <div>
            {isTemplatesLoading ? (
                <>
                    <ContentLoader height={90} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                        <rect x="0" y="0" width="90" height="12" />
                        <rect x="0" y="18" rx="7" ry="7" width="55" height="15" />
                        <rect x="60" y="18" rx="7" ry="7" width="55" height="15" />
                        <rect x="120" y="18" rx="7" ry="7" width="55" height="15" />
                        <rect x="180" y="18" rx="7" ry="7" width="55" height="15" />
                    </ContentLoader>
                </>
            ) : !isTemplatesFailedLoading ? (
                <FormGroup>
                    {uniqueTemplates.length > 0 && (
                        <>
                            <Label>
                                <Tooltip message="Select a template to use it in your data">Use template</Tooltip>
                            </Label>
                            <div>
                                {isTemplatesLoading && (
                                    <>
                                        <Icon icon={faSpinner} spin /> Loading templates.
                                    </>
                                )}
                                {!isTemplatesLoading && uniqueTemplates.length === 0 && <>No template found.</>}
                                {!isTemplatesLoading && uniqueTemplates.length > 0 && (
                                    <>
                                        {uniqueTemplates.map(t => (
                                            <AddTemplateButton
                                                key={`t${t.id}`}
                                                id={t.id}
                                                label={t.label}
                                                source={t.source}
                                                selectedResource={props.selectedResource}
                                                syncBackend={props.syncBackend}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </FormGroup>
            ) : (
                <UncontrolledAlert color="info">Failed to load templates!</UncontrolledAlert>
            )}
        </div>
    );
}

SuggestedTemplates.propTypes = {
    syncBackend: PropTypes.bool.isRequired,
    researchProblems: PropTypes.array.isRequired,
    researchField: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired
};

SuggestedTemplates.defaultProps = {
    syncBackend: false
};
