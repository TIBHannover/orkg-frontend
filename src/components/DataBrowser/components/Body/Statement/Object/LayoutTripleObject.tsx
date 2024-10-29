import HierarchyIndicator from 'components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import { getBackgroundColor } from 'components/DataBrowser/utils/dataBrowserUtils';
import { StatementWrapperStyled } from 'components/DataBrowser/styles/styled';
import { range } from 'lodash';
import { FC, PropsWithChildren } from 'react';
import { Statement } from 'services/backend/types';

type LayoutTripleObjectProps = {
    level: number;
    statement: Statement;
    path: string[];
} & PropsWithChildren;

const LayoutTripleObject: FC<LayoutTripleObjectProps> = ({ children, level, statement, path }) => {
    const dispatch = useDataBrowserDispatch();

    const { highlightedCycle } = useDataBrowserState();

    const highlight = highlightedCycle === statement.object.id && !path.includes(statement.object.id);

    return (
        <>
            <StatementWrapperStyled
                className={`px-2 py-1 text-wrap flex-grow-1 d-flex align-items-center ${highlight ? 'highlight' : ''}`}
                style={{ background: getBackgroundColor(level) }}
                onAnimationEnd={() => highlightedCycle && dispatch({ type: 'HIGHLIGHT_CYCLE', payload: '' })}
            >
                {children}
            </StatementWrapperStyled>
            {level > 0 && <HierarchyIndicator side="right" path={range(level).map((c) => c.toString())} showHorizontalLine={false} />}
        </>
    );
};
export default LayoutTripleObject;
