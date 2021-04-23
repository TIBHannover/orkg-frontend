import Tippy from '@tippyjs/react';
import { updateTitle } from 'actions/smartReview';
import ResearchField from 'components/SmartReview/ResearchField';
import { EditableTitle, SectionStyled, SectionTypeStyled } from 'components/SmartReview/styled';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Title = () => {
    const { id, title: titleStore } = useSelector(state => state.smartReview.paper);
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
                    <span>general data</span>
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

            <ResearchField />
        </SectionStyled>
    );
};

export default Title;
