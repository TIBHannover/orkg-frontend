import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useState } from 'react';

import { SectionStyled, SectionTypeStyled } from '@/components/ArticleBuilder/styled';
import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import Tooltip from '@/components/FloatingUI/Tooltip';
import ObservatoryBox from '@/components/ObservatoryBox/ObservatoryBox';
import EditMetadataModal from '@/components/Review/EditReview/EditMetadata/EditMetadataModal/EditMetadataModal';
import useReview from '@/components/Review/hooks/useReview';
import SustainableDevelopmentGoals from '@/components/Review/SustainableDevelopmentGoals/SustainableDevelopmentGoals';

const EditMetadata = () => {
    const { review, observatory, organization, mutate } = useReview();
    const [isOpenEditMetadataModal, setIsOpenEditMetadataModal] = useState(false);

    if (!review) {
        return null;
    }

    return (
        <SectionStyled className="box rounded">
            <SectionTypeStyled disabled>
                <Tooltip content="The type of the metadata cannot be changed">
                    <span>metadata</span>
                </Tooltip>
            </SectionTypeStyled>
            <div className="flex justify-between">
                <div>
                    <h1 className="py-2 m-0 text-4xl">{review.title || <em>No title</em>}</h1>

                    {review.research_fields?.[0] && <ResearchFieldBadge researchField={review.research_fields[0]} />}
                    <AuthorBadges authors={review.authors} />
                    <div>
                        <Button variant="secondary" size="sm" className="mt-2 mr-2" onPress={() => setIsOpenEditMetadataModal(true)}>
                            <FontAwesomeIcon icon={faPen} /> Edit metadata
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2 mt-2 border-start border-default pl-6 mt-4">
                    <ObservatoryBox resourceId={review.id} observatory={observatory} organization={organization} mutate={mutate} />
                    <div style={{ marginRight: -25 }}>
                        <SustainableDevelopmentGoals isEditable />
                    </div>
                </div>
            </div>
            {isOpenEditMetadataModal && <EditMetadataModal toggle={() => setIsOpenEditMetadataModal((v) => !v)} />}
        </SectionStyled>
    );
};

export default EditMetadata;
