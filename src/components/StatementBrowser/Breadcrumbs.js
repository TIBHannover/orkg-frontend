import React, { Component } from 'react';
import { connect } from 'react-redux';
import { goToResourceHistory } from '../../actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faLink } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';
import Tippy from '@tippy.js/react';

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
        cursor: default;
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
        const historyIndex = this.props.resourceHistory.allIds.length - 2;
        const id = this.props.resourceHistory.allIds[historyIndex];

        this.props.goToResourceHistory({
            id,
            historyIndex
        });
    };

    render() {
        console.log(this.props);
        return (
            <Container>
                <BackButton className="btn btn-link border-0 align-baseline" onClick={this.handleBackClick}>
                    <Icon icon={faArrowLeft} /> Back
                </BackButton>
                <BreadcrumbList>
                    {this.props.resourceHistory.allIds.map((history, index) => {
                        const item = this.props.resourceHistory.byId[history];

                        return (
                            <BreadcrumbItem
                                key={index}
                                onClick={() =>
                                    this.props.resourceHistory.allIds.length !== index + 1 ? this.handleOnClick(item.id, index) : undefined
                                }
                            >
                                {item.label}
                                {this.props.resourceHistory.allIds.length === index + 1 && !this.props.openExistingResourcesInDialog && (
                                    <Tippy content="Go to resource page">
                                        <Link
                                            title={'Go to resource page'}
                                            className={'ml-2'}
                                            to={reverse(ROUTES.RESOURCE, { id: this.props.selectedResource })}
                                        >
                                            <Icon icon={faLink} color={'#fff'} />
                                        </Link>
                                    </Tippy>
                                )}
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
    goToResourceHistory: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
    openExistingResourcesInDialog: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    return {
        resourceHistory: state.statementBrowser.resourceHistory,
        level: state.statementBrowser.level,
        selectedResource: state.statementBrowser.selectedResource
    };
};

const mapDispatchToProps = dispatch => ({
    goToResourceHistory: data => dispatch(goToResourceHistory(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs);
