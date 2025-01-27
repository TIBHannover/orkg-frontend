import ContentLink from 'components/Review/Sections/ContentLink/ContentLink';
import { FC } from 'react';
import { ReviewSection } from 'services/backend/types';

type EditSectionVisualizationProps = {
    section: ReviewSection;
};

const EditSectionVisualization: FC<EditSectionVisualizationProps> = ({ section }) => {
    return <ContentLink section={section} />;
};

export default EditSectionVisualization;
