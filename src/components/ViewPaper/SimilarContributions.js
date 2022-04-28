import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ROUTES from 'constants/routes';
import { Row, Col, Alert } from 'reactstrap';

const CardsContainer = styled(Row)`
    display: flex;
`;

const CardWrapper = styled(Col)`
    display: flex;
`;

const Card = styled(Link)`
    border: 2px;
    margin: 0 0;
    flex: 1;
    border-radius: 11px;
    background: ${props => props.theme.secondary};
    cursor: pointer;
    font-size: 95%;
    padding: 10px 5px;
    color: ${props => props.theme.bodyColor};
    text-decoration: none;
    color: #fff;
    font-size: 85%;
    transition: 0.2s opacity;

    &:last-child {
        margin-right: 0;
    }

    &:hover {
        opacity: 0.9;
        color: #fff;
        text-decoration: none;
    }

    &,
    &:active,
    &:focus {
        outline: none;
    }

    & .simContributionLabel {
        color: ${props => props.theme.secondaryDarker};
        font-size: 84%;
    }
`;

const Similarity = styled.span`
    width: 35px;
    border-right: 2px solid;
    border-right-color: inherit;
    display: block;
    float: left;
    text-align: center;
    color: ${props => props.theme.secondaryDarker};
    font-weight: 700;

    margin-right: 10px;
    height: 100%;
`;

const SimilarContributions = ({ similarContributions = [] }) => {
    return (
        <>
            {similarContributions.length > 0 && (
                <CardsContainer>
                    {similarContributions.map((contribution, index) => {
                        const percentage = parseInt(contribution.similarityPercentage) === 1 ? 99 : parseInt(contribution.similarityPercentage * 100);
                        return (
                            <CardWrapper key={`sim${index}`} lg={4} className="mt-2 justify-content-center">
                                <Card
                                    key={`s${contribution.contributionId}`}
                                    to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
                                        resourceId: contribution.paperId,
                                        contributionId: contribution.contributionId
                                    })}
                                    className="justify-content-center"
                                    role="button"
                                >
                                    <Row className="h-100">
                                        <Col className="d-none d-lg-block" lg={2} style={{ marginRight: 10 }}>
                                            <Similarity>
                                                <span>
                                                    {percentage}
                                                    <br />%
                                                </span>
                                            </Similarity>
                                        </Col>
                                        <Col>
                                            {contribution.title ? (
                                                <>
                                                    {contribution.title} <span className="text-dark d-flex d-lg-none">{percentage}%</span>
                                                </>
                                            ) : (
                                                <em>No title</em>
                                            )}
                                            {contribution.contributionLabel && (
                                                <div className="simContributionLabel">{contribution.contributionLabel}</div>
                                            )}
                                        </Col>
                                    </Row>
                                </Card>
                            </CardWrapper>
                        );
                    })}
                </CardsContainer>
            )}
            {similarContributions.length === 0 && <Alert color="light">We couldn't find any similar contribution, please try again later</Alert>}
        </>
    );
};

SimilarContributions.propTypes = {
    similarContributions: PropTypes.array.isRequired
};

export default SimilarContributions;
