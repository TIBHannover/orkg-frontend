import DOMPurify from 'isomorphic-dompurify';
import { FC } from 'react';

type PaperTitleProps = {
    title?: string;
    className?: string;
};

// https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/face-markup/
// Includes Crossref MathML structural elements (https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/mathml/)
// rendered natively by the browser after stripping the `mml:` namespace.
const FACE_MARKUPS = [
    'b',
    'i',
    'u',
    'ovl',
    'sup',
    'sub',
    'scp',
    'tt',
    'mml:math',
    'mml:mrow',
    'mml:mo',
    'mml:mi',
    'mml:mn',
    'mml:msup',
    'mml:msub',
    'mml:msubsup',
    'mml:mover',
    'mml:munder',
    'mml:munderover',
    'mml:msqrt',
    'mml:mfrac',
    'mml:mtable',
    'mml:mtr',
    'mml:mtd',
    'mml:mtext',
    'mml:mspace',
    'mml:mfenced',
    'mml:semantics',
    'mml:annotation',
];

const PaperTitle: FC<PaperTitleProps> = ({ title, className }) => {
    if (!title) {
        return <em>No title</em>;
    }
    // Browsers render MathML natively (Firefox always; Chromium 109+; Safari 16+) once the `mml:` namespace is stripped.
    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(title, { ALLOWED_TAGS: FACE_MARKUPS }).replaceAll('<mml:', '<').replaceAll('</mml:', '</'),
            }}
        />
    );
};

export default PaperTitle;
