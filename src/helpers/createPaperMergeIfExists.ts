import getExistingPaper from 'helpers/getExistingPaper';
import { createContribution, createPaper } from 'services/backend/papers';
import {
    CreateContribution,
    CreateContributionData,
    CreatePaperContents,
    CreatePaperParams,
    ExtractionMethod,
    NewContribution,
} from 'services/backend/types';

type CreatePaperMergeIfExistsParams = {
    paper: CreatePaperParams;
    contribution?: NewContribution;
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
            contributionStatements = {
                contribution,
                ...(extractionMethod ? { extraction_method: extractionMethod } : {}),
                ...createContributionData,
            } as CreateContribution;
            await createContribution({ paperId: existingPaper.id, contributionStatements });
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
        ...(contributionStatements
            ? { contents: contributionStatements as CreatePaperContents, ...(extractionMethod ? { extraction_method: extractionMethod } : {}) }
            : {}),
    });
};

export default createPaperMergeIfExists;
