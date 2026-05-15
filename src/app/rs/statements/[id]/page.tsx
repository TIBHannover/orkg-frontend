'use client';

import { faCopyright, faFile, faPen, faPuzzlePiece, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Chip } from '@heroui/react';
import Link from 'next/link';
import { useEffect } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import ItemMetadata from '@/components/ItemMetadata/ItemMetadata';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import useRosettaTemplate from '@/components/RosettaStone/SingleStatement/hooks/useRosettaTemplate';
import useRosettaStatements from '@/components/RosettaStone/SingleStatement/hooks/useStatements';
import SingleStatement from '@/components/RosettaStone/SingleStatement/SingleStatement';
import TitleBar from '@/components/TitleBar/TitleBar';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { classesUrl, getClassById } from '@/services/backend/classes';
import { getPaper, papersUrl } from '@/services/backend/papers';
import { Thing } from '@/services/backend/things';

const RSStatementPage = () => {
    const { id } = useParams<{ id: string }>();
    const { isEditMode, toggleIsEditMode } = useIsEditMode();

    const { data: statement, isLoading, error, mutate: reloadStatement } = useRosettaStatements({ id });

    const { data: template, isLoading: isLoadingTemplate } = useRosettaTemplate({ id: statement?.template_id ?? '' });

    const { data: statementClass, isLoading: isLoadingClass } = useSWR(
        template?.target_class ? [template.target_class, classesUrl, 'getClassById'] : null,
        ([params]) => getClassById(params),
    );

    const { data: context, isLoading: isLoadingContext } = useSWR(
        statement?.context ? [statement.context, papersUrl, 'getStatement'] : null,
        ([params]) => getPaper(params),
    );

    useEffect(() => {
        document.title = `Statement - ORKG`;
    }, []);

    return (
        <>
            {isLoading && (
                <Container className="mt-12">
                    <div className="box rounded pt-6 pb-6 pl-12 pr-12 flow-root">Loading ...</div>
                </Container>
            )}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && !error && statement && (
                <>
                    <TitleBar
                        buttonGroup={
                            <ButtonGroup size="sm">
                                {!isEditMode ? (
                                    <RequireAuthentication
                                        component={Button}
                                        size="sm"
                                        className="button--orkg-secondary"
                                        onClick={() => toggleIsEditMode()}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                ) : (
                                    <Button size="sm" className="button--orkg-secondary" onPress={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </ButtonGroup>
                        }
                    >
                        Statement
                    </TitleBar>

                    <Container>
                        <div className={`box flow-root pt-6 pb-6 pl-6 pr-6 ${isEditMode ? 'rounded-b' : 'rounded'}`}>
                            <h3 className="" style={{ overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                                {statement?.label || statement?.id || (
                                    <i>
                                        <small>No label</small>
                                    </i>
                                )}
                            </h3>
                            <ItemMetadata
                                item={statement as unknown as Thing}
                                showCreatedAt
                                showCreatedBy
                                showProvenance
                                showExtractionMethod
                                editMode={isEditMode}
                            />
                            <div className="flex-wrap flex gap-x-1 gap-y-2 mt-2">
                                <Chip size="sm">
                                    <FontAwesomeIcon icon={faPuzzlePiece} />
                                    <span>{' Statement template: '}</span>
                                    {isLoadingTemplate && <>Loading...</>}
                                    {!isLoadingTemplate && template && (
                                        <Link target="_blank" href={reverse(ROUTES.RS_TEMPLATE, { id: template.id })}>
                                            {template.label ? template.label : <em>No title</em>}
                                        </Link>
                                    )}
                                </Chip>

                                <Chip size="sm">
                                    <FontAwesomeIcon icon={faCopyright} />
                                    <span>{' Statement type: '}</span> {(isLoadingClass || isLoadingTemplate) && <>Loading...</>}
                                    {!isLoadingClass && !isLoadingTemplate && template && (
                                        <DescriptionTooltip id={statementClass?.id} _class={ENTITIES.CLASS}>
                                            <Link target="_blank" href={reverse(ROUTES.CLASS, { id: template.target_class })}>
                                                {statementClass?.label}
                                            </Link>
                                        </DescriptionTooltip>
                                    )}
                                </Chip>
                                {!isLoadingContext && context && (
                                    <Chip size="sm" className="inline-block truncate" style={{ maxWidth: '50%' }} title={context.title}>
                                        <FontAwesomeIcon icon={faFile} />
                                        <span>{' Context: '}</span>
                                        <Link
                                            href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: context.id, contributionId: 'statements' })}
                                        >
                                            {context.title}
                                        </Link>
                                    </Chip>
                                )}
                            </div>
                        </div>
                    </Container>

                    <Container className="mt-4">
                        <ListGroup>
                            <SingleStatement key={statement.id} statement={statement} reloadStatements={reloadStatement} />
                        </ListGroup>
                    </Container>
                </>
            )}
        </>
    );
};

export default RSStatementPage;
