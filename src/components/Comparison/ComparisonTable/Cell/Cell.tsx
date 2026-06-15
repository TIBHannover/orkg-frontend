import { isEqual } from 'lodash';
import { memo, useState } from 'react';
import { cx } from 'tailwind-variants';

import { useComparisonAiReview } from '@/components/Comparison/ComparisonTable/AiReview/ComparisonAiReviewProvider';
import CellAiReview from '@/components/Comparison/ComparisonTable/Cell/CellAiReview/CellAiReview';
import CellDataBrowserDialog from '@/components/Comparison/ComparisonTable/Cell/CellDataBrowserDialog/CellDataBrowserDialog';
import CellLiteral from '@/components/Comparison/ComparisonTable/Cell/CellLiteral/CellLiteral';
import classToType from '@/components/Comparison/ComparisonTable/Cell/helpers/classToType';
import { getBackgroundColor } from '@/components/DataBrowser/utils/dataBrowserUtils';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { EXTRACTION_METHODS } from '@/constants/misc';
import { ThingReference } from '@/services/backend/types';

type CellProps = {
    value?: ThingReference;
    path?: string[];
    dataBrowserHistory?: string[];
};

const Cell = ({ value, path, dataBrowserHistory }: CellProps) => {
    const [isOpenDataBrowserModal, setIsOpenDataBrowserModal] = useState(false);
    const { getCellStatement, isAiSource, isIncorrect } = useComparisonAiReview();

    const history = dataBrowserHistory ?? [];
    const predicateId = history[history.length - 2];
    const subjectId = history[history.length - 3];
    const aiStatement = value && subjectId && predicateId ? getCellStatement(subjectId, predicateId, value.id, value.label) : undefined;
    const showAiReview =
        !!subjectId &&
        isAiSource(subjectId) &&
        (aiStatement?.extractionMethod === EXTRACTION_METHODS.AI_GENERATED ||
            aiStatement?.extractionMethod === EXTRACTION_METHODS.AI_GENERATED_WITH_MANUAL_REVIEW);
    const incorrect = !!aiStatement && isIncorrect(aiStatement.statementId);

    return (
        <>
            <div
                className={cx(
                    'flex h-full border-b-[#e7eaf1] border-b bg-inherit border-r border-r-[#e7eaf1] break-words',
                    incorrect && 'bg-danger/8!',
                )}
                style={{ background: incorrect ? undefined : getBackgroundColor(path?.length ? path.length - 1 : 0) }}
            >
                {value ? (
                    <div className="py-1 px-2 flex items-start gap-1 w-full">
                        <div className="min-w-0 flex-1">
                            {value._class !== 'literal_ref' && (
                                <span>
                                    <DescriptionTooltip
                                        id={value.id}
                                        _class={classToType[value._class]}
                                        classes={'classes' in value ? value.classes : undefined}
                                    >
                                        <div
                                            className="bg-transparent p-0 text-accent focus:ring-0 hover:underline"
                                            onClick={() => setIsOpenDataBrowserModal(true)}
                                            style={{ cursor: 'pointer' }}
                                            onKeyDown={(e) => (e.key === 'Enter' ? setIsOpenDataBrowserModal(true) : undefined)}
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <ValuePlugins type="resource">{value.label}</ValuePlugins>
                                        </div>
                                    </DescriptionTooltip>
                                </span>
                            )}
                            {value._class === 'literal_ref' ? <CellLiteral literal={value} /> : null}
                        </div>
                        {showAiReview && aiStatement && (
                            <CellAiReview statementId={aiStatement.statementId} extractionMethod={aiStatement.extractionMethod} />
                        )}
                    </div>
                ) : null}
            </div>
            {isOpenDataBrowserModal && value && (
                <CellDataBrowserDialog value={value} dataBrowserHistory={dataBrowserHistory} onClose={() => setIsOpenDataBrowserModal(false)} />
            )}
        </>
    );
};

export default memo(Cell, isEqual);
