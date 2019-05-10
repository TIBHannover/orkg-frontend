import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../Utils/Tooltip';
import styles from '../AddPaper/Contributions/Contributions.module.scss';
import { connect } from 'react-redux';
import { deleteProperty } from '../../actions/statementBrowser';
import Confirm from 'reactstrap-confirm';
import PropTypes from 'prop-types';

class DeleteStatement extends Component {
  
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
                <span className={`${styles.deletePredicate} float-right mr-4`} onClick={this.toggleDeleteStatement}>
                    <Tooltip message="Delete statement" hideDefaultIcon={true}>
                        <Icon icon={faTrash} /> Delete
                    </Tooltip>
                </span>
            </>
        );
    }
}

DeleteStatement.propTypes = {
    id: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    deleteProperty: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        selectedResource: state.statementBrowser.selectedResource,
    }
};

const mapDispatchToProps = dispatch => ({
    deleteProperty: (id) => dispatch(deleteProperty(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeleteStatement);