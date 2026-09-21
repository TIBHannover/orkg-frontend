import { FC } from 'react';

import ContentLink from '@/components/Review/Sections/ContentLink/ContentLink';
import { ReviewSectionContentLink } from '@/services/backend/types';

type EditSectionResourcePropertyProps = {
    section: ReviewSectionContentLink;
};

const EditSectionResourceProperty: FC<EditSectionResourcePropertyProps> = ({ section }) => {
    return <ContentLink section={section} />;
};

export default EditSectionResourceProperty;
