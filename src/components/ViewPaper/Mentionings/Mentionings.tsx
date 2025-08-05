import { FC } from 'react';
import useSWR from 'swr';

import ListGroup from '@/components/Ui/List/ListGroup';
import ListGroupItem from '@/components/Ui/List/ListGroupItem';
import Container from '@/components/Ui/Structure/Container';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import AddMentioning from '@/components/ViewPaper/Mentionings/AddMentioning/AddMentioning';
import MentioningItem from '@/components/ViewPaper/Mentionings/MentioningItem/MentioningItem';
import { getPaper, papersUrl, updatePaper } from '@/services/backend/papers';
import { Mentioning } from '@/services/backend/types';

type MentioningsProps = { id: string };

const Mentionings: FC<MentioningsProps> = ({ id }) => {
    const { isEditMode } = useIsEditMode();
    const { data: paper, isLoading, mutate } = useSWR(id ? [id, papersUrl, 'getPaper'] : null, ([params]) => getPaper(params));
    const mentionings = paper?.mentionings.sort((a, b) => a.label.localeCompare(b.label));

    const handleDeleteMentioning = async (resourceId: string) => {
        if (!mentionings) {
            return;
        }

        await updatePaper(id, {
            mentionings: mentionings?.map((mentioning) => mentioning.id).filter((mentioningId) => resourceId !== mentioningId),
        });

        mutate();
    };

    const handleAddMentioning = async (newMentioningId: string) => {
        if (!mentionings || mentionings.find((mentioning) => newMentioningId === mentioning.id)) {
            return;
        }

        await updatePaper(id, {
            mentionings: [...mentionings.map((mentioning) => mentioning.id), newMentioningId],
        });

        mutate();
    };

    return (
        <div>
            <Container className="p-0 rounded mb-3 p-3 bg-light">
                Mentions list resources that are related to this paper{' '}
                <a href="https://orkg.org/help-center/article/60/Mentionings" target="_blank" rel="noreferrer">
                    Learn more in the help center
                </a>
                .
            </Container>

            {isLoading && 'Loading...'}
            <ListGroup className="mb-2">
                {!isLoading &&
                    id &&
                    mentionings &&
                    mentionings.map((item: Mentioning) => (
                        <MentioningItem key={item.id} item={item} isEditMode={isEditMode} onDelete={handleDeleteMentioning} />
                    ))}
            </ListGroup>
            {!isLoading && mentionings?.length === 0 && (
                <ListGroup className="mb-2">
                    <ListGroupItem className="mb-0 rounded">
                        No data yet
                        <br />
                        {isEditMode ? (
                            <span style={{ fontSize: '0.875rem' }}>Start by adding a resource from below</span>
                        ) : (
                            <span style={{ fontSize: '0.875rem' }}>Please contribute by editing</span>
                        )}
                        <br />
                    </ListGroupItem>
                </ListGroup>
            )}
            {isEditMode && <AddMentioning handleAddMentioning={handleAddMentioning} />}
        </div>
    );
};

export default Mentionings;
