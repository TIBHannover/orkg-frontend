import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { FC, useState } from 'react';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ContributorsAvatars, StyledDotGravatar, StyledGravatar } from '@/components/styled';
import ContributorsDropdownFilter from '@/components/TopContributors/ContributorsDropdownFilter';
import ContributorsModal from '@/components/TopContributors/ContributorsModal';
import useContributors from '@/components/TopContributors/hooks/useContributors';
import CardTitle from '@/components/Ui/Card/CardTitle';
import ROUTES from '@/constants/routes';

type ContributorsProps = {
    researchFieldId: string;
};

const Contributors: FC<ContributorsProps> = ({ researchFieldId }) => {
    const { contributors, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useContributors({
        researchFieldId,
        pageSize: 19,
        initialSort: 'all',
        initialIncludeSubFields: true,
    });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div>
            <div className="d-flex mb-2">
                <CardTitle tag="h5" className="flex-grow-1">
                    Contributors
                </CardTitle>
                <div className="align-self-center">
                    <ContributorsDropdownFilter
                        sort={sort}
                        isLoading={isLoading}
                        includeSubFields={includeSubFields}
                        setSort={setSort}
                        setIncludeSubFields={setIncludeSubFields}
                    />
                </div>
            </div>
            {!isLoading && contributors && contributors?.length > 0 && (
                <ContributorsAvatars>
                    {contributors?.slice(0, 18).map((contributor) => (
                        <div key={`contributor${contributor.id}`}>
                            <Tooltip
                                placement="bottom"
                                content={
                                    <div className="p-2">
                                        {contributor.display_name}
                                        <br />

                                        <ul className="p-0 ps-3 mb-0 mt-2">
                                            <li>{pluralize('paper', contributor.papers, true)}</li>
                                            <li>{pluralize('contribution', contributor.contributions, true)}</li>
                                            <li>{pluralize('comparison', contributor.comparisons, true)}</li>
                                            <li>{pluralize('visualization', contributor.visualizations, true)}</li>
                                            <li>{pluralize('research problem', contributor.problems, true)}</li>
                                        </ul>

                                        <hr className="mb-1 mt-1" style={{ background: '#fff' }} />
                                        <ul className="p-0 ps-3 mb-0 mt-2">
                                            <li>
                                                <i>
                                                    <b>{contributor.total} </b>
                                                    {pluralize('total contribution', contributor.total, false)}
                                                </i>
                                            </li>
                                        </ul>
                                    </div>
                                }
                            >
                                <Link href={reverse(ROUTES.USER_PROFILE, { userId: contributor.id })}>
                                    <StyledGravatar className="rounded-circle" md5={contributor.gravatar_id} size={48} />
                                </Link>
                            </Tooltip>
                        </div>
                    ))}
                    {contributors?.length > 18 && (
                        <Tooltip key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal((v) => !v)} className="rounded-circle">
                                <FontAwesomeIcon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tooltip>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoading && contributors?.length === 0 && (
                <div className="mt-4 mb-4">
                    {sort === 'top' ? 'No contributors in the last 30 days yet.' : 'No contributors in this research field yet.'}
                    <i> Be the first contributor!</i>
                </div>
            )}
            {contributors && contributors?.length > 18 && openModal && (
                <ContributorsModal
                    initialSort={sort}
                    initialIncludeSubFields={includeSubFields}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                    researchFieldId={researchFieldId}
                />
            )}
            {isLoading && (
                <div className="mt-4 mb-4" style={{ width: '100% !important' }}>
                    <ContentLoader height="100%" width="100%" viewBox="0 0 100 4" style={{ width: '100% !important' }}>
                        <circle cx="2" cy="2" r="2" />
                        <circle cx="7" cy="2" r="2" />
                        <circle cx="12" cy="2" r="2" />
                        <circle cx="17" cy="2" r="2" />
                        <circle cx="22" cy="2" r="2" />
                    </ContentLoader>
                </div>
            )}
        </div>
    );
};

export default Contributors;
