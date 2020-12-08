import Tippy from '@tippy.js/react';
import { updateTitle } from 'actions/smartArticle';
import ContentEditable from 'components/SmartArticle/ContentEditable';
import { SectionStyled, SectionTypeStyled } from 'components/SmartArticle/styled';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Title = () => {
    const { id, label } = useSelector(state => state.smartArticle.paperResource);
    const dispatch = useDispatch();

    const handleBlur = async text => {
        dispatch(
            updateTitle({
                id,
                title: text
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
                <ContentEditable text={label} onBlur={handleBlur} placeholder="Enter a paper title..." />
            </h1>
        </SectionStyled>
    );
};

export default Title;
