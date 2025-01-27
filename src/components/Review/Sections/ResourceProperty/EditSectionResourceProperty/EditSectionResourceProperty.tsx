import ContentLink from 'components/Review/Sections/ContentLink/ContentLink';
import { FC } from 'react';
import { ReviewSection } from 'services/backend/types';

type EditSectionResourcePropertyProps = {
    section: ReviewSection;
};

const EditSectionResourceProperty: FC<EditSectionResourcePropertyProps> = ({ section }) => {
    return <ContentLink section={section} />;
};

export default EditSectionResourceProperty;
