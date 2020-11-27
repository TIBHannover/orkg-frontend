import { updateTitle } from 'actions/smartArticle';
import { SectionStyled, SectionTypeStyled, ContentEditableStyled } from 'components/SmartArticle/styled';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Tippy from '@tippy.js/react';

const Title = () => {
    const { id, label } = useSelector(state => state.smartArticle.paperResource);
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
            <SectionTypeStyled disabled>
                <Tippy hideOnClick={false} content="The type of the paper title cannot be changed">
                    <span>paper title</span>
                </Tippy>
            </SectionTypeStyled>

            <h1 className="h2 py-2 m-0">
                <ContentEditableStyled html={text.current} onBlur={handleBlur} onChange={handleChange} placeholder="Enter a paper title..." />
            </h1>
        </SectionStyled>
    );
};

export default Title;
