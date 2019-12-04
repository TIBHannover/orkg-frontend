import React, { Component } from 'react';
import { connect } from 'react-redux';
import { goToResourceHistory } from '../../actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

const BreadcrumbList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 10px;
    display: flex;
    width: 80%;
    float: left;

    /*&:hover li:last-of-type:not(:hover) {
        max-width:100px;
        text-overflow: ellipsis;
    }*/
`;

const BreadcrumbItem = styled.li`
    border-radius: 11px;
    background: #f7f7f7;
    padding: 4px 10px;
    float: left;
    border: 2px solid #e86161;
    font-size: 87%;
    white-space: nowrap;
    overflow: hidden;
    max-width: 55px;
    cursor: pointer;
    transition: max-width 0.5s;

    &:hover {
        max-width: 100%;

        color: #000;
    }

    &:hover:not(:last-of-type) {
        padding-right: 15px;
    }

    :last-of-type {
        background: #e86161;
        color: #fff;
        max-width: 100%;
    }

    &:not(:first-child) {
        margin-left: -15px;
    }
`;

const BackButton = styled.div`
    width: 10%;
    float: left;
    padding: 4px 0 0 0 !important;
    font-size: 95% !important;
    text-align: left !important;
`;

const Container = styled.div`
    margin: 0 0 10px 0;
    height: 35px;
`;

class Breadcrumbs extends Component {
    handleOnClick = (id, historyIndex) => {
        this.props.goToResourceHistory({
            id,
            historyIndex
        });
    };

    handleBackClick = () => {
        let historyIndex = this.props.resourceHistory.allIds.length - 2;
        let id = this.props.resourceHistory.allIds[historyIndex];

        this.props.goToResourceHistory({
            id,
            historyIndex
        });
    };

    render() {
        return (
            <Container>
                <BackButton className="btn btn-link border-0 align-baseline" onClick={this.handleBackClick}>
                    <Icon icon={faArrowLeft} /> Back
                </BackButton>
                <BreadcrumbList>
                    {this.props.resourceHistory.allIds.map((history, index) => {
                        let item = this.props.resourceHistory.byId[history];

                        return (
                            <BreadcrumbItem key={index} onClick={() => this.handleOnClick(item.id, index)}>
                                {item.label}
                            </BreadcrumbItem>
                        );
                    })}
                    <div className="clearfix" />
                </BreadcrumbList>
                <div className="clearfix" />
            </Container>
        );
    }
}

Breadcrumbs.propTypes = {
    resourceHistory: PropTypes.object.isRequired,
    goToResourceHistory: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {
        resourceHistory: state.statementBrowser.resourceHistory,
        level: state.statementBrowser.level
    };
};

const mapDispatchToProps = dispatch => ({
    goToResourceHistory: data => dispatch(goToResourceHistory(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs);
