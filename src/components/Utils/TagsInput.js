import React, { Component } from 'react';
import { Container, Row, Col, Form, FormGroup, Label, Input, InputGroup, InputGroupAddon, Button, ButtonGroup, FormFeedback, Table, Card } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import TagsInputReact from 'react-tagsinput';
import AutosizeInput from 'react-input-autosize';
import styles from './TagsInput.module.scss';
import PropTypes from 'prop-types';

/**
 * Functional stateless component (still have to decide on whether this should be standard or use the regular class structure)
 * TODO: consistency: try to replace some of the classes via props of TagsInputReact, instead of different render methods 
 */
const TagsInput = ({handler, value}) => {
    const autosizingRenderInput = ({ addTag, ...props }) => {
        let { onChange, value, ...other } = props
        return (
            <AutosizeInput type='text' onChange={onChange} value={value} {...other} />
        )
    }

    const defaultRenderTag = (props) => {
        let { tag, key, disabled, onRemove, classNameRemove, getTagDisplayValue, ...other } = props
        return (
            <span key={key} {...other} className={styles.reactTagsinputTag}>
                {getTagDisplayValue(tag)}
                {!disabled &&
                    <a className={styles.reactTagsinputRemove} onClick={(e) => onRemove(key)}>
                        <Icon icon={faTimes} />
                    </a>
                }
            </span>
        )
    }
    
    return (
        <div className={`${styles.tagsInput} form-control`}>
            <TagsInputReact value={value}
                onChange={handler}
                className={styles.tagsInputInner}
                renderInput={autosizingRenderInput}
                renderTag={defaultRenderTag}
                placeholder=""
                inputProps={{
                    className: '',
                    placeholder: ''
                }} />
        </div>
    );   
}

TagsInput.propTypes = {
    handler: PropTypes.func.isRequired,
    value: PropTypes.array.isRequired,
}

export default TagsInput;