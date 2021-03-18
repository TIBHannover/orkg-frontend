import Tippy from '@tippyjs/react';
import { updateTitle } from 'actions/smartArticle';
import { SectionStyled, SectionTypeStyled, EditableTitle } from 'components/SmartArticle/styled';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Title = () => {
    const { id, title: titleStore } = useSelector(state => state.smartArticle.paper);
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');

    useEffect(() => {
        setTitle(titleStore);
    }, [titleStore]);

    const handleBlur = e => {
        dispatch(
            updateTitle({
                id,
                title: e.target.value
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
                <EditableTitle
                    className="focus-primary"
                    value={title}
                    onBlur={handleBlur}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter a paper title..."
                />
            </h1>
        </SectionStyled>
    );
};

export default Title;
