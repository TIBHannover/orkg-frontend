import { faChartBar, faCodeBranch, faFile, faPaperclip } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Button } from 'reactstrap';
import { getStatements, statementsUrl } from 'services/backend/statements';
import { ComparisonVersion, Statement } from 'services/backend/types';
import useSWR from 'swr';
import { getComparisonData } from 'utils';

type VersionTooltipProps = {
    version: ComparisonVersion;
};

const VersionTooltip: FC<VersionTooltipProps> = ({ version }) => {
    const [isActive, setIsActive] = useState(false);

    const { data, isLoading } = useSWR(
        isActive && version.id ? [{ subjectId: version.id, returnContent: true }, statementsUrl, 'getStatementsBySubject'] : null,
        ([params]) => getStatements(params) as Promise<Statement[]>,
    );

    const _data = getComparisonData(version, data ?? []);

    return (
        <Tooltip
            onTrigger={() => setIsActive(true)}
            content={
                <>
                    {version.label}
                    <div className="d-flex mt-1">
                        {!isLoading && (
                            <div className="flex-grow-1">
                                {_data?.contributions?.length && (
                                    <>
                                        <FontAwesomeIcon size="sm" icon={faFile} className="me-1" /> {_data?.contributions?.length} Contributions
                                    </>
                                )}
                                {_data.visualizations && (
                                    <>
                                        <FontAwesomeIcon size="sm" icon={faChartBar} className="ms-2 me-1" /> {_data.visualizations?.length}{' '}
                                        Visualizations
                                    </>
                                )}
                                {(_data.resources?.length > 0 || _data.figures?.length > 0) && (
                                    <>
                                        <FontAwesomeIcon size="sm" icon={faPaperclip} className="ms-2 me-1" />{' '}
                                        {_data.resources.length + _data.resources.length} attachments
                                    </>
                                )}
                            </div>
                        )}
                        {isLoading && <div className="flex-grow-1">Loading...</div>}
                        <div>
                            <UserAvatar userId={version.created_by} />
                        </div>
                    </div>
                </>
            }
        >
            <span>
                <Link href={reverse(ROUTES.COMPARISON, { comparisonId: version.id })}>Version {dayjs(version.created_at).format('DD-MM-YYYY')}</Link>
            </span>
        </Tooltip>
    );
};

type VersionsProps = {
    versions: ComparisonVersion[];
};

const Versions = ({ versions }: VersionsProps) => {
    const [showMore, setShowMore] = useState(false);
    const _versions = !showMore && versions?.length > 0 ? versions.slice(1, 3) : versions.slice(1);

    return (
        <small>
            <FontAwesomeIcon size="sm" icon={faCodeBranch} className="me-1" /> Versions:{' '}
            {_versions.map((version, index) => (
                <span key={version.id}>
                    <VersionTooltip version={version} />
                    {(index < _versions.length - 1 || versions.length > 3) && ' • '}
                </span>
            ))}
            {versions.length > 3 && (
                <Button
                    style={{ verticalAlign: 'baseline' }}
                    className="p-0 text-decoration-none"
                    size="sm"
                    onClick={() => setShowMore((v) => !v)}
                    color="link"
                >
                    {showMore ? 'Show less' : 'Show more'}
                </Button>
            )}
        </small>
    );
};

export default Versions;
