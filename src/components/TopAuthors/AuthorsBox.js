import { useState } from 'react';
import AuthorCard from 'components/AuthorCard/AuthorCard';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAward } from '@fortawesome/free-solid-svg-icons';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import pluralize from 'pluralize';
import AuthorsModal from './AuthorsModal';
import useResearchProblemAuthors from './hooks/useResearchProblemAuthors';

const AuthorsBox = ({ researchProblemId }) => {
    const { authors, isLoading } = useResearchProblemAuthors({ researchProblemId, pageSize: 4 });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h5>
                <Icon icon={faAward} className="text-primary" /> Top Authors
            </h5>
            <div className="flex-grow-1">
                {!isLoading && authors && authors.length > 0 && (
                    <div className="mt-2">
                        {authors.slice(0, 3).map((author, index) => (
                            <div className="pt-1 ps-2 pe-2" key={`rp${index}`}>
                                <AuthorCard author={author.author} subTitle={pluralize('paper', author.papers, true)} />
                                {authors.slice(0, 3).length - 1 !== index && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && authors?.length === 0 && <div className="mt-4 mb-4">No authors in this research problem yet</div>}
                {!isLoading && authors?.length > 3 && (
                    <div className="text-center mt-3">
                        <Button size="sm" onClick={() => setOpenModal(v => !v)} color="light">
                            View more
                        </Button>
                        {openModal && <AuthorsModal openModal={openModal} setOpenModal={setOpenModal} researchProblemId={researchProblemId} />}
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

AuthorsBox.propTypes = {
    researchProblemId: PropTypes.string.isRequired,
};

export default AuthorsBox;
