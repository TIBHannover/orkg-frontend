import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectContribution } from '../../actions/viewPaper';

import styled from 'styled-components';

const CardContainer = styled.div`
    display: flex;
`;

const Card = styled.div`
    border:2px;
    width:calc(33% - 5px);
    flex-grow:0;
    border:2px solid #DBDDE5;
    margin:10px 10px 0 0;
    border-radius:11px;
    background: #E9EBF2;
    cursor:pointer;
    font-size:95%;
    padding:5px;

    &:last-child {
        margin-right:0;
    }
`;

const Similarity = styled.span`
    width:35px;
    border-right:2px solid;
    border-right-color:inherit;
    height:100%;
    display:block;
    float:left;
    text-align:center;
    color:#E86161;
    font-weight:700;
    margin-right:10px;
`;


class SimilarContributions extends Component {
    render() {

        return <CardContainer>
            <Card className="justify-content-center" role="button">
                <Similarity>80<br />%</Similarity>
                Wiles’s proof of Fermat’s last theorem
            </Card>
            <Card className="justify-content-center" role="button">
                <Similarity>54<br />%</Similarity>
                Gruber’s design of ontologies
            </Card>
            <Card className="justify-content-center" role="button">
                <Similarity>14<br />%</Similarity>
                Design criteria for ontologies
            </Card>

        </CardContainer>;
    }
}

const mapStateToProps = state => ({
    viewPaper: state.viewPaper,
    addPaper: state.addPaper,
});

const mapDispatchToProps = dispatch => ({
    selectContribution: (data) => dispatch(selectContribution(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SimilarContributions);