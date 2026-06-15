import type { JobStatusRepresentation } from '@orkg/orkg-client';
import { JobStatusRepresentationStatusEnum, ResponseError } from '@orkg/orkg-client';

import { PREDICATES } from '@/constants/graphSettings';
import { EXTRACTION_METHODS } from '@/constants/misc';
import {
    createCsv,
    getCsvImportResults,
    getCsvImportStatus,
    getCsvValidationResults,
    getCsvValidationStatus,
    startCsvImport,
    startCsvValidation,
} from '@/services/backend/csvs';
import { getStatements, setStatementsExtractionMethod } from '@/services/backend/statements';

const POLL_INTERVAL_MS = 2000;
// Validation/import are async backend jobs. Cap the wait so a stuck job surfaces as an
// error instead of polling forever (the comparison generation itself can take ~10 min).
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Pulls a human-readable message out of a backend problem+json error response.
const extractProblemMessage = async (error: unknown, fallback: string): Promise<string> => {
    if (error instanceof ResponseError) {
        try {
            const body = await error.response.clone().json();
            return body?.detail || body?.message || body?.title || fallback;
        } catch {
            return fallback;
        }
    }
    return error instanceof Error ? error.message : fallback;
};

// Polls a CSV job status endpoint until it reaches a terminal state (DONE/FAILED/STOPPED)
// and returns that status. Throws only when the timeout elapses.
const waitForTerminalStatus = async (
    id: string,
    fetchStatus: (id: string) => Promise<JobStatusRepresentation>,
    jobLabel: string,
): Promise<JobStatusRepresentation['status']> => {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    while (Date.now() < deadline) {
        // eslint-disable-next-line no-await-in-loop
        const { status } = await fetchStatus(id);
        if (
            status === JobStatusRepresentationStatusEnum.Done ||
            status === JobStatusRepresentationStatusEnum.Failed ||
            status === JobStatusRepresentationStatusEnum.Stopped
        ) {
            return status;
        }
        // eslint-disable-next-line no-await-in-loop
        await delay(POLL_INTERVAL_MS);
    }
    throw new Error(`CSV ${jobLabel} timed out`);
};

// Fetches the validation error for a failed validation job. The results endpoint responds
// with a 400 problem+json when the job ran into an error, which we surface to the user.
const getValidationErrorMessage = async (id: string): Promise<string> => {
    try {
        await getCsvValidationResults(id);
        return 'CSV validation failed';
    } catch (error) {
        return extractProblemMessage(error, 'CSV validation failed');
    }
};

export type ImportPapersResult = {
    contributionIds: string[];
};

// Imports papers from a CSV using the backend CSV pipeline (create → validate → import →
// results) and returns the created contribution ids to be used as comparison sources.
const importPapersFromCsv = async (csvContent: string): Promise<ImportPapersResult> => {
    const csvId = await createCsv({ file: csvContent });

    await startCsvValidation(csvId);
    const validationStatus = await waitForTerminalStatus(csvId, getCsvValidationStatus, 'validation');
    if (validationStatus !== JobStatusRepresentationStatusEnum.Done) {
        throw new Error(await getValidationErrorMessage(csvId));
    }

    await startCsvImport(csvId);
    const importStatus = await waitForTerminalStatus(csvId, getCsvImportStatus, 'import');
    if (importStatus !== JobStatusRepresentationStatusEnum.Done) {
        throw new Error(`CSV import ${importStatus.toLowerCase()}`);
    }

    const results = await getCsvImportResults(csvId);
    // The import results contain a record per imported entity, which can be a CONTRIBUTION or a
    // PAPER (when the paper did not exist yet). For comparison sources we need contribution ids, so
    // contributions are used directly and papers are resolved to their contribution(s).
    const contributionIds = (
        await Promise.all(
            results.content.map(async (record) => {
                if (record.importedEntityType === 'CONTRIBUTION') {
                    return [record.importedEntityId];
                }
                if (record.importedEntityType === 'PAPER') {
                    const paperStatements = await getStatements({ subjectId: record.importedEntityId, predicateId: PREDICATES.HAS_CONTRIBUTION });
                    return paperStatements.map((statement) => statement.object.id);
                }
                return [];
            }),
        )
    ).flat();

    // Best-effort: mark the imported contributions' statements as AI-generated. A failure
    // here must not fail the (already-completed) import, so it is swallowed.
    try {
        const statements = await Promise.all(contributionIds.map((contributionId) => getStatements({ subjectId: contributionId })));
        await setStatementsExtractionMethod(
            statements.flat().map((statement) => statement.id),
            EXTRACTION_METHODS.AI_GENERATED,
        );
    } catch {
        // ignore: provenance tagging is non-critical
    }

    return { contributionIds };
};

export default importPapersFromCsv;
