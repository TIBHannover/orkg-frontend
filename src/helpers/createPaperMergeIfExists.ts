import { ContributionRequestPart } from '@orkg/orkg-client';

import getExistingPaper from '@/helpers/getExistingPaper';
import { createContribution } from '@/services/backend/contributions';
import { createPaper } from '@/services/backend/papers';
import { CreateContribution, CreateContributionData, CreatePaperContents, CreatePaperParams, ExtractionMethod } from '@/services/backend/types';

type CreatePaperMergeIfExistsParams = {
    paper: CreatePaperParams;
    contribution?: ContributionRequestPart;
    createContributionData?: CreateContributionData;
    extractionMethod?: ExtractionMethod;
};

const createPaperMergeIfExists = async ({
    paper,
    contribution,
    createContributionData,
    extractionMethod,
}: CreatePaperMergeIfExistsParams): Promise<string> => {
    const existingPaper = await getExistingPaper({ doi: paper.identifiers?.doi?.[0], title: paper.title });

    let contributionStatements: CreatePaperContents | CreateContribution | null = null;

    if (contribution) {
        if (existingPaper) {
            await createContribution(existingPaper.id, {
                contribution,
                ...createContributionData,
                ...(extractionMethod ? { extractionMethod } : {}),
            });
        } else {
            contributionStatements = {
                contributions: [contribution],
                ...createContributionData,
            };
        }
    }

    if (existingPaper) {
        return existingPaper.id;
    }

    return createPaper({
        ...paper,
        ...(contributionStatements ? { contents: contributionStatements, ...(extractionMethod ? { extractionMethod } : {}) } : {}),
    });
};

export default createPaperMergeIfExists;
