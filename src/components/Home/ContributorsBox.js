import useTopContributors from 'components/Home/hooks/useTopContributors';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const ContributorsBox = ({ id }) => {
    const { contributors } = useTopContributors();
    return (
        <div className="box rounded-lg p-3 flex-grow-1 d-flex flex-column">
            <h5>
                <Icon icon={faAward} className="text-primary" /> Top Contributors
            </h5>
            <div className="flex-grow-1">
                {contributors && contributors.length > 0 && (
                    <div>
                        {contributors.slice(0, 5).map((contributor, index) => (
                            <div className="pt-1 pl-2 pr-2" key={`rp${index}`}>
                                <ContributorCard
                                    contributor={{
                                        ...{
                                            id: contributor.profile.id,
                                            display_name: contributor.profile.displayName,
                                            gravatar_id: contributor.profile.gravatarId
                                        },
                                        subTitle: `${contributor.contributionsCount} contributions`
                                    }}
                                />
                                {index <= 4 && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                        {contributors.slice(0, 2).map((contributor, index) => (
                            <div className="pt-1 pl-2 pr-2" key={`rpc${index}`}>
                                <ContributorCard
                                    contributor={{
                                        ...{
                                            id: contributor.profile.id,
                                            display_name: contributor.profile.displayName,
                                            gravatar_id: contributor.profile.gravatarId
                                        },
                                        subTitle: `${contributor.contributionsCount} contributions`
                                    }}
                                />
                                {index < 1 && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                    </div>
                )}
                {contributors && contributors.length === 0 && <>No contributors.</>}
            </div>
        </div>
    );
};

ContributorsBox.propTypes = {
    id: PropTypes.string.isRequired
};

export default ContributorsBox;
