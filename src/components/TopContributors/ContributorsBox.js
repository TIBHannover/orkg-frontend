import { useState } from 'react';
import useContributors from 'components/TopContributors/hooks/useContributors';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import ContributorsModal from './ContributorsModal';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import pluralize from 'pluralize';

const ContributorsBox = ({ researchFieldId }) => {
    const { contributors, isLoading } = useContributors({ researchFieldId, pageSize: 5, initialSort: 'top' });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h5>
                <Icon icon={faAward} className="text-primary" /> Top Contributors
            </h5>
            <div className="flex-grow-1">
                {!isLoading && contributors && contributors.length > 0 && (
                    <div className="mt-2">
                        {contributors.slice(0, 4).map((contributor, index) => (
                            <div className="pt-1 ps-2 pe-2" key={`rp${index}`}>
                                <ContributorCard
                                    contributor={{
                                        ...contributor.profile,
                                        subTitle: `${pluralize('contribution', contributor.counts.total, true)}`
                                    }}
                                />
                                {contributors.slice(0, 4).length - 1 !== index && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && contributors?.length === 0 && (
                    <div className="mt-4 mb-4">
                        No contributors in this research field yet.
                        <br />
                        <i> Be the first contributor!</i>
                    </div>
                )}
                {!isLoading && contributors?.length > 4 && (
                    <div className="text-center mt-3">
                        <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
                            View more
                        </Button>
                        {openModal && <ContributorsModal openModal={openModal} setOpenModal={setOpenModal} researchFieldId={researchFieldId} />}
                    </div>
                )}
                {isLoading && (
                    <div className="mt-4 mb-4">
                        <ContentLoader height={130} width={200} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                            <rect x="90" y="12" rx="3" ry="3" width="123" height="7" />
                            <rect x="90" y="30" rx="3" ry="3" width="171" height="6" />
                            <circle cx="44" cy="30" r="30" />
                            <circle cx="44" cy="100" r="30" />
                            <rect x="90" y="82" rx="3" ry="3" width="123" height="7" />
                            <rect x="90" y="100" rx="3" ry="3" width="171" height="6" />
                        </ContentLoader>
                    </div>
                )}
            </div>
        </div>
    );
};

ContributorsBox.propTypes = {
    researchFieldId: PropTypes.string.isRequired
};

export default ContributorsBox;
