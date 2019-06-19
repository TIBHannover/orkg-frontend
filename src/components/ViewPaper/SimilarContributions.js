import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ROUTES from '../../constants/routes.js';

const CardContainer = styled.div`
    display: flex;
`;

const Card = styled(Link)`
    border:2px;
    width:calc(33% - 5px);
    flex-grow:0;
    border:2px solid #DFDFDF;
    margin:10px 10px 0 0;
    border-radius:11px;
    background: #F7F7F7;
    cursor:pointer;
    font-size:95%;
    padding:10px 5px;
    color:${props => props.theme.bodyColor};
    text-decoration:none;

    &:last-child {
        margin-right:0;
    }
    
    &:hover{
        color:${props => props.theme.orkgPrimaryColor};
        text-decoration:none;
    }    
`;

const Similarity = styled.span`
    width:35px;
    border-right:2px solid;
    border-right-color:inherit;
    display:block;
    float:left;
    text-align:center;
    color:#E86161;
    font-weight:700;
    margin-right:10px;
`;


class SimilarContributions extends Component {

    render() {

        return (
            <>
                {this.props.similaireContributions.length > 0 && (
                    <CardContainer>
                        {this.props.similaireContributions.map((contribution, index) => {
                            return (
                                <Card
                                    key={`s${contribution.contributionId}`}
                                    to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: contribution.paperId, contributionId: contribution.contributionId })}
                                    className="justify-content-center"
                                    role="button"
                                >
                                    <Similarity>{contribution.similarityPercentage}<br />%</Similarity>
                                    {contribution.title}
                                </Card>
                            )
                        })}
                    </CardContainer>
                )}
            </>
        );
    }
}

SimilarContributions.propTypes = {
    similaireContributions: PropTypes.array.isRequired,
};

export default (SimilarContributions);