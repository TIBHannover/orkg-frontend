import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../Utils/Tooltip';
import { connect } from 'react-redux';
import { deleteProperty, toggleEditPropertyLabel } from '../../actions/statementBrowser';
import Confirm from 'reactstrap-confirm';
import PropTypes from 'prop-types';

class StatementOptions extends Component {

    toggleDeleteStatement = async () => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this statement and its related values?',
            cancelColor: 'light'
        });

        if (result) {
            this.props.deleteProperty({
                id: this.props.id,
                resourceId: this.props.selectedResource,
            });
        }
    }

    render() {
        return (
            <>
                <span className={'deletePredicate float-right mr-4'} onClick={this.toggleDeleteStatement}>
                    <Tooltip message="Delete statement" hideDefaultIcon={true}>
                        <Icon icon={faTrash} /> Delete
                    </Tooltip>
                </span>
                {!this.props.existingPredicateId && !this.props.isEditing && (
                    <span className={'deletePredicate float-right mr-4'} onClick={(e) => { e.stopPropagation(); this.props.toggleEditPropertyLabel({ id: this.props.id }); }}>
                        <Tooltip message="Edit property label" hideDefaultIcon={true}>
                            <Icon icon={faPen} /> Edit
                        </Tooltip>
                    </span>)}

            </>
        );
    }
}

StatementOptions.propTypes = {
    id: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    deleteProperty: PropTypes.func.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    existingPredicateId: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
};

const mapStateToProps = state => {
    return {
        selectedResource: state.statementBrowser.selectedResource,
    }
};

const mapDispatchToProps = dispatch => ({
    deleteProperty: (id) => dispatch(deleteProperty(id)),
    toggleEditPropertyLabel: (data) => dispatch(toggleEditPropertyLabel(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementOptions);