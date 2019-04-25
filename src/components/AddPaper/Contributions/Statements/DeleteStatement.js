import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../../Utils/Tooltip';
import styles from '../Contributions.module.scss';
import { connect } from 'react-redux';
import { deleteProperty } from '../../../../actions/addPaper';
import Confirm from 'reactstrap-confirm';

class DeleteStatement extends Component {
  
    toggleDeleteStatement = async () => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this statement and its related values?',
            cancelColor: 'light'
        });

        if (result) {
            console.log(this.props.id);
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

const mapStateToProps = state => {
    return {
        ...state.addPaper,
    }
};

const mapDispatchToProps = dispatch => ({
    deleteProperty: (id) => dispatch(deleteProperty(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(DeleteStatement);