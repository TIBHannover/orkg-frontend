import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFire, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { problemsUrl, submitGetRequest } from 'network';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';

const List = styled.ul`
    list-style: none;
    padding: 0 40px; // have a large horizontal padding to ensure the items are not out of the box on transform
    li {
        transition: transform 0.3s ease-in-out;
        display: block;

        &:hover {
            transform: scale(1.2);
        }
        a {
            text-decoration: none;
        }
    }
    li.item-0 {
        font-size: 170%;
        min-height: 45px;
        a {
            color: ${props => props.theme.darkblueDarker}!important;
        }
    }
    li.item-1,
    li.item-2 {
        font-size: 145%;
        min-height: 40px;

        a {
            color: ${props => props.theme.darkblue}!important;
        }
    }
    li.item-3,
    li.item-4 {
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
            submitGetRequest(`${problemsUrl}top`)
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
                    <Icon icon={faFire} className="text-primary mr-2" />
                    Trending research problems
                </h2>

                <hr className="mx-3 mt-0" />

                {isLoading ? (
                    <div className="text-center py-5">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                ) : (
                    <div className="px-4 text-center pb-1">
                        <List>
                            {problems.map((problem, index) => (
                                <li className={`item-${index}`} key={`${index}-problem`}>
                                    <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: problem.id })}>{problem.label}</Link>
                                </li>
                            ))}
                        </List>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingProblems;
