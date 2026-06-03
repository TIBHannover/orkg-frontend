import DOMPurify from 'isomorphic-dompurify';
import katex from 'katex';
import { FC } from 'react';
import ReactStringReplace from 'react-string-replace';

const expression = /(\${2}.*\${2})/gm;

export const isMathValue = (text: string) => new RegExp(expression).test(text);

// Hardened per https://katex.org/docs/security
//   trust: false        — block \href/\url/\includegraphics/\html* (default; explicit for clarity)
//   maxSize: 10         — cap user-specified element sizes (em); prevents layout-DoS via \rule{9999em}{...}
//   maxExpand: 100      — tighter macro-expansion budget than the 1000 default
//   strict: 'ignore'    — silence non-security parse warnings from user content
//   throwOnError: false — error messages otherwise contain unescaped LaTeX source
const KATEX_OPTIONS = {
    throwOnError: false,
    errorColor: '#cc0000',
    displayMode: false,
    trust: false,
    strict: 'ignore' as const,
    maxSize: 10,
    maxExpand: 100,
};

// Defense-in-depth: KaTeX docs recommend sanitizing output. DOMPurify defaults allow
// the HTML/MathML/SVG that KaTeX emits while stripping scripts, on* handlers, and
// javascript: URIs — invariant under any future KaTeX output drift. We must allow
// the MathML 3 <semantics> + <annotation> wrappers KaTeX uses for the screen-reader
// MathML; without them DOMPurify leaks the raw LaTeX source as a text node inside
// <math>, which the browser then renders alongside the visual KaTeX output.
const SANITIZE_OPTIONS = { ADD_TAGS: ['semantics', 'annotation'], ADD_ATTR: ['encoding'] };
const renderTex = (tex: string) => DOMPurify.sanitize(katex.renderToString(tex, KATEX_OPTIONS), SANITIZE_OPTIONS);

type MathProps = {
    text: string;
};

const Math: FC<MathProps> = ({ text }) => {
    if (!isMathValue(text)) {
        return text;
    }
    return ReactStringReplace(text, new RegExp(expression), (match, i) => (
        <span key={i} dangerouslySetInnerHTML={{ __html: renderTex(match.slice(2, -2)) }} />
    ));
};

export default Math;
