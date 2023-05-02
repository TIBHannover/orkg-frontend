import CopyToClipboardButton from 'components/ValuePlugins/Code/CopyToClipboardButton';
import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/cjs/languages/hljs/python';
import r from 'react-syntax-highlighter/dist/cjs/languages/hljs/r';
import github from 'react-syntax-highlighter/dist/cjs/styles/hljs/github';
import { Button } from 'reactstrap';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('r', r);

// when adding a language, make sure to also update REGEX.GITHUB_CODE_URL
const SUPPORTED_LANGUAGES = [
    { extension: 'py', language: 'python' },
    { extension: 'r', language: 'r' },
];

const Code = ({ children, type }) => {
    const [code, setCode] = useState('');
    const [isShowAll, setIsShowAll] = useState(false);
    const label = children;
    const labelToText = renderToString(label);
    const isGithubUrl = labelToText && type === ENTITIES.LITERAL ? labelToText.match(new RegExp(REGEX.GITHUB_CODE_URL)) : false;
    const isSupportedLanguage =
        labelToText && type === ENTITIES.LITERAL
            ? SUPPORTED_LANGUAGES.find(language => labelToText.toLowerCase().endsWith(`.${language.extension}`))
            : false;
    const isCodeBlock = isGithubUrl && isSupportedLanguage;

    useEffect(() => {
        const fetchCode = async () => {
            const _code = await fetch(labelToText);
            setCode(await _code.text());
        };
        if (isCodeBlock) {
            fetchCode();
        }
    }, [isCodeBlock, labelToText]);

    if (!labelToText) {
        return '';
    }

    const codeToShow = !isShowAll ? `${code.split('\n').slice(0, 5).join('\n')}\n${code.split('\n').length > 5 && '...'}` : code;

    if (isCodeBlock) {
        return (
            <>
                <CopyToClipboardButton code={code}>
                    <SyntaxHighlighter
                        className="m-0"
                        language={SUPPORTED_LANGUAGES.find(language => labelToText.endsWith(`.${language.extension}`)?.language)}
                        style={github}
                    >
                        {codeToShow}
                    </SyntaxHighlighter>
                </CopyToClipboardButton>
                <div>
                    <Button size="sm" color="link" className="p-0" onClick={() => setIsShowAll(v => !v)}>
                        {isShowAll ? 'Show less' : 'Show all'}
                    </Button>
                </div>
            </>
        );
    }
    return label;
};

Code.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
};

export default Code;
