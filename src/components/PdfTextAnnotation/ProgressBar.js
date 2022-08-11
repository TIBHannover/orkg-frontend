import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import Tippy from '@tippyjs/react';
import { useSelector } from 'react-redux';
import { upperFirst, filter, meanBy } from 'lodash';
import { Progress } from 'reactstrap';

const RECOMMENDED_ANNOTATION_AMOUNT = 2;

const ProgressBar = () => {
    const { recommendedClasses } = useOntology();
    const annotations = useSelector(state => state.pdfTextAnnotation.annotations);

    const classesWithCompletion = recommendedClasses.map(_class => {
        const annotationsFiltered = filter(annotations, { type: _class.iri });
        const amount = annotationsFiltered.length;
        const percentage = amount >= RECOMMENDED_ANNOTATION_AMOUNT ? 100 : Math.round(100 * (amount / RECOMMENDED_ANNOTATION_AMOUNT));

        return {
            label: _class.label,
            amount,
            percentage,
        };
    });

    const percentageTotal = Math.round(meanBy(classesWithCompletion, _class => _class.percentage));

    const completionTooltip = (
        <div style={{ fontSize: '110%' }}>
            The completion indicates if you did sufficiently describe the most important types. Completion is only an indication and can be ignored.
            <hr style={{ background: 'grey' }} />
            <table className="mb-2" width="100%">
                <tbody>
                    {classesWithCompletion.map((_class, index) => (
                        <tr key={_class.label}>
                            <td>
                                {upperFirst(_class.label)} ({_class.amount}/{RECOMMENDED_ANNOTATION_AMOUNT})
                            </td>
                            <td className="text-end">{_class.percentage}%</td>
                        </tr>
                    ))}
                    <tr>
                        <td />
                        <td className="text-end pt-2" style={{ borderTop: '2px solid #fff' }}>
                            Total: {percentageTotal}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );

    return (
        <Tippy content={completionTooltip} placement="bottom">
            <div className="mb-4" id="completion-bar">
                Completion {percentageTotal}%
                <Progress color="success" value={percentageTotal} />
            </div>
        </Tippy>
    );
};

ProgressBar.propTypes = {};

export default ProgressBar;
