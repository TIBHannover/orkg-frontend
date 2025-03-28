import pluralize from 'pluralize';
import { FC, useState } from 'react';
import { Button } from 'reactstrap';

import ContributorCard from '@/components/Cards/ContributorCard/ContributorCard';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import ContributorsModal from '@/components/TopContributors/ContributorsModal';
import useContributors from '@/components/TopContributors/hooks/useContributors';

type ContributorsBoxProps = {
    researchFieldId: string;
};

const ContributorsBox: FC<ContributorsBoxProps> = ({ researchFieldId }) => {
    const { contributors, isLoading } = useContributors({ researchFieldId, pageSize: 5, initialSort: 'top', initialIncludeSubFields: true });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h2 className="h5 mb-0">Top contributors</h2>
            <hr className="mt-2" />
            <div className="flex-grow-1">
                {!isLoading && contributors && contributors?.length > 0 && (
                    <div className="mt-2">
                        {contributors?.slice(0, 4).map((contributor, index) => (
                            <div className="pt-1 ps-2 pe-2" key={`rp${contributor.id}`}>
                                <ContributorCard
                                    contributor={{
                                        ...contributor,
                                        subTitle: `${pluralize('contribution', contributor.total, true)}`,
                                    }}
                                />
                                {contributors.slice(0, 4).length - 1 !== index && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && contributors && contributors?.length === 0 && (
                    <div className="mt-4 mb-4">
                        No contributors in this research field yet.
                        <br />
                        <i> Be the first contributor!</i>
                    </div>
                )}
                {!isLoading && contributors && contributors?.length > 4 && (
                    <div className="text-center mt-3">
                        <Button size="sm" onClick={() => setOpenModal((v) => !v)} color="light">
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

export default ContributorsBox;
