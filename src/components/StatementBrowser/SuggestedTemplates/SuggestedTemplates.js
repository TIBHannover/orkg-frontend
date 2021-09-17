import { useState, useEffect, useCallback } from 'react';
import ContentLoader from 'react-content-loader';
import { setIsHelpModalOpen } from 'actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { getStatementsByObjectAndPredicate, getParentResearchFields } from 'services/backend/statements';
import Tooltip from 'components/Utils/Tooltip';
import AddTemplateButton from 'components/StatementBrowser/AddTemplateButton/AddTemplateButton';
import HELP_CENTER_ARTICLES from 'constants/helpCenterArticles';
import { useDispatch } from 'react-redux';
import { flattenDepth, uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import { FormGroup, Label, UncontrolledAlert, Button } from 'reactstrap';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

export default function SuggestedTemplates(props) {
    const [problemTemplates, setProblemTemplates] = useState([]);
    const [fieldTemplates, setFieldTemplates] = useState([]);
    const [loadedProblems, setLoadedProblems] = useState([]);
    const [loadingFieldTemplates, setLoadingFieldTemplates] = useState({ isLoading: false, failed: false });
    const [loadingProblemTemplates, setLoadingProblemTemplates] = useState({ isLoading: false, failed: false });

    const dispatch = useDispatch();

    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = useCallback((resourceId, predicateId) => {
        return getStatementsByObjectAndPredicate({ objectId: resourceId, predicateId: predicateId }).then(statements => {
            // Filter statement with subjects of type Template
            const source = statements.length > 0 ? statements[0].object : '';
            return statements
                .filter(statement => statement.subject.classes.includes(CLASSES.TEMPLATE))
                .map(st => ({ id: st.subject.id, label: st.subject.label, source })); // return the template Object
        });
    }, []);

    /**
     * Fetch templates for research fields
     */
    useEffect(() => {
        setLoadingFieldTemplates({ isLoading: true, failed: false });
        if (props.researchField) {
            getParentResearchFields(props.researchField).then(parents => {
                Promise.all([...parents.map(rf => getTemplatesOfResourceId(rf.id, PREDICATES.TEMPLATE_OF_RESEARCH_FIELD))])
                    .then(templates => {
                        setFieldTemplates(templates.flat());
                        setLoadingFieldTemplates({ isLoading: false, failed: false });
                    })
                    .catch(e => {
                        setFieldTemplates([]);
                        setLoadingFieldTemplates({ isLoading: false, failed: true });
                    });
            });
        } else {
            setLoadingFieldTemplates({ isLoading: false, failed: false });
        }
    }, [props.researchField, getTemplatesOfResourceId]);

    /**
     * Fetch templates for research problems
     */
    useEffect(() => {
        setLoadingProblemTemplates({ isLoading: true, failed: false });

        // fetch templates for problems there aren't loaded yet
        const problemPromises = props.researchProblems
            .filter(problem => !loadedProblems.includes(problem))
            .map(problem => getTemplatesOfResourceId(problem, PREDICATES.TEMPLATE_OF_RESEARCH_PROBLEM));

        Promise.all(problemPromises)
            .then(addTemplates => {
                // flatten depth created by promise all
                addTemplates = flattenDepth(addTemplates, 2);
                setProblemTemplates(state => [
                    ...addTemplates,
                    ...state.filter(template => {
                        return props.researchProblems.includes(template.source.id);
                    })
                ]);
                setLoadedProblems(props.researchProblems);
                setLoadingProblemTemplates({ isLoading: false, failed: false });
            })
            .catch(e => {
                setProblemTemplates([]);
                setLoadingProblemTemplates({ isLoading: false, failed: true });
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.researchProblems.join(','), loadedProblems, getTemplatesOfResourceId]);

    const templatesUnique = uniqBy([...problemTemplates, ...fieldTemplates], 'id');
    const isLoading = loadingFieldTemplates.isLoading || loadingProblemTemplates.isLoading;
    const loadingFailed = loadingFieldTemplates.failed && loadingProblemTemplates.failed;

    if (props.disabled) {
        return (
            <UncontrolledAlert color="info">
                A shared resource cannot be edited directly{' '}
                <Button
                    color="link"
                    className="p-0"
                    onClick={() => dispatch(setIsHelpModalOpen({ isOpen: true, articleId: HELP_CENTER_ARTICLES.RESOURCE_SHARED }))}
                >
                    <Icon icon={faQuestionCircle} />
                </Button>
            </UncontrolledAlert>
        );
    }

    return (
        <>
            {isLoading && (
                <ContentLoader
                    height="100%"
                    width="100%"
                    viewBox="0 0 100 5"
                    style={{ width: '100% !important' }}
                    speed={2}
                    backgroundColor="#f3f3f3"
                    foregroundColor="#ecebeb"
                >
                    <rect x="0" y="0" rx="1" ry="1" width="10" height="3" />
                    <rect x="12" y="0" rx="1" ry="1" width="10" height="3" />
                    <rect x="24" y="0" rx="1" ry="1" width="10" height="3" />
                    <rect x="36" y="0" rx="1" ry="1" width="10" height="3" />
                </ContentLoader>
            )}

            {!isLoading && loadingFailed && <UncontrolledAlert color="info">Failed to load templates</UncontrolledAlert>}

            {!isLoading && !loadingFailed && templatesUnique.length > 0 && (
                <FormGroup>
                    <Label>
                        <Tooltip message="Select a template to use it in your data">Use template</Tooltip>
                    </Label>

                    <div>
                        {templatesUnique.map(template => (
                            <AddTemplateButton
                                key={`t${template.id}`}
                                id={template.id}
                                label={template.label}
                                source={template.source}
                                resourceId={props.selectedResource}
                                syncBackend={props.syncBackend}
                            />
                        ))}
                    </div>
                </FormGroup>
            )}
        </>
    );
}

SuggestedTemplates.propTypes = {
    syncBackend: PropTypes.bool.isRequired,
    researchProblems: PropTypes.array.isRequired,
    researchField: PropTypes.string,
    selectedResource: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired
};

SuggestedTemplates.defaultProps = {
    syncBackend: false,
    disabled: false
};
