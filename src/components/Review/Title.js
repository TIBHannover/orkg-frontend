import Tippy from '@tippyjs/react';
import { EditableTitle, SectionStyled, SectionTypeStyled } from 'components/ArticleBuilder/styled';
import ResearchField from 'components/Review/ResearchField';
import SustainableDevelopmentGoals from 'components/Review/SustainableDevelopmentGoals';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateTitle } from 'slices/reviewSlice';

const Title = () => {
    const { id, title: titleStore } = useSelector((state) => state.review.paper);
    const dispatch = useDispatch();
    const [title, setTitle] = useState('');

    useEffect(() => {
        setTitle(titleStore);
    }, [titleStore]);

    const handleBlur = (e) => {
        dispatch(
            updateTitle({
                id,
                title: e.target.value,
            }),
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
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a paper title..."
                />
            </h1>
            <div className="d-flex justify-content-between">
                <ResearchField />
                <div>
                    <SustainableDevelopmentGoals isEditable />
                </div>
            </div>
        </SectionStyled>
    );
};

export default Title;
