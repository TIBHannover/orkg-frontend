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
import PropTypes from 'prop-types';

class ValueItem extends Component {

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

    render() {
        const labelClass = classNames({
            [styles.objectLink]: this.props.type === 'object'
        });

        return (
            <>
                {!this.props.inline ?
                    <ListGroupItem className={styles.valueItem}>
                        <span className={labelClass} onClick={this.props.type === 'object' ? this.handleResourceClick : null}>{this.props.label}</span>
                        {!this.props.existingStatement ?
                            <span className={`${styles.deleteValue} float-right`} onClick={this.toggleDeleteContribution}>
                                <Tooltip message="Delete value" hideDefaultIcon={true}>
                                    <Icon icon={faTrash} /> Delete
                                </Tooltip>
                            </span> : ''}
                    </ListGroupItem>
                    :
                    <Tooltip message="Open resource" hideDefaultIcon>
                        <span onClick={this.props.type === 'object' ? this.handleResourceClick : null}>{this.props.label}</span> {/* TODO: fix warning for unmounted component (caused by event for dropdown) */}
                    </Tooltip>
                }
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
    resourceId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    existingStatement: PropTypes.bool.isRequired,
    inline: PropTypes.bool,
};

ValueItem.defaultProps = {
    inline: false,
}

const mapStateToProps = state => {
    return {
        resources: state.addPaper.resources,
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