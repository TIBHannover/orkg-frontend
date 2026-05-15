import { components, GroupBase, MenuProps } from 'react-select';

import { OptionType } from '@/components/Autocomplete/types';

type PaperMenuSelectProps = {
    performSemanticScholarLookup?: boolean;
};

const Menu = <IsMulti extends boolean = false>(props: MenuProps<OptionType, IsMulti, GroupBase<OptionType>>) => {
    const { children, selectProps } = props;
    const showSemanticScholarCredit = (selectProps as unknown as PaperMenuSelectProps).performSemanticScholarLookup;

    return (
        <components.Menu {...props}>
            <div>{children}</div>
            {showSemanticScholarCredit && (
                <>
                    <hr className="my-1 border-default-200" />
                    <div className="mb-2 mr-3 text-right text-xs text-default-500">
                        Search supported by{' '}
                        <a href="https://www.semanticscholar.org/" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                            Semantic Scholar
                        </a>
                    </div>
                </>
            )}
        </components.Menu>
    );
};

export default Menu;
