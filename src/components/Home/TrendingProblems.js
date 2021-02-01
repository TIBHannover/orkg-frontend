import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFire, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getTopResearchProblems } from 'services/backend/problems';
import Tippy from '@tippyjs/react';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

const List = styled.div`
    padding: 0 40px; // have a large horizontal padding to ensure the items are not out of the box on transform
    & > div {
        display: block;

        div {
            transition: transform 0.3s ease-in-out;
        }

        &:hover > div {
            transform: scale(1.2);
        }
        a {
            text-decoration: none;
        }
    }
    .item-0 {
        font-size: 145%;
        min-height: 40px;
        a {
            color: ${props => props.theme.darkblueDarker}!important;
        }
    }
    .item-1,
    .item-2 {
        font-size: 145%;
        min-height: 40px;

        a {
            color: ${props => props.theme.darkblue}!important;
        }
    }
    .item-3,
    .item-4 {
        font-size: 100%;
        min-height: 30px;

        a {
            color: ${props => props.theme.darkblue}!important;
            opacity: 0.8;
        }
    }
`;

const TrendingProblems = props => {
    const [problems, setProblems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getProblems = () => {
            getTopResearchProblems()
                .then(problemsList => {
                    setProblems(problemsList);
                    setIsLoading(false);
                })
                .catch(error => {
                    setIsLoading(false);
                });
        };

        getProblems();
    }, []);

    return (
        <div>
            <div className="box rounded-lg mt-4">
                <h2 className="h5 p-3 mb-0">
                    <Tippy content="A list of research problems addressed by papers recently added to ORKG.">
                        <span>
                            <Icon icon={faFire} className="text-primary mr-2" />
                            Trending research problems
                        </span>
                    </Tippy>
                </h2>

                <hr className="mx-3 mt-0" />

                {isLoading ? (
                    <div className="text-center py-5">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                ) : (
                    <div className="px-4 text-center pb-5">
                        <List>
                            {problems.map((problem, index) => (
                                <div key={`${index}-problem`}>
                                    <div className={`item-${index}`}>
                                        <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problem.id })}>{problem.label}</Link>
                                    </div>
                                    {index !== problems.length - 1 && <hr className="mx-3 mb-1 mt-0" />}
                                </div>
                            ))}
                        </List>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingProblems;
