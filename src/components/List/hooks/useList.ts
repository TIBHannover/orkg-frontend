import { uniqueId } from 'lodash';
import useSWR from 'swr';
import { PublicConfiguration, useSWRConfig } from 'swr/_internal';

import useParams from '@/components/useParams/useParams';
import { CLASSES, MISC } from '@/constants/graphSettings';
import errorHandler from '@/helpers/errorHandler';
import {
    createLiteratureListSection,
    deleteLiteratureListSection,
    getLiteratureList,
    getLiteratureListPublishedContentById,
    literatureListsUrl,
    updateLiteratureList,
    updateLiteratureListSection,
    UpdateLiteratureListSectionList,
    UpdateLiteratureListSectionText,
} from '@/services/backend/literatureLists';
import { getObservatoryById, observatoriesUrl } from '@/services/backend/observatories';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { getPaper, papersUrl } from '@/services/backend/papers';
import {
    LiteratureList,
    LiteratureListSectionList,
    LiteratureListSectionText,
    LiteratureListSectionType,
    Organization,
    Paper,
    UpdateAuthor,
} from '@/services/backend/types';

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
    } = useSWR(id ? [id, literatureListsUrl, 'getLiteratureList'] : null, ([params]) => getLiteratureList(params));

    const mutateListOptimistic = ({
        updateFunction,
        optimisticData,
    }: {
        updateFunction: () => Promise<null | void | string>;
        optimisticData: LiteratureList;
    }) =>
        mutate(
            async () => {
                try {
                    await updateFunction();
                } catch (e: unknown) {
                    await errorHandler({ error: e, shouldShowToast: true });
                    throw e; // already thrown in errorHandler above, but added to be sure. Error needs to be thrown, otherwise the optimistic update won't be rolled back
                }
                return optimisticData;
            },
            {
                optimisticData,
                rollbackOnError: true,
                throwOnError: false,
            },
        );

    // authors come from edit forms, which produce explicit null ids the representation type forbids
    const updateList = (updatedData: Partial<Omit<LiteratureList, 'authors'>> & { authors?: UpdateAuthor[] }) => {
        if (!list) {
            return null;
        }
        return mutateListOptimistic({
            updateFunction: () =>
                updateLiteratureList(list.id, {
                    ...(updatedData.researchFields &&
                        updatedData.researchFields.length > 0 && { researchFields: updatedData.researchFields.map((rf) => rf.id) }),
                    ...(updatedData.sdgs && { sdgs: updatedData.sdgs.map((rf) => rf.id) }),
                    ...(updatedData.sections &&
                        updatedData.sections.length > 0 && {
                            sections: updatedData.sections.map((section) => {
                                // only provide an array with section ids
                                if ('entries' in section) {
                                    return {
                                        entries: section.entries.map((entry) => ({
                                            id: entry.value.id,
                                            description: entry.description ?? null,
                                        })),
                                    };
                                }
                                // remove id and type from section
                                const { id, type, ...updatedSection } = section;
                                return updatedSection;
                            }),
                        }),
                    // remaining data without previously set fields
                    ...(({ researchFields, sdgs, sections, ...o }) => o)(updatedData),
                }),
            optimisticData: { ...list, ...updatedData } as LiteratureList,
        });
    };

    const createSection = ({ sectionType, atIndex }: { sectionType: LiteratureListSectionType; atIndex: number }) => {
        if (!list) {
            return null;
        }

        const newSection =
            sectionType === 'text'
                ? {
                      text: '',
                      heading: '',
                      headingSize: 1,
                  }
                : {
                      entries: [],
                  };

        const sections = [
            ...list.sections.slice(0, atIndex),
            { ...newSection, id: uniqueId(), type: sectionType },
            ...list.sections.slice(atIndex),
        ] as LiteratureList['sections'];

        return mutateListOptimistic({
            updateFunction: () => createLiteratureListSection({ listId: list.id, index: atIndex, data: newSection }),
            optimisticData: { ...list, sections },
        });
    };

    const updateSection = (sectionId: string, updatedData: Partial<LiteratureListSectionText | LiteratureListSectionList>) => {
        if (!list) {
            return null;
        }
        const sections = list?.sections.map((section) =>
            section.id === sectionId ? { ...section, ...updatedData } : section,
        ) as LiteratureList['sections'];

        const updatePayload: UpdateLiteratureListSectionList | UpdateLiteratureListSectionText =
            'entries' in updatedData
                ? {
                      entries:
                          updatedData.entries!.map((entry) => ({
                              id: entry.value.id,
                              description: entry.description ?? null,
                          })) ?? [],
                  }
                : (({ id, type, ...rest }) => rest)(updatedData as LiteratureListSectionText);

        return mutateListOptimistic({
            updateFunction: () => updateLiteratureListSection({ listId: list.id, sectionId, data: updatePayload }),
            optimisticData: { ...list, sections },
        });
    };

    const deleteSection = (sectionId: string) => {
        if (!list) {
            return null;
        }
        const sections = list.sections.filter((s) => s.id !== sectionId);
        return mutateListOptimistic({
            updateFunction: () => deleteLiteratureListSection({ listId: list.id, sectionId }),
            optimisticData: { ...list, sections },
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
            // the snapshot delivers papers and resources; only papers are requested here
            return Promise.all(_paperIds.map((_id) => getLiteratureListPublishedContentById(list!.id, _id))).then((contents) =>
                contents.filter((content): content is Paper & { _class: 'paper' } => content._class === 'paper'),
            );
        },
    );

    const getPaperById = (paperId: string) => {
        return (list && list.published ? papersPublished : papers)?.find((p) => p.id === paperId);
    };

    const allPapers = list && list.published ? papersPublished : papers;

    const { onErrorRetry } = useSWRConfig();

    const { data: organization } = useSWR(
        list?.organizations?.[0] && list?.organizations?.[0] !== MISC.UNKNOWN_ID
            ? [list?.organizations?.[0], organizationsUrl, 'getOrganization']
            : null,
        ([params]) => getOrganization(params),
        {
            // since organizations and conferenceSeries share the same attribute (i.e., list?.organizations),
            // a 404 will be returned if either one of them is set. This prevent useSWR from retrying in case there is a 404
            // typing doesn't work nicely when overwriting this setting, see: https://github.com/vercel/swr/discussions/1574#discussioncomment-4982649
            onErrorRetry(err, key, config, revalidate, revalidateOpts) {
                const configForDelegate = config as Readonly<PublicConfiguration<Organization, unknown, (path: string) => unknown>>;
                if (err.status === 404) return;
                onErrorRetry(err, key, configForDelegate, revalidate, revalidateOpts);
            },
        },
    );

    const { data: observatory } = useSWR(
        list?.observatories?.[0] && list?.observatories?.[0] !== MISC.UNKNOWN_ID
            ? [list?.observatories?.[0], observatoriesUrl, 'getObservatoryById']
            : null,
        ([params]) => getObservatoryById(params),
    );

    return {
        list,
        isLoading,
        error,
        mutate,
        updateList,
        updateSection,
        allPapers,
        getPaperById,
        mutatePapers,
        createSection,
        deleteSection,
        isValidating,
        observatory,
        organization,
    };
};

export default useList;
