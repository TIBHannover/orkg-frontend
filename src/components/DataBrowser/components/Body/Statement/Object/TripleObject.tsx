import { faMinusSquare, faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import LayoutTripleObject from 'components/DataBrowser/components/Body/Statement/Object/LayoutTripleObject';
import SortableValueItem from 'components/DataBrowser/components/Body/Statement/SortableValueItem/SortableValueItem';
import ValueDatatype from 'components/DataBrowser/components/Body/Statement/ValueDatatype/ValueDatatype';
import ValueInputField from 'components/DataBrowser/components/Body/ValueInputField/ValueInputField';
import ValueOptions from 'components/DataBrowser/components/Body/ValueOptions/ValueOptions';
import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { CLASSES, ENTITIES, MISC, PREDICATES } from 'constants/graphSettings';
import Link from 'next/link';
import { Dispatch, FC, ReactElement, SetStateAction } from 'react';
import { Button } from 'reactstrap';
import { Statement } from 'services/backend/types';
import styled from 'styled-components';
import { getResourceLink } from 'utils';

type SingleStatementProps = {
    path: string[];
    level: number;
    statement: Statement;
    isEditingValue: boolean;
    handleOnClick: () => void;
    hasObjectStatements: boolean;
    setShowSubLevel: Dispatch<SetStateAction<boolean>>;
    showSubLevel: boolean;
    setIsEditingValue: Dispatch<SetStateAction<boolean>>;
};

const EntityTypeStyled = styled.div`
    width: 18px;
    height: 18px;
    line-height: 15px;
    text-align: center;
    color: white;
    display: inline-block;
    border: 1px ${(props) => props.theme.secondaryDarker} solid;
    margin-right: 3px;
    border-radius: 100%;
    font-size: 9px;
    font-weight: bold;
    background: ${(props) => props.theme.secondary};
`;

const TripleObject: FC<SingleStatementProps> = ({
    level,
    statement,
    path,
    isEditingValue,
    handleOnClick,
    hasObjectStatements,
    setShowSubLevel,
    showSubLevel,
    setIsEditingValue,
}) => {
    const { config, preferences } = useDataBrowserState();

    const { isEditMode, valuesAsLinks } = config;

    const elementListWrapper = (children: ReactElement) => <SortableValueItem statement={statement}>{children}</SortableValueItem>;

    if (!isEditingValue) {
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
                    <div className="text-break" style={{ overflowX: 'auto' }}>
                        {valuesAsLinks && statement.object._class !== ENTITIES.LITERAL && (
                            <Link href={getResourceLink(statement.object._class, statement.object.id)}>
                                {statement.object._class === ENTITIES.CLASS && <EntityTypeStyled>C</EntityTypeStyled>}
                                {statement.object._class === ENTITIES.PREDICATE && <EntityTypeStyled>P</EntityTypeStyled>}
                                {('formatted_label' in statement.object && statement.object.formatted_label) || statement.object.label || (
                                    <i>No label</i>
                                )}
                            </Link>
                        )}
                        {!valuesAsLinks && statement.object._class !== ENTITIES.LITERAL && (
                            <span>
                                <Button className="p-0 text-start" color="link" onClick={() => handleOnClick()} style={{ userSelect: 'text' }}>
                                    {statement.object._class === ENTITIES.CLASS && <EntityTypeStyled>C</EntityTypeStyled>}
                                    {statement.object._class === ENTITIES.PREDICATE && <EntityTypeStyled>P</EntityTypeStyled>}
                                    {('formatted_label' in statement.object && statement.object.formatted_label) || statement.object.label || (
                                        <i>No label</i>
                                    )}
                                </Button>
                            </span>
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
                        {!isEditMode && !path.includes(statement.object.id) && hasObjectStatements && (
                            <Button
                                color="link"
                                className="p-0 ms-1"
                                onClick={() => setShowSubLevel((v) => !v)}
                                aria-label={`${showSubLevel ? 'collapse' : 'expand'} nested statements`}
                            >
                                <FontAwesomeIcon color="rgb(128, 134, 155)" icon={showSubLevel ? faMinusSquare : faPlusSquare} />
                            </Button>
                        )}
                        <ValueOptions
                            showPreview={() => setShowSubLevel((v) => !v)}
                            path={path}
                            statement={statement}
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
