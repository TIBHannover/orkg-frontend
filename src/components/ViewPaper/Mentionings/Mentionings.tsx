import { Alert } from '@heroui/react';
import { FC } from 'react';
import useSWR from 'swr';

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
        <div className="flex flex-col gap-4">
            <div className="rounded p-4 bg-background text-sm">
                Mentions list resources that are related to this paper{' '}
                <a href="https://orkg.org/help-center/article/60/Mentionings" target="_blank" rel="noreferrer">
                    Learn more in the help center
                </a>
                .
            </div>

            {isLoading && <div className="text-muted">Loading...</div>}

            {!isLoading && id && mentionings && mentionings.length > 0 && (
                <div className="rounded border border-border divide-y divide-border bg-surface">
                    {mentionings.map((item: Mentioning) => (
                        <MentioningItem key={item.id} item={item} isEditMode={isEditMode} onDelete={handleDeleteMentioning} />
                    ))}
                </div>
            )}

            {!isLoading && mentionings?.length === 0 && (
                <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>No data yet</Alert.Title>
                        <Alert.Description>{isEditMode ? 'Start by adding a resource from below' : 'Please contribute by editing'}</Alert.Description>
                    </Alert.Content>
                </Alert>
            )}

            {isEditMode && <AddMentioning handleAddMentioning={handleAddMentioning} />}
        </div>
    );
};

export default Mentionings;
