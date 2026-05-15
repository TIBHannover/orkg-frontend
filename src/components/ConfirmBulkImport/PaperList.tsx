import { faArrowsAltV, faCalendar, faExclamationCircle, faExclamationTriangle, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Chip, Tooltip } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, Fragment, useState } from 'react';

import StatementList from '@/components/ConfirmBulkImport/StatementList';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { EntityType } from '@/services/backend/types';

type PaperListProps = {
    papers: any[];
    existingPaperIds: (string | null)[];
    idToLabel: Record<string, string>;
    idToEntityType: Record<string, EntityType>;
    validationErrors: Record<number, Record<string, boolean[]>>;
};

const PaperList: FC<PaperListProps> = ({ papers, existingPaperIds, idToLabel, idToEntityType, validationErrors = {} }) => {
    const [showContributions, setShowContributions] = useState<number[]>([]);

    const toggleCard = (i: number) => {
        setShowContributions((state) => (state.includes(i) ? state.filter((j) => j !== i) : [...state, i]));
    };

    const handleExpandAll = () => setShowContributions(papers.map((_, i) => i));
    const handleCollapseAll = () => setShowContributions([]);

    const hasValidationErrorsForPaper = (i: number) =>
        validationErrors?.[i] && Object.keys(validationErrors[i]).some((property) => validationErrors[i][property]?.some((error) => error));

    const hasValidationErrors = validationErrors && Object.keys(validationErrors).some((_, i) => hasValidationErrorsForPaper(i));

    const allExpanded = showContributions.length > 0;

    return (
        <div className="space-y-3">
            {hasValidationErrors && (
                <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>
                            Some provided data types are not matching cell values. Please check papers with a warning icon.
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}

            <div className="flex justify-end">
                <Button size="sm" variant="secondary" onPress={allExpanded ? handleCollapseAll : handleExpandAll}>
                    <FontAwesomeIcon icon={faArrowsAltV} className="me-2" />
                    {allExpanded ? 'Collapse all data' : 'Expand all data'}
                </Button>
            </div>

            <ul className="flex flex-col divide-y divide-divider rounded-lg border border-divider bg-default-50 overflow-hidden">
                {papers.map((paper, i) => {
                    const isOpen = showContributions.includes(i);
                    const statements = paper.contents[0]?.statements ?? {};
                    const statementKeys = Object.keys(statements);
                    const isEmpty = statementKeys.length === 0;
                    const paperHasErrors = hasValidationErrorsForPaper(i);

                    return (
                        <Fragment key={i}>
                            <li>
                                <button
                                    type="button"
                                    onClick={() => toggleCard(i)}
                                    aria-expanded={isOpen}
                                    aria-label={`Toggle paper ${i + 1} details`}
                                    className="w-full text-left px-4 py-3 transition-colors hover:bg-default-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1 min-w-0 space-y-2">
                                            {isEmpty && (
                                                <Alert status="danger">
                                                    <Alert.Indicator>
                                                        <FontAwesomeIcon icon={faExclamationCircle} />
                                                    </Alert.Indicator>
                                                    <Alert.Content>
                                                        <Alert.Description>
                                                            Paper can't be imported because it doesn't contain any contribution data
                                                        </Alert.Description>
                                                    </Alert.Content>
                                                </Alert>
                                            )}

                                            <div className="flex items-center gap-2 flex-wrap">
                                                {paperHasErrors && (
                                                    <Tooltip>
                                                        <Tooltip.Trigger className="inline-flex">
                                                            <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning-600" />
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Content>This paper contains data type warnings</Tooltip.Content>
                                                    </Tooltip>
                                                )}

                                                {!existingPaperIds[i] && paper.title && (
                                                    <Tooltip>
                                                        <Tooltip.Trigger className="inline-flex">
                                                            <Chip size="sm" variant="soft" color="accent">
                                                                New
                                                            </Chip>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Content>A new ORKG paper will be created</Tooltip.Content>
                                                    </Tooltip>
                                                )}

                                                {existingPaperIds[i] ? (
                                                    <Link
                                                        href={reverse(ROUTES.VIEW_PAPER, { resourceId: existingPaperIds[i] })}
                                                        target="_blank"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="font-medium hover:underline"
                                                    >
                                                        {paper.title || <i>No title</i>}
                                                    </Link>
                                                ) : (
                                                    <span className="font-medium">{paper.title || <i className="text-muted">No title</i>}</span>
                                                )}
                                            </div>

                                            <div className="text-sm text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <FontAwesomeIcon size="sm" icon={faUser} />
                                                    {paper.authors.length > 0 ? (
                                                        paper.authors.map((a: any) => a.name).join(' • ')
                                                    ) : (
                                                        <i>No authors provided</i>
                                                    )}
                                                </span>
                                                {(paper.publicationMonth || paper.publicationYear) && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <FontAwesomeIcon size="sm" icon={faCalendar} />
                                                        {paper.publicationMonth && paper.publicationMonth > 0
                                                            ? dayjs()
                                                                  .month(paper.publicationMonth - 1)
                                                                  .format('MMMM')
                                                            : ''}{' '}
                                                        {paper.publicationYear}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="shrink-0 text-muted text-lg font-semibold tabular-nums">#{i + 1}</div>
                                    </div>
                                </button>
                            </li>

                            {isOpen && (
                                <li className="bg-default-100/40 px-4 py-3">
                                    {!isEmpty ? (
                                        <ul className="flex flex-col divide-y divide-divider rounded-md border border-divider bg-default-50 text-[90%]">
                                            {statementKeys.map((property) => (
                                                <StatementList
                                                    key={property}
                                                    property={property}
                                                    idToLabel={idToLabel}
                                                    idToEntityType={idToEntityType}
                                                    values={statements[property]}
                                                    validationErrors={validationErrors?.[i]?.[property]}
                                                />
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-sm text-muted">No contribution data to import.</div>
                                    )}
                                </li>
                            )}
                        </Fragment>
                    );
                })}
            </ul>
        </div>
    );
};

export default PaperList;
