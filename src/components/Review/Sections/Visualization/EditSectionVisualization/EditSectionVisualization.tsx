import { FC } from 'react';

import ContentLink from '@/components/Review/Sections/ContentLink/ContentLink';
import { ReviewSectionContentLink } from '@/services/backend/types';

type EditSectionVisualizationProps = {
    section: ReviewSectionContentLink;
};

const EditSectionVisualization: FC<EditSectionVisualizationProps> = ({ section }) => {
    return <ContentLink section={section} />;
};

export default EditSectionVisualization;
