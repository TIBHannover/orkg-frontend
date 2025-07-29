import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import { SectionStyled } from '@/components/ArticleBuilder/styled';
import AuthorBadges from '@/components/Badges/AuthorBadges/AuthorBadges';
import ResearchFieldBadge from '@/components/Badges/ResearchFieldBadge/ResearchFieldBadge';
import EditMetadataModal from '@/components/List/EditList/EditMetadata/EditMetadataModal/EditMetadataModal';
import useList from '@/components/List/hooks/useList';
import ListEntryAmount from '@/components/List/ListEntryAmount/ListEntryAmount';
import SustainableDevelopmentGoals from '@/components/List/SustainableDevelopmentGoals/SustainableDevelopmentGoals';
import ObservatoryBox from '@/components/ObservatoryBox/ObservatoryBox';
import Button from '@/components/Ui/Button/Button';

const EditMetadata = () => {
    const { list, observatory, organization, mutate } = useList();
    const [isOpenEditMetadataModal, setIsOpenEditMetadataModal] = useState(false);

    if (!list) {
        return null;
    }

    return (
        <SectionStyled className="box rounded-bottom">
            <div className="d-flex justify-content-between">
                <div>
                    <h1 className="py-2 m-0">{list.title || <em>No title</em>}</h1>

                    {list.research_fields?.[0] && <ResearchFieldBadge researchField={list.research_fields[0]} />}

                    <ListEntryAmount />
                    <AuthorBadges authors={list.authors} />
                    <div>
                        <Button color="secondary" size="sm" className="mt-2 me-2" onClick={() => setIsOpenEditMetadataModal(true)}>
                            <FontAwesomeIcon icon={faPen} /> Edit metadata
                        </Button>
                    </div>
                </div>
                <div className="d-flex flex-column align-items-end gap-2 mt-2 border-start border-light ps-4">
                    <ObservatoryBox resourceId={list.id} observatory={observatory} organization={organization} mutate={mutate} />
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
