import React, { Component } from 'react';
import { ListGroupItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../../../Utils/Tooltip';
import styles from '../../Contributions.module.scss';
import classNames from 'classnames';
import Confirm from 'reactstrap-confirm';
import { connect } from 'react-redux';
import { selectResource, fetchStatementsForResource, deleteValue } from '../../../../../actions/addPaper';

class ValueItem extends Component {

    toggleDeleteContribution = async () => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this value?',
            cancelColor: 'light'
        });
        console.log(this.props);
        console.log({
            id: this.props.id,
            propertyId: this.props.propertyId
        });

        if (result) {
            this.props.deleteValue({
                id: this.props.id,
                propertyId: this.props.propertyId
            });
        }
    }

    handleResourceClick = () => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;

        if (existingResourceId && !resource.isFechted) {
            // TODO show loading indicator when fetching statements
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

    render() {
        const labelClass = classNames({
            [styles.objectLink]: this.props.type === 'object'
        });

        return (
            <>
                <ListGroupItem className={styles.valueItem}>
                    <span className={labelClass} onClick={this.props.type === 'object' ? this.handleResourceClick : null}>{this.props.label}</span>
                    {!this.props.isExistingValue ?
                        <span className={`${styles.deleteValue} float-right`} onClick={this.toggleDeleteContribution}>
                            <Tooltip message="Delete value" hideDefaultIcon={true}>
                                <Icon icon={faTrash} /> Delete
                            </Tooltip>
                        </span> : ''}
                </ListGroupItem>
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
    selectResource: (data) => dispatch(selectResource(data)),
    fetchStatementsForResource: (data) => dispatch(fetchStatementsForResource(data)),
    deleteValue: (data) => dispatch(deleteValue(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ValueItem);