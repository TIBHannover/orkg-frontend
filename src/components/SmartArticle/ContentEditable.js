import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactContentEditable from 'react-contenteditable';
import styled from 'styled-components';

// react-contenteditable doesn't support useState, so we use a ref
// use this component to let it properly support hooks
// https://github.com/lovasoa/react-contenteditable/issues/161
// we need forceUpdate because changing to ref doesn't trigger a rerender

export const ContentEditableStyled = styled(ReactContentEditable)`
    cursor: text; // force text cursor in case the element is empty
    padding: 2px;
    margin: -2px 0 0 -2px;
    &[contenteditable='true']:empty:before {
        content: attr(placeholder);
        display: block;
        color: #aaa;
    }
    &:focus {
        border-color: #f8d0d0;
        outline: 0;
        box-shadow: 0 0 0 0.22rem rgba(232, 97, 97, 0.25);
        border-radius: ${props => props.theme.borderRadius};
    }
`;

const ContentEditable = props => {
    const { text, onBlur, placeholder } = props;
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);

    const textRef = useRef('');

    useEffect(() => {
        if (!text) {
            return;
        }
        textRef.current = text;
        forceUpdate();
    }, [text, forceUpdate]);

    const handleChange = evt => {
        textRef.current = evt.target.value;
    };

    return <ContentEditableStyled html={textRef.current} onBlur={() => onBlur(textRef.current)} onChange={handleChange} placeholder={placeholder} />;
};

ContentEditable.propTypes = {
    onBlur: PropTypes.func.isRequired,
    //onChange: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
    placeholder: PropTypes.string.isRequired
};

export default ContentEditable;
