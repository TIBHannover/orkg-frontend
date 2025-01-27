import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { SectionStyled, SectionTypeStyled } from 'components/ArticleBuilder/styled';
import AuthorBadges from 'components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from 'components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import ObservatoryBox from 'components/ObservatoryBox/ObservatoryBox';
import EditMetadataModal from 'components/Review/EditReview/EditMetadata/EditMetadataModal/EditMetadataModal';
import useReview from 'components/Review/hooks/useReview';
import SustainableDevelopmentGoals from 'components/Review/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import { useState } from 'react';
import { Button } from 'reactstrap';

const EditMetadata = () => {
    const { review, observatory, organization, mutate } = useReview();
    const [isOpenEditMetadataModal, setIsOpenEditMetadataModal] = useState(false);

    if (!review) {
        return null;
    }

    return (
        <SectionStyled className="box rounded">
            <SectionTypeStyled disabled>
                <Tippy hideOnClick={false} content="The type of the metadata cannot be changed">
                    <span>metadata</span>
                </Tippy>
            </SectionTypeStyled>

            <div className="d-flex justify-content-between">
                <div>
                    <h1 className="py-2 m-0 h2">{review.title || <em>No title</em>}</h1>

                    {review.research_fields?.[0] && <ResearchFieldBadge researchField={review.research_fields[0]} />}
                    <AuthorBadges authors={review.authors} />
                    <div>
                        <Button color="secondary" size="sm" className="mt-2 me-2" onClick={() => setIsOpenEditMetadataModal(true)}>
                            <FontAwesomeIcon icon={faPen} /> Edit metadata
                        </Button>
                    </div>
                </div>
                <div className="d-flex flex-column align-items-end gap-2 mt-2 border-start border-light ps-4 mt-3">
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
