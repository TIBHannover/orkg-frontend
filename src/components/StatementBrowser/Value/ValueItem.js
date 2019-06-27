import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../Utils/Tooltip';
import { StyledValueItem } from '../../AddPaper/Contributions/styled';
import classNames from 'classnames';
import Confirm from 'reactstrap-confirm';
import { connect } from 'react-redux';
import { selectResource, fetchStatementsForResource, deleteValue } from '../../../actions/statementBrowser';
import PropTypes from 'prop-types';
import StatementBrowserDialog from '../StatementBrowserDialog';
import ValuePlugins from '../../ValuePlugins/ValuePlugins';

class ValueItem extends Component {
    state = {
        modal: false,
        dialogResourceId: null,
        dialogResourceLabel: null,
    }
    toggleDeleteContribution = async () => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this value?',
            cancelColor: 'light'
        });

        if (result) {
            this.props.deleteValue({
                id: this.props.id,
                propertyId: this.props.propertyId
            });
        }
    }

    handleResourceClick = (e) => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;

        if (existingResourceId && !resource.isFechted) {
            this.props.fetchStatementsForResource({
                resourceId: this.props.resourceId,
                existingResourceId
            });
        }

        this.props.selectResource({
            increaseLevel: true,
            resourceId: this.props.resourceId,
            label: this.props.label,
        });
    }

    handleExistingResourceClick = () => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;
        this.setState({
            modal: true,
            dialogResourceId: existingResourceId,
            dialogResourceLabel: resource.label,
        });
    }

    toggleModal = () => {
        this.setState(prevState => ({
            modal: !prevState.modal,
        }));
    }

    render() {
        const labelClass = classNames({
            'objectLink': this.props.type === 'object'
        });

        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource ? resource.existingResourceId : false;
        let onClick = null;

        if (this.props.type === 'object' && existingResourceId && this.props.openExistingResourcesInDialog) {
            onClick = this.handleExistingResourceClick;
        } else if (this.props.type === 'object') {
            onClick = this.handleResourceClick;
        }
        return (
            <>
                {!this.props.inline ?
                    <StyledValueItem>
                        <span className={labelClass} onClick={onClick}>
                            <ValuePlugins>{this.props.label}</ValuePlugins>
                            {existingResourceId && this.props.openExistingResourcesInDialog ?
                                <span> <Icon icon={faExternalLinkAlt} /></span>
                                : ''}
                        </span>
                        {!this.props.existingStatement ?
                            <span className={'deleteValue float-right'} onClick={this.toggleDeleteContribution}>
                                <Tooltip message="Delete value" hideDefaultIcon={true}>
                                    <Icon icon={faTrash} /> Delete
                                </Tooltip>
                            </span> : ''}
                    </StyledValueItem>
                    :
                    this.props.type === 'object' ?
                        <Tooltip message="Open resource" hideDefaultIcon>
                            <span onClick={this.handleResourceClick}>{this.props.label}</span> {/* TODO: fix warning for unmounted component (caused by event for expanding box) */}
                        </Tooltip>
                        :
                        this.props.label
                }

                {this.state.modal ?
                    <StatementBrowserDialog
                        show={this.state.modal}
                        toggleModal={this.toggleModal}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                    /> : ''}
            </>
        );
    }
}

ValueItem.propTypes = {
    deleteValue: PropTypes.func.isRequired,
    selectResource: PropTypes.func.isRequired,
    fetchStatementsForResource: PropTypes.func.isRequired,
    resources: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    existingStatement: PropTypes.bool.isRequired,
    resourceId: PropTypes.string,
    inline: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool,
};

ValueItem.defaultProps = {
    inline: false,
    resourceId: null,
}

const mapStateToProps = state => {
    return {
        resources: state.statementBrowser.resources,
    }
};

const mapDispatchToProps = dispatch => ({
    selectResource: (data) => dispatch(selectResource(data)),
    fetchStatementsForResource: (data) => dispatch(fetchStatementsForResource(data)),
    deleteValue: (data) => dispatch(deleteValue(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ValueItem);