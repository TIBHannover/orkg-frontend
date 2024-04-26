import { useRef } from 'react';
import PropTypes from 'prop-types';
import rangy from 'rangy';
import { useSelector, useDispatch } from 'react-redux';
import { createAnnotation } from 'slices/viewPaperSlice';
import AnnotationTooltip from 'components/ViewPaper/AbstractAnnotatorModal/AnnotationTooltip';

function getAllIndexes(arr, val) {
    const indexes = [];
    let i = -1;
    while ((i = arr.indexOf(val, i + 1)) !== -1) {
        indexes.push(i);
    }
    return indexes;
}

function AbstractAnnotator(props) {
    const annotatorRef = useRef(null);

    const dispatch = useDispatch();

    const abstract = useSelector((state) => state.viewPaper.abstract);
    const ranges = useSelector((state) => state.viewPaper.ranges);

    const renderCharNode = (charIndex) => (
        <span key={`c${charIndex}`} data-position={charIndex}>
            {abstract[charIndex]}
        </span>
    );

    const getRange = (charPosition) =>
        ranges &&
        Object.values(ranges).find(
            (range) => charPosition >= range.start && charPosition <= range.end && range.certainty >= props.certaintyThreshold,
        );

    const tooltipRenderer = (lettersNode, range) => (
        <AnnotationTooltip
            key={`${range.id}`}
            range={range}
            lettersNode={lettersNode}
            classOptions={props.classOptions}
            getClassColor={props.getClassColor}
        />
    );

    const getAnnotatedText = () => {
        const annotatedText = [];
        for (let charPosition = 0; charPosition < abstract.length; charPosition++) {
            const range = getRange(charPosition);
            const charNode = renderCharNode(charPosition);
            if (!range) {
                annotatedText.push(charNode);
                continue;
            }
            const annotationGroup = [charNode];
            let rangeCharPosition = charPosition + 1;
            for (; rangeCharPosition < parseInt(range.end) + 1; rangeCharPosition++) {
                annotationGroup.push(renderCharNode(rangeCharPosition));
                charPosition = rangeCharPosition;
            }
            annotatedText.push(tooltipRenderer(annotationGroup, range));
        }
        return annotatedText;
    };

    const handleMouseUp = () => {
        const sel = rangy.getSelection(annotatorRef.current);
        if (sel.isCollapsed) {
            return null;
        }
        // Get position of the node at which the user started selecting
        let start = parseInt(sel.anchorNode.parentNode.dataset.position);
        // Get position of the node at which the user stopped selecting
        let end = parseInt(sel.focusNode.parentNode.dataset.position);
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
            class: { id: null, label: null },
            certainty: 1,
            isEditing: false,
        };
        dispatch(createAnnotation(range));
        window.getSelection().empty();
    };

    const annotatedText = getAnnotatedText();
    return (
        <div>
            <div
                role="textbox"
                tabIndex="0"
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
}

export default AbstractAnnotator;

AbstractAnnotator.propTypes = {
    certaintyThreshold: PropTypes.number,
    classOptions: PropTypes.array.isRequired,
    getClassColor: PropTypes.func.isRequired,
};
