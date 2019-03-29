import React, { Component } from 'react';
import { ListGroupItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../../../Utils/Tooltip';
import styles from '../../Contributions.module.scss';
import classNames from 'classnames';
import Confirm from 'reactstrap-confirm';

class ValueItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteModal: false,
        }
    }

    toggleDeleteContribution = async () => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this value?',
            cancelColor: 'light'
        });

        if (result) {
            this.props.handleDeleteValue(this.props.id, this.props.predicateId);
        }
    }

    render() {
        const labelClass = classNames({
            [styles.objectLink]: this.props.type == 'object'
        });

        return (
            <>
                <ListGroupItem className={styles.valueItem}>
                    <span className={labelClass}>{this.props.label}</span>
                    <span className={`${styles.deleteValue} float-right`} onClick={this.toggleDeleteContribution}>
                        <Tooltip message="Delete value" hideDefaultIcon={true}>
                            <Icon icon={faTrash} /> Delete
                        </Tooltip>
                    </span>
                </ListGroupItem>
            </>
        );
    }
}

export default ValueItem;