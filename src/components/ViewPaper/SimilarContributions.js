import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ROUTES from '../../constants/routes.js';
import { Row, Col } from 'reactstrap';


const CardContainer = styled.div`
    display: flex;
`;

const Card = styled(Link)`
    border:2px;
    width:calc(33% - 5px);
    flex-grow:0;
    margin:10px 10px 0 0;
    border-radius:11px;
    background: ${props => props.theme.darkblue};
    cursor:pointer;
    font-size:95%;
    padding:10px 5px;
    color:${props => props.theme.bodyColor};
    text-decoration:none;
    color:#fff;
    font-size:85%;
    transition: 0.2s opacity;

    &:last-child {
        margin-right:0;
    }
    
    &:hover{
        opacity:0.9;
        color:#fff;
        text-decoration:none;
    }  

    &, &:active, &:focus{
        outline: none;
    }
`;

const Similarity = styled.span`
    width:35px;
    border-right:2px solid;
    border-right-color:inherit;
    display:block;
    float:left;
    text-align:center;
    color:${props => props.theme.darkblueDarker};
    font-weight:700;
   
    margin-right:10px;
    height:100%;
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
                                    <Row className="h-100">
                                        <Col md={2} style={{marginRight:10}} >
                                            <Similarity>
                                                <span>{parseInt(contribution.similarityPercentage) === 1 ? 99 : parseInt(contribution.similarityPercentage*100)}<br />%</span>
                                            </Similarity>
                                        </Col>
                                        <Col>
                                            {contribution.title ? contribution.title : <em>No title</em>}
                                        </Col>
                                    </Row>
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