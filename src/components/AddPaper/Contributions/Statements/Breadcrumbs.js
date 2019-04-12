import React, { Component } from 'react';
import { connect } from 'react-redux';
import { goToResourceHistory } from '../../../../actions/addPaper';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';

const BreadcrumbList = styled.ul`
    list-style: none;
    padding:0;
    margin:0 0 10px;
`;

const BreadcrumbItem = styled.li`
    border-radius:11px;
    background:#E86161;
    padding:4px 10px;
    float:left;
    color:#fff;
    font-size:90%;
    width:40px;
    white-space:nowrap;
    overflow:hidden;
`;

class Breadcrumbs extends Component {
    handleOnClick = (id, historyIndex) => {
        this.props.goToResourceHistory({
            id,
            historyIndex,
        });
    }

    handleBackClick = () => {
        let historyIndex = this.props.resourceHistory.allIds.length - 2;
        let id = this.props.resourceHistory.allIds[historyIndex];
        
        this.props.goToResourceHistory({
            id,
            historyIndex,
        });
    }

    render() {
        return <>
            <div className="btn btn-link p-0 border-0 align-baseline mb-3 mr-4" onClick={this.handleBackClick}>
                <Icon icon={faArrowLeft} /> Back
            </div>
            <BreadcrumbList>
                {this.props.resourceHistory.allIds.map((history, index) => {
                    let item = this.props.resourceHistory.byId[history];
                    
                    return <BreadcrumbItem key={index} onClick={() => this.handleOnClick(item.id, index)}>{item.label}</BreadcrumbItem>;
                })}
                <div className="clearfix"></div>
            </BreadcrumbList>
        </>
    }
}

const mapStateToProps = state => {
    return {
        resourceHistory: state.addPaper.resourceHistory,
    }
};

const mapDispatchToProps = dispatch => ({
    goToResourceHistory: (data) => dispatch(goToResourceHistory(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs);