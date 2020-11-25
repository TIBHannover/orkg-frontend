import { updateTitle } from 'actions/smartArticle';
import { SectionStyled, SectionType } from 'components/SmartArticle/styled';
import React, { useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';
import { useDispatch, useSelector } from 'react-redux';

const Title = () => {
    const { id, label } = useSelector(state => state.smartArticle.titleResource);
    const dispatch = useDispatch();
    // react-contenteditable doesn't support useState, so we use a ref
    // https://github.com/lovasoa/react-contenteditable/issues/161
    const text = useRef('');

    useEffect(() => {
        if (!label) {
            return;
        }
        text.current = label;
    }, [label]);

    const handleChange = evt => {
        text.current = evt.target.value;
    };

    const handleBlur = async () => {
        dispatch(
            updateTitle({
                id,
                title: text.current
            })
        );
    };

    return (
        <SectionStyled className="box rounded mb-4">
            <SectionType disabled>paper title</SectionType>
            <h2 className="py-2 m-0">
                <ContentEditable html={text.current} onBlur={handleBlur} onChange={handleChange} />
            </h2>
        </SectionStyled>
    );
};

export default Title;
