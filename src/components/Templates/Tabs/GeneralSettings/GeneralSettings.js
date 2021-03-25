import { useRef } from 'react';
import { FormGroup, Label, FormText, Input } from 'reactstrap';
import { connect } from 'react-redux';
import { setLabel, setPredicate, setClass, setResearchFields, setResearchProblems, setIsStrictTemplate } from 'actions/addTemplate';
import { createPredicate } from 'services/backend/predicates';
import ConfirmClass from 'components/ConfirmationModal/ConfirmationModal';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import { CLASSES, ENTITIES } from 'constants/graphSettings';
import useConfirmPropertyModal from 'components/StatementBrowser/AddProperty/hooks/useConfirmPropertyModal';

function GeneralSettings(props) {
    const inputRef = useRef(null);
    const classAutocompleteRef = useRef(null);
    const predicateAutocompleteRef = useRef(null);
    const { confirmProperty } = useConfirmPropertyModal();

    const handleChangeLabel = event => {
        props.setLabel(event.target.value);
    };

    const handlePropertySelect = async (selected, { action }) => {
        if (action === 'select-option') {
            props.setPredicate(selected);
        } else if (action === 'create-option') {
            const confirmedProperty = await confirmProperty();
            if (confirmedProperty) {
                const newPredicate = await createPredicate(selected.label);
                selected.id = newPredicate.id;
                props.setPredicate(selected);
            }
            // blur the field allows to focus and open the menu again
            predicateAutocompleteRef.current && predicateAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            props.setPredicate(null);
        }
    };

    const handleClassSelect = async (selected, { action }) => {
        if (action === 'select-option') {
            props.setClass(selected);
        } else if (action === 'create-option') {
            const newClass = await ConfirmClass({
                label: selected.label
            });
            if (newClass) {
                selected.id = newClass.id;
                props.setClass(selected);
            }
            // blur the field allows to focus and open the menu again
            classAutocompleteRef.current && classAutocompleteRef.current.blur();
        } else if (action === 'clear') {
            props.setClass(null);
        }
    };

    const handleResearchFieldSelect = selected => {
        props.setResearchFields(!selected ? [] : selected);
    };

    const handleResearchProblemSelect = selected => {
        props.setResearchProblems(!selected ? [] : selected);
    };

    /*
    const handleSwitchIsDescription = event => {
        props.setIsClassDescription(event.target.checked);
    };
    */

    return (
        <div className="p-4">
            <FormGroup className="mb-4">
                <Label>Name of template</Label>
                <Input innerRef={inputRef} value={props.label} onChange={handleChangeLabel} disabled={!props.editMode} />
            </FormGroup>

            <FormGroup className="mb-4">
                <Label>Target class</Label>
                <AutoComplete
                    entityType={ENTITIES.CLASS}
                    placeholder={props.editMode ? 'Select or type to enter a class' : 'No Classes'}
                    onChange={handleClassSelect}
                    value={props.class}
                    autoLoadOption={true}
                    openMenuOnFocus={true}
                    allowCreate={true}
                    isDisabled={!props.editMode || (Boolean(props.templateID) && Boolean(props.class))}
                    copyValueButton={true}
                    isClearable
                    innerRef={classAutocompleteRef}
                    autoFocus={false}
                    linkButton={props.class && props.class.id ? reverse(ROUTES.CLASS, { id: props.class.id }) : ''}
                    linkButtonTippy="Go to class page"
                />
                {props.editMode && <FormText>Specify the class of this template. If not specified, a class is generated automatically.</FormText>}
            </FormGroup>
            <>
                <fieldset className="scheduler-border">
                    <legend className="scheduler-border">Template use cases</legend>
                    <p>
                        <small className="text-muted">
                            These fields are optional, the property is used to link the contribution resource to the template instance. The research
                            fields/problems are used to suggest this template in the relevant papers.
                        </small>
                    </p>
                    <FormGroup className="mb-4">
                        <Label>Property</Label>
                        <AutoComplete
                            entityType={ENTITIES.PREDICATE}
                            placeholder={props.editMode ? 'Select or type to enter a property' : 'No Property'}
                            onChange={handlePropertySelect}
                            value={props.predicate}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            allowCreate={true}
                            isDisabled={!props.editMode}
                            autoFocus={false}
                            isClearable
                            innerRef={predicateAutocompleteRef}
                        />
                        {props.editMode && (
                            <FormText>
                                Specify the property of this template. This property is used to link the contribution to the template instance.
                            </FormText>
                        )}
                    </FormGroup>
                    <FormGroup className="mb-4">
                        <Label>Research fields</Label>
                        <AutoComplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.RESEARCH_FIELD}
                            placeholder={props.editMode ? 'Select or type to enter a research field' : 'No research fields'}
                            onChange={handleResearchFieldSelect}
                            value={props.researchFields}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            autoFocus={false}
                            allowCreate={false}
                            isDisabled={!props.editMode}
                            isClearable
                            isMulti
                        />
                        {props.editMode && <FormText>Specify the research fields that uses this template.</FormText>}
                    </FormGroup>
                    <FormGroup className="mb-4">
                        <Label>Research problems</Label>
                        <AutoComplete
                            entityType={ENTITIES.RESOURCE}
                            optionsClass={CLASSES.PROBLEM}
                            placeholder={props.editMode ? 'Select or type to enter a research problem' : 'No research problem'}
                            onChange={handleResearchProblemSelect}
                            value={props.researchProblems}
                            autoLoadOption={true}
                            openMenuOnFocus={true}
                            autoFocus={false}
                            allowCreate={false}
                            isDisabled={!props.editMode}
                            isClearable
                            isMulti
                        />
                        {props.editMode && <FormText>Specify the research problems that uses this template.</FormText>}
                    </FormGroup>
                </fieldset>
            </>
        </div>
    );
}

GeneralSettings.propTypes = {
    templateID: PropTypes.string.isRequired,
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
    isStrictTemplate: PropTypes.bool.isRequired,
    setResearchFields: PropTypes.func.isRequired,
    setIsStrictTemplate: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        templateID: state.addTemplate.templateID,
        label: state.addTemplate.label,
        predicate: state.addTemplate.predicate,
        class: state.addTemplate.class,
        editMode: state.addTemplate.editMode,
        researchProblems: state.addTemplate.researchProblems,
        researchFields: state.addTemplate.researchFields,
        isStrictTemplate: state.addTemplate.isStrict
    };
};

const mapDispatchToProps = dispatch => ({
    setLabel: data => dispatch(setLabel(data)),
    setPredicate: data => dispatch(setPredicate(data)),
    setClass: data => dispatch(setClass(data)),
    setResearchProblems: data => dispatch(setResearchProblems(data)),
    setResearchFields: data => dispatch(setResearchFields(data)),
    setIsStrictTemplate: data => dispatch(setIsStrictTemplate(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GeneralSettings);
