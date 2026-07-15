import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { isEqual } from 'lodash';
import { Dispatch, FC, ReactElement, SetStateAction } from 'react';

import LayoutTripleObject from '@/components/DataBrowser/components/Body/Statement/Object/LayoutTripleObject';
import SortableValueItem from '@/components/DataBrowser/components/Body/Statement/SortableValueItem/SortableValueItem';
import ValueDatatype from '@/components/DataBrowser/components/Body/Statement/ValueDatatype/ValueDatatype';
import ValueInputField from '@/components/DataBrowser/components/Body/ValueInputField/ValueInputField';
import ValueOptions from '@/components/DataBrowser/components/Body/ValueOptions/ValueOptions';
import HistoryLink from '@/components/DataBrowser/components/HistoryLink/HistoryLink';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { CLASSES, ENTITIES, MISC, PREDICATES } from '@/constants/graphSettings';
import { Statement } from '@/services/backend/types';
import { getLinkByEntityType, getResourceLink } from '@/utils';

type SingleStatementProps = {
    path: string[];
    level: number;
    statement: Statement;
    isEditingValue: boolean;
    hasObjectStatements: boolean;
    setShowSubLevel: Dispatch<SetStateAction<boolean>>;
    showSubLevel: boolean;
    setIsEditingValue: Dispatch<SetStateAction<boolean>>;
};

const EntityTypeBadge = ({ children }: { children: React.ReactNode }) => (
    <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full text-white text-[9px] font-bold border mr-[3px] align-middle"
        style={{
            background: 'var(--color-secondary)',
            borderColor: 'var(--color-secondary-darker)',
        }}
    >
        {children}
    </span>
);

const ObjectLabel: FC<{ statement: Statement }> = ({ statement }) => (
    <>
        {statement.object._class === ENTITIES.CLASS && <EntityTypeBadge>C</EntityTypeBadge>}
        {statement.object._class === ENTITIES.PREDICATE && <EntityTypeBadge>P</EntityTypeBadge>}
        {('formatted_label' in statement.object && statement.object.formatted_label) || statement.object.label || <i>No label</i>}
    </>
);
const TripleObject: FC<SingleStatementProps> = ({
    level,
    statement,
    path,
    isEditingValue,
    hasObjectStatements,
    setShowSubLevel,
    showSubLevel,
    setIsEditingValue,
}) => {
    const { config, preferences, loadedResources } = useDataBrowserState();

    const { isEditMode, valuesAsLinks } = config;

    const elementListWrapper = (children: ReactElement) => <SortableValueItem statement={statement}>{children}</SortableValueItem>;
    const { getHistoryHref, navigateToPath } = useHistory();
    if (!isEditingValue) {
        const isNonLiteral = statement.object._class !== ENTITIES.LITERAL;
        const canExpand =
            !isEditMode &&
            isNonLiteral &&
            isEqual(loadedResources[statement.object.id], path) &&
            !path.includes(statement.object.id) &&
            hasObjectStatements;

        const objectPath = [...path, statement.predicate.id, statement.object.id];
        // valuesAsLinks (resource/class/property pages, review sections) means a value leaves the data
        // browser for the entity's own — possibly class-specific — page, so it never owns a history href.
        // Otherwise the ?history= URL owns the state, except in local mode where no URL does (href is
        // null) and the entity's page is the best new-tab/middle-click target, same as the dialog
        // header's "Open resource" link; left-click still navigates in place there.
        const historyHref = valuesAsLinks ? null : getHistoryHref(objectPath);
        const linkHref =
            historyHref ??
            ((valuesAsLinks
                ? getResourceLink(statement.object._class, statement.object.id)
                : getLinkByEntityType(statement.object._class, statement.object.id)) ||
                '#');

        return (
            <LayoutTripleObject level={level} statement={statement} path={path}>
                <ConditionalWrapper
                    key={statement.id}
                    condition={
                        'classes' in statement.subject &&
                        statement.subject.classes.includes(CLASSES.LIST) &&
                        statement.predicate.id === PREDICATES.HAS_LIST_ELEMENT
                    }
                    wrapper={elementListWrapper}
                >
                    <div className="break-all overflow-x-auto overflow-y-hidden">
                        {isNonLiteral && (
                            <HistoryLink
                                href={linkHref}
                                isHistoryHref={historyHref !== null}
                                // valuesAsLinks values are plain links — let the browser navigate
                                onNavigate={valuesAsLinks ? undefined : () => navigateToPath(objectPath)}
                                className="text-accent hover:underline underline-offset-2"
                            >
                                <ObjectLabel statement={statement} />
                            </HistoryLink>
                        )}
                        {statement.object._class === ENTITIES.LITERAL && (
                            <ValuePlugins
                                datatype={'datatype' in statement.object ? statement.object.datatype : MISC.DEFAULT_LITERAL_DATATYPE}
                                type={statement.object._class}
                            >
                                {statement.object.label || 'No label'}
                            </ValuePlugins>
                        )}
                        {preferences.showInlineDataTypes && <ValueDatatype value={statement.object} />}
                        {canExpand && (
                            <Button
                                isIconOnly
                                size="sm"
                                variant="ghost"
                                className="ml-1 h-6 w-6 min-w-0 rounded-md align-middle"
                                onPress={() => setShowSubLevel((v) => !v)}
                                aria-label={`${showSubLevel ? 'collapse' : 'expand'} nested statements`}
                            >
                                <FontAwesomeIcon color="var(--color-secondary)" icon={showSubLevel ? faMinusSquare : faPlusSquare} />
                            </Button>
                        )}
                        <ValueOptions
                            showPreview={() => setShowSubLevel((v) => !v)}
                            path={path}
                            statement={statement}
                            hasObjectStatements={hasObjectStatements}
                            toggleEditValue={() => setIsEditingValue((prev) => !prev)}
                        />
                    </div>
                </ConditionalWrapper>
            </LayoutTripleObject>
        );
    }

    return (
        <LayoutTripleObject level={level} statement={statement} path={path}>
            <ValueInputField value={statement.object} predicate={statement.predicate} toggleShowInput={() => setIsEditingValue((prev) => !prev)} />
        </LayoutTripleObject>
    );
};
export default TripleObject;
