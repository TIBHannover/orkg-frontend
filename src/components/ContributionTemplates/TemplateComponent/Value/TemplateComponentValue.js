import React from 'react';
import { ValuesStyle } from 'components/StatementBrowser/styled';
import { classesUrl } from 'network';
import defaultDatatypes from 'components/ContributionTemplates/helpers/defaultDatatypes';
import { InputGroup } from 'reactstrap';
import AutoComplete from 'components/ContributionTemplates/TemplateEditorAutoComplete';
import PropTypes from 'prop-types';
import ValidationRules from '../ValidationRules/ValidationRules';

function TemplateComponentValue(props) {
    return (
        <ValuesStyle className={'col-8 valuesList'}>
            <div>
                <InputGroup size="sm">
                    <AutoComplete
                        requestUrl={classesUrl}
                        placeholder={props.enableEdit ? 'Select or type to enter a class' : 'No Class'}
                        onItemSelected={(selected, action) => props.handleClassOfPropertySelect(selected, action, props.id)}
                        onKeyUp={() => {}}
                        allowCreate
                        value={props.value}
                        isDisabled={!props.enableEdit}
                        isClearable={true}
                        defaultOptions={defaultDatatypes}
                        cssClasses={'form-control-sm'}
                    />
                </InputGroup>
                {props.value && ['Number', 'String'].includes(props.value.id) && (
                    <ValidationRules validationRules={props.validationRules} id={props.id} value={props.value} enableEdit={props.enableEdit} />
                )}
            </div>
        </ValuesStyle>
    );
}

TemplateComponentValue.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.object.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    validationRules: PropTypes.object.isRequired,
    handleClassOfPropertySelect: PropTypes.func.isRequired
};

export default TemplateComponentValue;
