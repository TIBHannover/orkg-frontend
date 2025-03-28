import rangy from 'rangy';
import { FC, ReactElement, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { OptionType } from '@/components/Autocomplete/types';
import AnnotationTooltip from '@/components/ViewPaper/AbstractAnnotatorModal/AnnotationTooltip';
import { Range, RootStore } from '@/slices/types';
import { createAnnotation } from '@/slices/viewPaperSlice';

function getAllIndexes(arr: string, val: string) {
    const indexes = [];
    let i = -1;
    let nextIndex = arr.indexOf(val, i + 1);
    while (nextIndex !== -1) {
        indexes.push(nextIndex);
        i = nextIndex;
        nextIndex = arr.indexOf(val, i + 1);
    }
    return indexes;
}

type AbstractAnnotatorProps = {
    predicateOptions: OptionType[];
    getPredicateColor: (id: string) => string;
};

const AbstractAnnotator: FC<AbstractAnnotatorProps> = ({ predicateOptions, getPredicateColor }) => {
    const annotatorRef = useRef<HTMLDivElement>(null);

    const dispatch = useDispatch();

    const { abstract, ranges } = useSelector((state: RootStore) => state.viewPaper);

    const renderCharNode = (charIndex: number) => (
        <span key={`c${charIndex}`} data-position={charIndex}>
            {abstract[charIndex]}
        </span>
    );

    const getRange = (charPosition: number) =>
        ranges && Object.values(ranges).find((range) => charPosition >= range.start && charPosition <= range.end);

    const tooltipRenderer = (lettersNode: ReactElement[], range: Range) => (
        <AnnotationTooltip
            key={`${range.id}`}
            range={range}
            lettersNode={lettersNode}
            predicateOptions={predicateOptions}
            getPredicateColor={getPredicateColor}
        />
    );

    const getAnnotatedText = () => {
        const annotatedText = [];
        for (let charPosition = 0; charPosition < abstract.length; charPosition += 1) {
            const range = getRange(charPosition);
            const charNode = renderCharNode(charPosition);
            if (range) {
                const annotationGroup = [charNode];
                let rangeCharPosition = charPosition + 1;
                for (; rangeCharPosition < range.end + 1; rangeCharPosition += 1) {
                    annotationGroup.push(renderCharNode(rangeCharPosition));
                    charPosition = rangeCharPosition;
                }
                annotatedText.push(tooltipRenderer(annotationGroup, range));
            } else {
                annotatedText.push(charNode);
            }
        }
        return annotatedText;
    };

    const handleMouseUp = () => {
        if (!annotatorRef.current) {
            return null;
        }
        // Get the selection
        // @ts-expect-error: rangy is not typed
        const sel = rangy.getSelection(annotatorRef.current);
        if (sel.isCollapsed) {
            return null;
        }
        // Get position of the node at which the user started selecting
        let start = parseInt((sel.anchorNode?.parentNode as HTMLElement)?.dataset.position ?? '', 10);
        // Get position of the node at which the user stopped selecting
        let end = parseInt((sel.focusNode?.parentNode as HTMLElement)?.dataset.position ?? '', 10);
        // Get the text within the selection
        const text = sel.toString();
        if (!text.length) {
            return null;
        }
        if (sel.isBackwards()) {
            // if the selection's focus is earlier in the document than the anchor
            [start, end] = [end, start];
        }
        // Find index of all occurrences of selected text in the abstract
        const pos = getAllIndexes(abstract, text);
        // Get the closest number out of occurrences positions
        if (pos === undefined || pos.length === 0) {
            return null;
        }
        const closest = pos.reduce((prev, curr) => (Math.abs(curr - start) < Math.abs(prev - start) ? curr : prev), 0);
        // Update position of selection
        start = closest;
        end = start + text.length - 1;
        // Save range in state
        const range = {
            start,
            end,
            text,
            predicate: { id: null, label: null },
            certainty: 1,
            isEditing: false,
        };
        dispatch(createAnnotation(range));
        window?.getSelection()?.empty();
        return null;
    };

    const annotatedText = getAnnotatedText();
    return (
        <div>
            <div
                role="textbox"
                tabIndex={0}
                onMouseUp={handleMouseUp}
                id="annotatedText"
                className="mt-4"
                style={{ lineHeight: '2.5em' }}
                ref={annotatorRef}
            >
                {annotatedText}
            </div>
        </div>
    );
};

export default AbstractAnnotator;
