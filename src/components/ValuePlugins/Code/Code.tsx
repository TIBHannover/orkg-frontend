import { FC, useEffect, useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/cjs/languages/hljs/python';
import r from 'react-syntax-highlighter/dist/cjs/languages/hljs/r';
import github from 'react-syntax-highlighter/dist/cjs/styles/hljs/github';

import Button from '@/components/Ui/Button/Button';
import CopyToClipboardButton from '@/components/ValuePlugins/Code/CopyToClipboardButton';
import REGEX from '@/constants/regex';

SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('r', r);

// when adding a language, make sure to also update REGEX.GITHUB_CODE_URL
const SUPPORTED_LANGUAGES = [
    { extension: 'py', language: 'python' },
    { extension: 'r', language: 'r' },
];

export const isCodeValue = (text: string) => {
    const isGithubUrl = text ? text.match(new RegExp(REGEX.GITHUB_CODE_URL)) : false;
    const isTibUrl = text ? text.match(new RegExp(REGEX.TIB_CODE_URL)) : false;
    const isSupportedLanguage = text ? SUPPORTED_LANGUAGES.find((language) => text.toLowerCase().endsWith(`.${language.extension}`)) : false;
    return (isGithubUrl || isTibUrl) && isSupportedLanguage;
};

type CodeProps = {
    text: string;
};

const Code: FC<CodeProps> = ({ text }) => {
    const [code, setCode] = useState('');
    const [isShowAll, setIsShowAll] = useState(false);
    const isCodeBlock = isCodeValue(text);

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const _code = await fetch(text);
                setCode(await _code.text());
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setCode(e?.message);
                }
            }
        };
        if (isCodeBlock) {
            fetchCode();
        }
    }, [isCodeBlock, text]);

    const isCodeOverflowing = code.split('\n').length > 5;
    const codeToShow = !isShowAll ? `${code.split('\n').slice(0, 5).join('\n')}\n${isCodeOverflowing ? '...' : ''}` : code;

    if (isCodeBlock) {
        return (
            <>
                <CopyToClipboardButton code={code}>
                    <SyntaxHighlighter
                        wrapLongLines
                        className="m-0"
                        language={SUPPORTED_LANGUAGES.find((language) => text.endsWith(`.${language.extension}`))?.language}
                        style={github}
                    >
                        {codeToShow}
                    </SyntaxHighlighter>
                </CopyToClipboardButton>
                {isCodeOverflowing && (
                    <div>
                        <Button size="sm" color="link" className="p-0" onClick={() => setIsShowAll((v) => !v)}>
                            {isShowAll ? 'Show less' : 'Show all'}
                        </Button>
                    </div>
                )}
            </>
        );
    }
    return text;
};

export default Code;
