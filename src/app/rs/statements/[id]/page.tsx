'use client';

import { faCopyright, faFile, faPen, faPuzzlePiece, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
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
import Badge from '@/components/Ui/Badge/Badge';
import Button from '@/components/Ui/Button/Button';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
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
            {isLoading && <Container className="box rounded pt-4 pb-4 ps-5 pe-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && (error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />)}
            {!isLoading && !error && statement && (
                <>
                    <TitleBar
                        buttonGroup={
                            <>
                                {!isEditMode && (
                                    <RequireAuthentication
                                        component={Button}
                                        className="float-end"
                                        color="secondary"
                                        size="sm"
                                        onClick={() => toggleIsEditMode()}
                                    >
                                        <FontAwesomeIcon icon={faPen} /> Edit
                                    </RequireAuthentication>
                                )}
                                {isEditMode && (
                                    <Button className="flex-shrink-0" color="secondary-darker" size="sm" onClick={() => toggleIsEditMode()}>
                                        <FontAwesomeIcon icon={faTimes} /> Stop editing
                                    </Button>
                                )}
                            </>
                        }
                    >
                        Statement
                    </TitleBar>

                    <Container className={`box clearfix pt-4 pb-4 ps-4 pe-4 ${isEditMode ? 'rounded-bottom' : 'rounded'}`}>
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
                        <div className="tw:flex-wrap tw:flex tw:gap-x-1 tw:gap-y-2 tw:mt-2">
                            <Badge color="light">
                                <span>
                                    <FontAwesomeIcon icon={faPuzzlePiece} />
                                </span>
                                <span>{' Statement template: '}</span>
                                {isLoadingTemplate && <>Loading...</>}
                                {!isLoadingTemplate && template && (
                                    <Link target="_blank" href={reverse(ROUTES.RS_TEMPLATE, { id: template.id })}>
                                        {template.label ? template.label : <em>No title</em>}
                                    </Link>
                                )}
                            </Badge>

                            <Badge color="light">
                                <span>
                                    <FontAwesomeIcon icon={faCopyright} />
                                </span>
                                <span>{' Statement type: '}</span> {(isLoadingClass || isLoadingTemplate) && <>Loading...</>}
                                {!isLoadingClass && !isLoadingTemplate && template && (
                                    <DescriptionTooltip id={statementClass?.id} _class={ENTITIES.CLASS}>
                                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: template.target_class })}>
                                            {statementClass?.label}
                                        </Link>
                                    </DescriptionTooltip>
                                )}
                            </Badge>
                            {!isLoadingContext && context && (
                                <Badge color="light" className="d-inline-block text-truncate" style={{ maxWidth: '50%' }} title={context.title}>
                                    <span>
                                        <FontAwesomeIcon icon={faFile} />
                                    </span>
                                    <span>{' Context: '}</span>
                                    <Link href={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: context.id, contributionId: 'statements' })}>
                                        {context.title}
                                    </Link>
                                </Badge>
                            )}
                        </div>
                    </Container>

                    <Container className="mt-3 p-0">
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
