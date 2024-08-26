import { createAuthorsList } from 'components/Input/AuthorsInput/helpers';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import THING_TYPES from 'constants/thingTypes';
import errorHandler from 'helpers/errorHandler';
import { uniqueId } from 'lodash';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { createLiteral } from 'services/backend/literals';
import { getLiteratureList, getLiteratureListPublishedContentById, listsUrl, updateLiteratureList } from 'services/backend/literatureLists';
import { getPaper, papersUrl } from 'services/backend/papers';
import { createResource } from 'services/backend/resources';
import { createLiteralStatement, createResourceStatement, getStatementsBundleBySubject } from 'services/backend/statements';
import { LiteratureList, LiteratureListSectionList, LiteratureListSectionText, LiteratureListSectionType, Paper } from 'services/backend/types';
import { createThing } from 'services/similarity';
import useSWR from 'swr';
import { convertAuthorsToOldFormat } from 'utils';

const useList = (listId?: string) => {
    let { id } = useParams<{ id: string }>();
    if (listId) {
        id = listId;
    }

    const {
        data: list,
        isLoading,
        error,
        mutate,
        isValidating,
    } = useSWR(id ? [id, listsUrl, 'getLiteratureList'] : null, ([params]) => getLiteratureList(params));

    const updateList = (updatedData: Partial<LiteratureList>) => {
        if (!list) {
            return null;
        }
        return mutate(
            async () => {
                try {
                    await updateLiteratureList(list.id, {
                        ...(updatedData.research_fields &&
                            updatedData.research_fields.length > 0 && { research_fields: updatedData.research_fields.map((rf) => rf.id) }),
                        ...(updatedData.sdgs && updatedData.sdgs.length > 0 && { sdgs: updatedData.sdgs.map((rf) => rf.id) }),
                        ...(updatedData.sections &&
                            updatedData.sections.length > 0 && {
                                sections: updatedData.sections.map((section) => {
                                    // only provide an array with section ids
                                    if ('entries' in section) {
                                        return {
                                            entries: section.entries.map((entry) => ({
                                                id: entry.value.id,
                                                description: entry.description,
                                            })),
                                        };
                                    }
                                    // remove id and type from section
                                    const { id, type, ...updatedSection } = section;
                                    return updatedSection;
                                }),
                            }),
                        // remaining data without previously set fields
                        ...(({ research_fields, sdgs, sections, ...o }) => o)(updatedData),
                    });
                } catch (e: unknown) {
                    errorHandler({ error: e, shouldShowToast: true });
                }
                return { ...list, ...updatedData };
            },
            {
                optimisticData: { ...list, ...updatedData },
                rollbackOnError: true,
                throwOnError: false,
            },
        );
    };

    const createSection = ({ sectionType, atIndex }: { sectionType: LiteratureListSectionType; atIndex: number }) => {
        if (!list) {
            return null;
        }
        return updateList({
            sections: [
                ...list.sections.slice(0, atIndex),
                sectionType === 'text'
                    ? {
                          id: uniqueId(),
                          type: 'text',
                          text: '',
                          heading: '',
                          heading_size: 1,
                      }
                    : {
                          id: uniqueId(),
                          type: 'list',
                          entries: [],
                      },
                ...list.sections.slice(atIndex),
            ],
        });
    };

    const deleteSection = (sectionId: string) => {
        if (!list) {
            return null;
        }
        return updateList({
            sections: list.sections.filter((s) => s.id !== sectionId),
        });
    };

    const updateListSection = (sectionId: string, updatedData: Partial<LiteratureListSectionText | LiteratureListSectionList>) => {
        return updateList({
            sections: list?.sections.map((section) => (section.id === sectionId ? { ...section, ...updatedData } : section)),
        });
    };

    const paperIds = list?.sections
        .filter((section): section is LiteratureListSectionList => section.type === 'list')
        .flatMap((section) => section.entries.filter((entry) => entry.value?.classes?.includes(CLASSES.PAPER)).map((entry) => entry.value?.id));

    const { data: papers, mutate: mutatePapers } = useSWR(
        list && !list.published && paperIds && paperIds.length > 0 ? [paperIds, papersUrl, 'getPaper'] : null,
        ([_paperIds]) => {
            return Promise.all(_paperIds.map((_id) => getPaper(_id)));
        },
    );

    const { data: papersPublished } = useSWR(
        list && list.published && paperIds && paperIds.length > 0 ? [paperIds, list, 'getLiteratureListPublishedContentById'] : null,
        ([_paperIds]) => {
            return Promise.all(_paperIds.map((_id) => getLiteratureListPublishedContentById(list!.id, _id) as Promise<Paper>)); // only papers are returned, so cast as Paper
        },
    );

    const getPaperById = (paperId: string) => {
        return (list && list.published ? papersPublished : papers)?.find((p) => p.id === paperId);
    };

    const allPapers = list && list.published ? papersPublished : papers;

    const publishList = async ({ updateMessage }: { updateMessage: string }) => {
        try {
            const { statements } = await getStatementsBundleBySubject({
                id,
                blacklist: [CLASSES.RESEARCH_FIELD],
            });
            if (!statements || statements.length === 0) {
                throw new Error('No statements found for the list');
            }
            const listTitle = statements.find((statement) => statement.subject.id === id)?.subject.label ?? '';
            const versionResource = await createResource(listTitle, [CLASSES.LITERATURE_LIST_PUBLISHED]);
            const updateMessageLiteral = await createLiteral(updateMessage);
            await createLiteralStatement(versionResource.id, PREDICATES.DESCRIPTION, updateMessageLiteral.id);
            await createResourceStatement(id, PREDICATES.HAS_PUBLISHED_VERSION, versionResource.id);

            // assign additional metadata to the published version
            if (list?.sdgs && list?.sdgs.length > 0) {
                for (const sdg of list.sdgs) {
                    createResourceStatement(versionResource.id, PREDICATES.SUSTAINABLE_DEVELOPMENT_GOAL, sdg.id);
                }
            }
            if (list?.research_fields && list?.research_fields.length > 0) {
                createResourceStatement(versionResource.id, PREDICATES.HAS_RESEARCH_FIELD, list?.research_fields?.[0].id);
            }
            if (list?.authors && list?.authors.length > 0) {
                await createAuthorsList({ resourceId: versionResource.id, authors: convertAuthorsToOldFormat(list.authors) });
            }

            // @ts-expect-error awaiting TS migration
            await createThing({ thingType: THING_TYPES.LIST, thingKey: versionResource.id, data: { rootResource: id, statements } });

            mutate();

            toast.success('List published successfully');
            return versionResource.id;
        } catch (e) {
            toast.error('An error occurred when publishing the list');
            console.error(e);
            return null;
        }
    };

    return {
        list,
        isLoading,
        error,
        mutate,
        updateList,
        updateListSection,
        allPapers,
        getPaperById,
        mutatePapers,
        publishList,
        createSection,
        deleteSection,
        isValidating,
    };
};

export default useList;
