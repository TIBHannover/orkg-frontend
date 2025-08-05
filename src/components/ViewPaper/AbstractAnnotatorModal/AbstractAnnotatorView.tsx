import capitalize from 'capitalize';
import toArray from 'lodash/toArray';
import { FC } from 'react';
import { useSelector } from 'react-redux';

import { OptionType } from '@/components/Autocomplete/types';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Alert from '@/components/Ui/Alert/Alert';
import Badge from '@/components/Ui/Badge/Badge';
import TooltipQuestion from '@/components/Utils/Tooltip';
import AbstractAnnotator from '@/components/ViewPaper/AbstractAnnotatorModal/AbstractAnnotator';
import TitleWarningAlert from '@/components/ViewPaper/AbstractModal/TitleWarningAlert';
import { RootStore } from '@/slices/types';

type AbstractAnnotatorViewProps = {
    predicateOptions: OptionType[];
    isAnnotationLoading: boolean;
    isAnnotationFailedLoading: boolean;
    getPredicateColor: (id: string) => string;
    annotationError: string;
};

const AbstractAnnotatorView: FC<AbstractAnnotatorViewProps> = ({
    predicateOptions,
    isAnnotationLoading,
    isAnnotationFailedLoading,
    getPredicateColor,
    annotationError,
}) => {
    const ranges = useSelector((state: RootStore) => state.viewPaper.ranges);
    const abstract = useSelector((state: RootStore) => state.viewPaper.abstract);
    const isAbstractLoading = useSelector((state: RootStore) => state.viewPaper.isAbstractLoading);
    const rangeArray = toArray(ranges);

    const rangesPredicates = [...new Set(rangeArray.map((r) => r.predicate.id))];
    const rangesPredicatesLabels = [...new Set(rangeArray.map((r) => r.predicate.label))];

    return (
        <div className="ps-2 pe-2">
            {abstract && !isAnnotationLoading && !isAnnotationFailedLoading && (
                <div>
                    <TitleWarningAlert />

                    {rangesPredicates.length > 0 && (
                        <Alert color="info">
                            <strong>Info:</strong> we automatically annotated the abstract for you. Please remove any incorrect annotations
                        </Alert>
                    )}
                    {rangesPredicates.length === 0 && (
                        <Alert color="info">
                            <strong>Info:</strong> we could not find any concepts on the abstract. Please insert more text in the abstract.
                        </Alert>
                    )}
                </div>
            )}

            {!isAnnotationLoading && isAnnotationFailedLoading && (
                <Alert color="light">{annotationError || 'Failed to connect to the annotation service, please try again later'}</Alert>
            )}
            {!isAbstractLoading && !isAnnotationLoading && (
                <div>
                    <div id="annotationBadges">
                        <TooltipQuestion message="Annotation labels are the properties that will be used in the contribution data.">
                            Annotation labels
                        </TooltipQuestion>
                        <span className="me-1 ms-1" />
                        {rangesPredicates.length > 0 &&
                            rangesPredicates.map((p, index) => {
                                const aconcept = p ? predicateOptions.filter((e) => e.id === p) : [];
                                if (p && aconcept.length > 0) {
                                    return (
                                        <Tooltip key={`p${p}`} content={aconcept[0].description}>
                                            <span>
                                                <Badge
                                                    className="me-2"
                                                    color=""
                                                    style={{
                                                        cursor: 'pointer',
                                                        marginBottom: '4px',
                                                        color: '#333',
                                                        background: getPredicateColor(p),
                                                    }}
                                                >
                                                    {rangesPredicatesLabels[index] ? capitalize(aconcept[0].label) : 'Unlabeled'}{' '}
                                                    <Badge pill color="secondary">
                                                        {rangeArray.filter((rc) => rc.predicate.id === p).length}
                                                    </Badge>
                                                </Badge>
                                            </span>
                                        </Tooltip>
                                    );
                                }
                                return (
                                    <Badge
                                        color=""
                                        className="me-2"
                                        key={`p${p}`}
                                        style={{ marginBottom: '4px', color: '#333', background: getPredicateColor(p) }}
                                    >
                                        {rangesPredicatesLabels[index] ? capitalize(p) : 'Unlabeled'}{' '}
                                        <Badge pill color="secondary">
                                            {rangeArray.filter((rc) => rc.predicate?.id?.toLowerCase() === p?.toLowerCase()).length}
                                        </Badge>
                                    </Badge>
                                );
                            })}
                    </div>
                    <AbstractAnnotator predicateOptions={predicateOptions} getPredicateColor={getPredicateColor} />
                </div>
            )}
        </div>
    );
};

export default AbstractAnnotatorView;
