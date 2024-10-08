import Link from 'next/link';
import { useState } from 'react';
import { CardTitle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import useContributors from 'components/TopContributors/hooks/useContributors';
import ROUTES from 'constants/routes';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { StyledGravatar, StyledDotGravatar, ContributorsAvatars } from 'components/styled';
import Tippy from '@tippyjs/react';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import pluralize from 'pluralize';
import ContributorsModal from 'components/TopContributors/ContributorsModal';
import ContributorsDropdownFilter from 'components/TopContributors/ContributorsDropdownFilter';

const Contributors = ({ researchFieldId }) => {
    const { contributors, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useContributors({
        researchFieldId,
        pageSize: 19,
        initialSort: 'all',
        includeSubFields: true,
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
            {!isLoading && contributors && contributors.length > 0 && (
                <ContributorsAvatars>
                    {contributors.slice(0, 18).map((contributor /* 18 perfect for the container width */) => (
                        <div key={`contributor${contributor.id}`}>
                            <Tippy
                                offset={[0, 20]}
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
                            </Tippy>
                        </div>
                    ))}
                    {contributors.length > 18 && (
                        <Tippy key="contributor" content="View More">
                            <StyledDotGravatar onClick={() => setOpenModal((v) => !v)} className="rounded-circle">
                                <Icon icon={faEllipsisH} />
                            </StyledDotGravatar>
                        </Tippy>
                    )}
                </ContributorsAvatars>
            )}
            {!isLoading && contributors?.length === 0 && (
                <div className="mt-4 mb-4">
                    {sort === 'top' ? 'No contributors in the last 30 days yet.' : 'No contributors in this research field yet.'}
                    <i> Be the first contributor!</i>
                </div>
            )}
            {contributors.length > 18 && openModal && (
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

Contributors.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
};

export default Contributors;
