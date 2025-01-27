import HierarchyIndicator from 'components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import { getBackgroundColor } from 'components/DataBrowser/utils/dataBrowserUtils';
import { StatementWrapperStyled } from 'components/DataBrowser/styles/styled';
import { isEqual, range } from 'lodash';
import { FC, PropsWithChildren, useState, useEffect } from 'react';
import { Statement } from 'services/backend/types';
import { ENTITIES } from 'constants/graphSettings';
import { useLocation } from 'react-use';

type LayoutTripleObjectProps = {
    level: number;
    statement: Statement;
    path: string[];
} & PropsWithChildren;

const LayoutTripleObject: FC<LayoutTripleObjectProps> = ({ children, level, statement, path }) => {
    const [isHighlighted, setIsHighlighted] = useState(false);
    const { loadedResources, rootId } = useDataBrowserState();
    const { hash } = useLocation();

    useEffect(() => {
        // Check if this statement's ID matches the URL hash
        if (hash === `#${statement.object.id}` && isEqual(loadedResources[statement.object.id], path) && rootId !== statement.object.id) {
            setIsHighlighted(true);
            setTimeout(() => window.history.replaceState(null, '', window.location.pathname + window.location.search), 3000);
            // Clear the hash after highlighting
        }
    }, [statement.object.id, hash, path, loadedResources, rootId]);

    return (
        <>
            <StatementWrapperStyled
                className={`px-2 py-1 text-wrap flex-grow-1 d-flex align-items-center ${isHighlighted ? 'highlight' : ''}`}
                style={{ background: getBackgroundColor(level) }}
                onAnimationEnd={() => setIsHighlighted(false)}
                {...(statement.object._class !== ENTITIES.LITERAL &&
                    isEqual(loadedResources[statement.object.id], path) &&
                    rootId !== statement.object.id && { id: statement.object.id })}
            >
                {children}
            </StatementWrapperStyled>
            {level > 0 && <HierarchyIndicator side="right" path={range(level).map((c) => c.toString())} showHorizontalLine={false} />}
        </>
    );
};
export default LayoutTripleObject;
