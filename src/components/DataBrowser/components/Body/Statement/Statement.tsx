import TripleObject from 'components/DataBrowser/components/Body/Statement/Object/TripleObject';
import TriplePredicate from 'components/DataBrowser/components/Body/Statement/Predicate/TriplePredicate';
import ValuePreviewFactory from 'components/DataBrowser/components/Body/ValuePreviewFactory/ValuePreviewFactory';
import { useDataBrowserDispatch, useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import { getBackgroundColor } from 'components/DataBrowser/utils/dataBrowserUtils';
import useStatement from 'components/DataBrowser/hooks/useStatement';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, Fragment, ReactElement, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Statement } from 'services/backend/types';
import styled from 'styled-components';
import { isEqual } from 'lodash';
import { ENTITIES } from 'constants/graphSettings';

type SingleStatementProps = {
    path: string[];
    level: number;
    statement: Statement;
};

const StatementStyled = styled.div`
    &:hover .actionButtons {
        opacity: 1;
        pointer-events: auto;
    }
`;

const SingleStatement: FC<SingleStatementProps> = ({ statement, path, level = 0 }) => {
    const { config, loadedResources } = useDataBrowserState();
    const dispatch = useDataBrowserDispatch();
    const { isEditMode, valuesAsLinks } = config;

    const {
        isLoadingObjectStatements,
        deleteStatement,
        handleOnClick,
        isEditingValue,
        setIsEditingValue,
        setShowSubLevel,
        showSubLevel,
        objectStatements,
    } = useStatement(statement, path, level);

    const valueWrapper = (children: ReactElement) => <ValuePreviewFactory value={statement.object}>{children}</ValuePreviewFactory>;

    useEffect(() => {
        if (!loadedResources[statement.object.id] && statement.object._class !== ENTITIES.LITERAL) {
            dispatch({ type: 'ADD_LOADED_RESOURCES', payload: { [statement.object.id]: path } });
        }
    }, [dispatch, path, statement.object._class, statement.object.id, loadedResources]);

    return (
        <>
            <motion.div layout>
                <StatementStyled className="br-bottom row g-0">
                    <div className="d-flex" style={{ background: getBackgroundColor(level) }}>
                        <div className="d-flex col-4" style={{ borderRight: '1px solid #e0e0e0' }}>
                            <TriplePredicate level={level} statement={statement} deleteStatement={deleteStatement} />
                        </div>
                        <div className="d-flex flex-grow-1">
                            <TripleObject
                                level={level}
                                path={path}
                                statement={statement}
                                isEditingValue={isEditingValue}
                                handleOnClick={handleOnClick}
                                hasObjectStatements={Object.keys(objectStatements).length > 0}
                                setShowSubLevel={setShowSubLevel}
                                showSubLevel={showSubLevel}
                                setIsEditingValue={setIsEditingValue}
                            />
                        </div>
                    </div>
                </StatementStyled>
            </motion.div>
            {isLoadingObjectStatements && <Skeleton />}
            <AnimatePresence initial={false}>
                {showSubLevel &&
                    statement.object._class !== ENTITIES.LITERAL &&
                    isEqual(loadedResources[statement.object.id] || [], path) &&
                    !path.includes(statement.object.id) &&
                    !isEditMode && (
                        <motion.div
                            key="content"
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={{
                                open: { y: 0, x: 0, right: '0', scale: 1, height: 'auto', originX: '35%', originY: 0 },
                                collapsed: { y: -10, x: 10, right: '50%', scale: 0, height: 0, originX: '35%', originY: 0 },
                            }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                            <ConditionalWrapper condition={!valuesAsLinks && 'classes' in statement.object} wrapper={valueWrapper}>
                                <>
                                    {Object.keys(objectStatements).map((g) => (
                                        <Fragment key={g}>
                                            {objectStatements[g].map((s: Statement) => (
                                                <SingleStatement
                                                    level={level + 1}
                                                    key={s.id}
                                                    statement={s}
                                                    path={[...path, statement.predicate.id, statement.object.id]}
                                                />
                                            ))}
                                        </Fragment>
                                    ))}
                                </>
                            </ConditionalWrapper>
                        </motion.div>
                    )}
            </AnimatePresence>
        </>
    );
};

export default SingleStatement;
