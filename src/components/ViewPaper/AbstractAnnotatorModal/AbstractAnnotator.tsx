import { FC, ReactElement, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { OptionType } from '@/components/Autocomplete/types';
import AnnotationTooltip from '@/components/ViewPaper/AbstractAnnotatorModal/AnnotationTooltip';
import { Range, RootStore } from '@/slices/types';
import { createAnnotation } from '@/slices/viewPaperSlice';

function isSelectionBackwards(selection: Selection): boolean {
    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
    if (!anchorNode || !focusNode || selection.isCollapsed) {
        return false;
    }
    if (anchorNode === focusNode) {
        return focusOffset < anchorOffset;
    }
    const position = anchorNode.compareDocumentPosition(focusNode);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return false;
    }
    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return true;
    }
    return false;
}

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
        const root = annotatorRef.current;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || sel.isCollapsed) {
            return null;
        }
        const { anchorNode, focusNode } = sel;
        if (!anchorNode || !focusNode || !root.contains(anchorNode) || !root.contains(focusNode)) {
            return null;
        }
        let start = parseInt((sel.anchorNode?.parentNode as HTMLElement)?.dataset.position ?? '', 10);
        let end = parseInt((sel.focusNode?.parentNode as HTMLElement)?.dataset.position ?? '', 10);
        const text = sel.toString();
        if (!text.length) {
            return null;
        }
        if (isSelectionBackwards(sel)) {
            [start, end] = [end, start];
        }
        const pos = getAllIndexes(abstract, text);
        if (pos === undefined || pos.length === 0) {
            return null;
        }
        const closest = pos.reduce((prev, curr) => (Math.abs(curr - start) < Math.abs(prev - start) ? curr : prev), 0);
        start = closest;
        end = start + text.length - 1;
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
        <div role="textbox" tabIndex={0} onMouseUp={handleMouseUp} id="annotatedText" className="mt-6 leading-loose" ref={annotatorRef}>
            {annotatedText}
        </div>
    );
};

export default AbstractAnnotator;
