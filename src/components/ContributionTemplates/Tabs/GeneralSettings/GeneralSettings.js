import React, { useRef } from 'react';
import { FormGroup, Label, FormText, Input, CustomInput } from 'reactstrap';
import { connect } from 'react-redux';
import Confirm from 'reactstrap-confirm';
import {
    setLabel,
    setPredicate,
    setClass,
    setResearchFields,
    setResearchProblems,
    setIsClassDescription,
    setIsStrictTemplate
} from 'actions/addTemplate';
import { predicatesUrl, resourcesUrl, classesUrl, createPredicate, createClass } from 'network';
import AutoComplete from 'components/ContributionTemplates/TemplateEditorAutoComplete';
import PropTypes from 'prop-types';

function GeneralSettings(props) {
    const inputRef = useRef(null);

    const handleChangeLabel = event => {
        props.setLabel(event.target.value);
    };

    const handlePropertySelect = async (selected, action) => {
        if (action.action === 'select-option') {
            props.setPredicate(selected);
        } else if (action.action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new property?',
                message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const newPredicate = await createPredicate(selected.label);
                selected.id = newPredicate.id;
                props.setPredicate(selected);
            }
        }
    };

    const handleClassSelect = async (selected, action) => {
        if (action.action === 'select-option') {
            props.setClass(selected);
        } else if (action.action === 'create-option') {
            const result = await Confirm({
                title: 'Are you sure you need a new class?',
                message: 'Often there are existing classes that you can use as well. It is better to use existing classes than new ones.',
                cancelColor: 'light'
            });
            if (result) {
                const newClass = await createClass(selected.label);
                selected.id = newClass.id;
                props.setClass(selected);
            }
        } else if (action.action === 'clear') {
            props.setClass(null);
        }
    };

    const handleResearchFieldSelect = selected => {
        props.setResearchFields(!selected ? [] : selected);
    };

    const handleResearchProblemSelect = selected => {
        props.setResearchProblems(!selected ? [] : selected);
    };
    if (inputRef.current) {
        inputRef.current.focus();
    }

    const handleSwitchIsDescription = event => {
        props.setIsClassDescription(event.target.checked);
    };

    const handleSwitchIsStrictTemplate = event => {
        props.setIsStrictTemplate(event.target.checked);
    };

    return (
        <div className="p-4">
            <FormGroup className="mb-4">
                <Label>Name of template</Label>
                <Input innerRef={inputRef} value={props.label} onChange={handleChangeLabel} disabled={!props.editMode} />
            </FormGroup>
            <FormGroup>
                <div>
                    <CustomInput
                        onChange={handleSwitchIsStrictTemplate}
                        checked={props.isStrictTemplate}
                        id="switchIsStrictTemplate"
                        type="switch"
                        name="customSwitch"
                        label="This template is strict (it's not possible to add properties)"
                        disabled={!props.editMode}
                    />
                </div>
            </FormGroup>
            <FormGroup>
                <div>
                    <CustomInput
                        onChange={handleSwitchIsDescription}
                        checked={props.isClassDescription}
                        id="switchIsClassDescription"
                        type="switch"
                        name="customSwitch"
                        label="This template is a classs description"
                        disabled={!props.editMode}
                    />
                </div>
            </FormGroup>
            {props.isClassDescription ? (
                <FormGroup className="mb-4">
                    <Label>Class</Label>
                    <AutoComplete
                        allowCreate
                        requestUrl={classesUrl}
                        onItemSelected={handleClassSelect}
                        placeholder={props.editMode ? 'Select or type to enter a class' : 'No Classes'}
                        autoFocus
                        isClearable
                        cacheOptions
                        value={props.class}
                        isDisabled={!props.editMode}
                    />
                    {props.editMode && <FormText>Specify the class of this template.</FormText>}
                </FormGroup>
            ) : (
                <>
                    <FormGroup className="mb-4">
                        <Label>Property</Label>
                        <AutoComplete
                            allowCreate
                            requestUrl={predicatesUrl}
                            onItemSelected={handlePropertySelect}
                            placeholder={props.editMode ? 'Select or type to enter a property' : 'No Properties'}
                            autoFocus
                            cacheOptions
                            value={props.predicate}
                            isDisabled={!props.editMode}
                        />
                        {props.editMode && <FormText>Specify the property of this template.</FormText>}
                    </FormGroup>
                    <fieldset className="scheduler-border">
                        <legend className="scheduler-border">Template use cases</legend>
                        <FormGroup className="mb-4">
                            <Label>Research fields</Label>
                            <AutoComplete
                                requestUrl={resourcesUrl}
                                optionsClass={process.env.REACT_APP_CLASSES_RESEARCH_FIELD}
                                onItemSelected={handleResearchFieldSelect}
                                placeholder={props.editMode ? 'Select or type to enter a research field' : 'No research fields'}
                                autoFocus
                                cacheOptions
                                isMulti
                                value={props.researchFields}
                                isDisabled={!props.editMode}
                            />
                            {props.editMode && <FormText>Specify the research fields that uses this template.</FormText>}
                        </FormGroup>
                        <FormGroup className="mb-4">
                            <Label>Research problems</Label>
                            <AutoComplete
                                requestUrl={resourcesUrl}
                                optionsClass={process.env.REACT_APP_CLASSES_PROBLEM}
                                onItemSelected={handleResearchProblemSelect}
                                placeholder={props.editMode ? 'Select or type to enter a research problem' : 'No research problem'}
                                autoFocus
                                cacheOptions
                                isMulti
                                value={props.researchProblems}
                                isDisabled={!props.editMode}
                            />
                            {props.editMode && <FormText>Specify the research problems that uses this template.</FormText>}
                        </FormGroup>
                    </fieldset>
                </>
            )}
        </div>
    );
}

GeneralSettings.propTypes = {
    label: PropTypes.string.isRequired,
    setLabel: PropTypes.func.isRequired,
    editMode: PropTypes.bool.isRequired,
    predicate: PropTypes.object,
    setPredicate: PropTypes.func.isRequired,
    class: PropTypes.object,
    setClass: PropTypes.func.isRequired,
    researchProblems: PropTypes.array,
    setResearchProblems: PropTypes.func.isRequired,
    researchFields: PropTypes.array,
    isClassDescription: PropTypes.bool.isRequired,
    isStrictTemplate: PropTypes.bool.isRequired,
    setResearchFields: PropTypes.func.isRequired,
    setIsClassDescription: PropTypes.func.isRequired,
    setIsStrictTemplate: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        label: state.addTemplate.label,
        predicate: state.addTemplate.predicate,
        class: state.addTemplate.class,
        editMode: state.addTemplate.editMode,
        researchProblems: state.addTemplate.researchProblems,
        researchFields: state.addTemplate.researchFields,
        isClassDescription: state.addTemplate.isClassDescription,
        isStrictTemplate: state.addTemplate.isStrict
    };
};

const mapDispatchToProps = dispatch => ({
    setLabel: data => dispatch(setLabel(data)),
    setPredicate: data => dispatch(setPredicate(data)),
    setClass: data => dispatch(setClass(data)),
    setResearchProblems: data => dispatch(setResearchProblems(data)),
    setResearchFields: data => dispatch(setResearchFields(data)),
    setIsClassDescription: data => dispatch(setIsClassDescription(data)),
    setIsStrictTemplate: data => dispatch(setIsStrictTemplate(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GeneralSettings);
