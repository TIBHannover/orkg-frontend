import { ProgressBar as HeroProgressBar, Tooltip } from '@heroui/react';
import { filter, meanBy, upperFirst } from 'lodash';
import { useSelector } from 'react-redux';

import useOntology from '@/components/PdfAnnotation/hooks/useOntology';
import { RootStore } from '@/slices/types';

const RECOMMENDED_ANNOTATION_AMOUNT = 2;

const ProgressBar = () => {
    const { recommendedClasses } = useOntology();
    const annotations = useSelector((state: RootStore) => state.pdfAnnotation.annotations);

    const classesWithCompletion = recommendedClasses.map((_class) => {
        const annotationsFiltered = filter(annotations, { type: _class.iri });
        const amount = annotationsFiltered.length;
        const percentage = amount >= RECOMMENDED_ANNOTATION_AMOUNT ? 100 : Math.round(100 * (amount / RECOMMENDED_ANNOTATION_AMOUNT));

        return {
            label: _class.label,
            amount,
            percentage,
        };
    });

    const percentageTotal = Math.round(meanBy(classesWithCompletion, (_class) => _class.percentage));

    const completionTooltip = (
        <div className="text-[110%]">
            The completion indicates if you did sufficiently describe the most important types. Completion is only an indication and can be ignored.
            <hr className="my-2 border-border" />
            <table className="mb-2 w-full">
                <tbody>
                    {classesWithCompletion.map((_class) => (
                        <tr key={_class.label}>
                            <td>
                                {upperFirst(_class.label)} ({_class.amount}/{RECOMMENDED_ANNOTATION_AMOUNT})
                            </td>
                            <td className="text-right">{_class.percentage}%</td>
                        </tr>
                    ))}
                    <tr>
                        <td aria-hidden />
                        <td className="text-right pt-2 border-t-2 border-border">Total: {percentageTotal}%</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <Tooltip>
            <Tooltip.Trigger className="block w-full">
                <div className="mb-6 text-left" id="completion-bar">
                    Completion {percentageTotal}%
                    <HeroProgressBar value={percentageTotal} color="success">
                        <HeroProgressBar.Track className="bg-foreground/15">
                            <HeroProgressBar.Fill />
                        </HeroProgressBar.Track>
                    </HeroProgressBar>
                </div>
            </Tooltip.Trigger>
            <Tooltip.Content className="max-w-[300px]" placement="bottom">
                {completionTooltip}
            </Tooltip.Content>
        </Tooltip>
    );
};

export default ProgressBar;
