import React, { useState, useEffect, useCallback } from 'react';
import ContentLoader from 'react-content-loader';
import { getStatementsByObjectAndPredicate, getParentResearchFields } from 'network';
import Tooltip from 'components/Utils/Tooltip';
import AddTemplateButton from 'components/StatementBrowser/AddTemplateButton/AddTemplateButton';
import { flattenDepth, uniqBy } from 'lodash';
import PropTypes from 'prop-types';
import { FormGroup, Label, UncontrolledAlert } from 'reactstrap';

export default function SuggestedTemplates(props) {
    const [problemTemplates, setProblemTemplates] = useState([]);
    const [fieldTemplates, setFieldTemplates] = useState([]);
    const [loadedProblems, setLoadedProblems] = useState([]);
    const [loadingFieldTemplates, setLoadingFieldTemplates] = useState({ isLoading: false, failed: false });
    const [loadingProblemTemplates, setLoadingProblemTemplates] = useState({ isLoading: false, failed: false });

    /**
     * Fetch templates for research fields
     */
    useEffect(() => {
        setLoadingFieldTemplates({ isLoading: true, failed: false });

        getParentResearchFields(props.researchField).then(parents => {
            Promise.all([...parents.map(rf => getTemplatesOfResourceId(rf.id, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_FIELD))])
                .then(templates => {
                    setFieldTemplates(templates.flat());
                    setLoadingFieldTemplates({ isLoading: false, failed: false });
                })
                .catch(e => {
                    setFieldTemplates([]);
                    setLoadingFieldTemplates({ isLoading: false, failed: true });
                });
        });
    }, [getTemplatesOfResourceId, props.researchField]);

    /**
     * Fetch templates for research problems
     */
    useEffect(() => {
        setLoadingProblemTemplates({ isLoading: true, failed: false });

        // fetch templates for problems there aren't loaded yet
        const problemPromises = props.researchProblems
            .filter(problem => !loadedProblems.includes(problem))
            .map(problem => getTemplatesOfResourceId(problem, process.env.REACT_APP_TEMPLATE_OF_RESEARCH_PROBLEM));

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
    }, [props.researchProblems, loadedProblems, getTemplatesOfResourceId]);

    /**
     * Fetch the templates of a resource
     *
     * @param {String} resourceId Resource Id
     * @param {String} predicateId Predicate Id
     */
    const getTemplatesOfResourceId = useCallback((resourceId, predicateId) => {
        return getStatementsByObjectAndPredicate({ objectId: resourceId, predicateId: predicateId }).then(statements => {
            // Filter statement with subjects of type Contribution Template
            const source = statements.length > 0 ? statements[0].object : '';
            return statements
                .filter(statement => statement.subject.classes.includes(process.env.REACT_APP_CLASSES_CONTRIBUTION_TEMPLATE))
                .map(st => ({ id: st.subject.id, label: st.subject.label, source })); // return the template Object
        });
    }, []);

    const templatesUnique = uniqBy([...problemTemplates, ...fieldTemplates], 'id');
    const isLoading = loadingFieldTemplates.isLoading || loadingProblemTemplates.isLoading;
    const loadingFailed = loadingFieldTemplates.failed && loadingProblemTemplates.failed;

    if (props.disabled) {
        return <UncontrolledAlert color="info">A shared resource cannot be edited directly</UncontrolledAlert>;
    }

    return (
        <>
            {isLoading && (
                <ContentLoader height={50} speed={2} primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                    <rect x="0" y="18" rx="7" ry="7" width="55" height="18" />
                    <rect x="60" y="18" rx="7" ry="7" width="55" height="18" />
                    <rect x="120" y="18" rx="7" ry="7" width="55" height="18" />
                    <rect x="180" y="18" rx="7" ry="7" width="55" height="18" />
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
                                label={template.label + template.id}
                                source={template.source}
                                selectedResource={props.selectedResource}
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
    researchField: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired
};

SuggestedTemplates.defaultProps = {
    syncBackend: false,
    disabled: false
};
