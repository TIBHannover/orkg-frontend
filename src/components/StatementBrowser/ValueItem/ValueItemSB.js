import React, { useState } from 'react';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import { StyledValueItem } from 'components/AddPaper/Contributions/styled';
import classNames from 'classnames';
import Pulse from 'components/Utils/Pulse';
import StatementOptionButton from 'components/StatementBrowser/StmOptionBtn/StmOptionBtn';
import PropTypes from 'prop-types';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { StyledAutoCompleteInputFormControl } from 'components/StatementBrowser/AutoComplete';
import styled from 'styled-components';

const StyledInput = styled(Input)`
    &:focus {
        outline: 0 none;
        box-shadow: none !important;
    }
`;

export default function ValueItemSB(props) {
    const [disableHover, setDisableHover] = useState(false);
    const [draftLabel, setDraftLabel] = useState(props.value.label);

    const labelClass = classNames({
        objectLink: (props.value.type === 'object' || props.value.type === 'template') && !props.value.isEditing && !props.isProperty
    });

    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            background: 'inherit',
            boxShadow: state.isFocused ? 0 : 0,
            border: 0,
            paddingLeft: 0,
            paddingRight: 0,
            cursor: 'text',
            minHeight: 'initial',
            borderRadius: 'inherit',
            padding: 0,
            '&>div:first-of-type': {
                padding: 0
            }
        }),
        container: provided => ({
            padding: 0,
            height: 'auto',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            background: '#fff',
            '&>div:first-of-type': {
                padding: 0
            }
        }),
        menu: provided => ({
            ...provided,
            zIndex: 10,
            color: '#000'
        }),
        option: provided => ({
            ...provided,
            cursor: 'pointer',
            whiteSpace: 'normal'
        }),
        indicatorsContainer: provided => ({
            ...provided,
            '&>div:last-child': {
                padding: '0 8px'
            }
        }),
        input: provided => ({
            ...provided,
            margin: '0 4px'
        })
    };

    return (
        <>
            {!props.inline ? (
                <StyledValueItem className={disableHover && 'disableHover'}>
                    <span className={labelClass} onClick={!props.value.isEditing && !props.isProperty ? props.hundleOnClick : undefined}>
                        {!props.value.isSaving ? (
                            !props.value.isEditing ? (
                                props.showHelp && props.value.type === 'object' ? (
                                    <Pulse content={'Click on the resource to browse it'}>
                                        <ValuePlugins type={props.value.type === 'object' ? 'resource' : 'literal'}>{props.value.label}</ValuePlugins>
                                    </Pulse>
                                ) : (
                                    <ValuePlugins type={props.value.type === 'object' ? 'resource' : 'literal'}>{props.value.label}</ValuePlugins>
                                )
                            ) : props.value.type === 'object' ? (
                                props.resource && props.resource.existingResourceId && props.value.shared > 1 ? (
                                    <StyledAutoCompleteInputFormControl className="form-control" style={{ borderRadius: 0 }}>
                                        <AsyncCreatableSelect
                                            loadOptions={props.loadOptions}
                                            styles={customStyles}
                                            autoFocus
                                            getOptionLabel={({ label }) => label.charAt(0).toUpperCase() + label.slice(1)}
                                            getOptionValue={({ id }) => id}
                                            defaultOptions={[
                                                {
                                                    label: props.value,
                                                    id: props.value.resourceId
                                                }
                                            ]}
                                            defaultValue={{
                                                label: props.value,
                                                id: props.value.resourceId
                                            }}
                                            cacheOptions
                                            onChange={(selectedOption, a) => {
                                                props.handleChangeResource(selectedOption, a);
                                                props.toggleEditValue({ id: props.id });
                                            }}
                                            onBlur={e => {
                                                props.toggleEditValue({ id: props.id });
                                            }}
                                            isValidNewOption={inputValue => inputValue.length !== 0 && inputValue.trim().length !== 0}
                                            createOptionPosition={'first'}
                                        />
                                    </StyledAutoCompleteInputFormControl>
                                ) : (
                                    <InputGroup>
                                        <StyledInput
                                            value={draftLabel}
                                            onChange={e => setDraftLabel(e.target.value)}
                                            onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                                            onBlur={e => {
                                                props.commitChangeLabel(draftLabel);
                                                props.toggleEditValue({ id: props.id });
                                            }}
                                            autoFocus
                                            bsSize="sm"
                                        />
                                        <InputGroupAddon addonType="append">
                                            <Button
                                                outline
                                                color="primary"
                                                size="sm"
                                                onClick={e => {
                                                    props.commitChangeLabel(draftLabel);
                                                    props.toggleEditValue({ id: props.id });
                                                }}
                                            >
                                                Save
                                            </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                )
                            ) : (
                                <InputGroup>
                                    <StyledInput
                                        value={draftLabel}
                                        onChange={e => setDraftLabel(e.target.value)}
                                        onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()}
                                        onBlur={e => {
                                            props.commitChangeLiteral(draftLabel);
                                            props.toggleEditValue({ id: props.id });
                                        }}
                                        autoFocus
                                        bsSize="sm"
                                    />
                                    <InputGroupAddon addonType="append">
                                        <Button
                                            outline
                                            color="primary"
                                            size="sm"
                                            onClick={e => {
                                                props.commitChangeLiteral(draftLabel);
                                                props.toggleEditValue({ id: props.id });
                                            }}
                                        >
                                            Save
                                        </Button>
                                    </InputGroupAddon>
                                </InputGroup>
                            )
                        ) : (
                            'Saving ...'
                        )}
                        {!props.value.isEditing && props.resource && props.resource.existingResourceId && props.openExistingResourcesInDialog ? (
                            <span>
                                {' '}
                                <Icon icon={faExternalLinkAlt} />
                            </span>
                        ) : (
                            ''
                        )}
                    </span>
                    {!props.value.isEditing && props.value.classes && props.value.classes.includes(process.env.REACT_APP_QB_DATASET_CLASS) && (
                        <Tippy content="Visualize data in tabular form">
                            <span style={{ cursor: 'pointer' }} onClick={props.handleDatasetClick}>
                                {' '}
                                <Icon icon={faTable} />
                            </span>
                        </Tippy>
                    )}
                    {!props.value.isEditing && props.enableEdit ? (
                        <>
                            <StatementOptionButton
                                className={'deleteValue float-right'}
                                requireConfirmation={true}
                                title={'Delete value'}
                                buttonText={'Delete'}
                                confirmationMessage={'Are you sure to delete?'}
                                icon={faTrash}
                                action={props.handleDeleteValue}
                                onVisibilityChange={() => setDisableHover(!disableHover)}
                            />
                            {((props.resource && !props.resource.existingResourceId) || props.value.shared <= 1) && !props.isProperty && (
                                <span
                                    className={'mr-3 deleteValue float-right'}
                                    onClick={() => {
                                        props.toggleEditValue({ id: props.id });
                                    }}
                                >
                                    <Tippy content="Edit label">
                                        <span>
                                            <Icon icon={faPen} /> Edit
                                        </span>
                                    </Tippy>
                                </span>
                            )}

                            {props.resource && props.resource.existingResourceId && props.value.shared > 1 && (
                                <span className={'mr-3 deleteValue float-right disabled'}>
                                    <Tippy content="A shared resource cannot be edited directly">
                                        <span>
                                            <Icon icon={faPen} /> Edit
                                        </span>
                                    </Tippy>
                                </span>
                            )}
                        </>
                    ) : (
                        ''
                    )}
                </StyledValueItem>
            ) : (
                props.value.label
            )}
        </>
    );
}

ValueItemSB.propTypes = {
    id: PropTypes.string.isRequired,
    isProperty: PropTypes.bool.isRequired,
    value: PropTypes.object.isRequired,
    resource: PropTypes.object.isRequired,
    hundleOnClick: PropTypes.func.isRequired,
    inline: PropTypes.bool.isRequired,
    showHelp: PropTypes.bool,
    enableEdit: PropTypes.bool.isRequired,
    loadOptions: PropTypes.func.isRequired,

    handleChangeResource: PropTypes.func.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    commitChangeLabel: PropTypes.func.isRequired,
    commitChangeLiteral: PropTypes.func.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    handleDatasetClick: PropTypes.func.isRequired,
    handleDeleteValue: PropTypes.func.isRequired
};
