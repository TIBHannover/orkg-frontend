import { MathJax as MathJaxPreview } from 'better-react-mathjax';
import DOMPurify from 'isomorphic-dompurify';
import { FC } from 'react';

type PaperTitleProps = {
    title?: string;
    className?: string;
};

// https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/face-markup/
const FACE_MARKUPS = ['b', 'i', 'u', 'ovl', 'sup', 'sub', 'scp', 'tt', 'mml:mrow', 'mml:math', 'mml:mo', 'mml:msup', 'mml:mover', 'mml:mi'];

const PaperTitle: FC<PaperTitleProps> = ({ title, className }) => {
    if (!title) {
        return <em>No title</em>;
    }
    // Removing the mml: namespace because MathJax (MathML setup) doesn't support namespaces
    // https://www.crossref.org/documentation/schema-library/markup-guide-metadata-segments/mathml/
    // https://docs.mathjax.org/en/v1.0/configuration.html
    return (
        <MathJaxPreview inline className="[&_div]:inline [&_.MathJax]:!inline">
            <span
                className={className}
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(title, { ALLOWED_TAGS: FACE_MARKUPS }).replaceAll('<mml:', '<').replaceAll('</mml:', '</'),
                }}
            />
        </MathJaxPreview>
    );
};

export default PaperTitle;
