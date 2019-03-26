import React, { Component } from 'react';
import { ListGroupItem } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../../../Utils/Tooltip';
import styles from '../../Contributions.module.scss';

class ValueItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteModal: false,
        }
    }

    toggleDeleteContribution = () => {
        this.setState(prevState => ({
            deleteModal: !prevState.deleteModal
        }));
    }

    render() {
        return (
            <>
                <ListGroupItem className={styles.valueItem}>
                    <span className={styles.objectLink}>{this.props.label}</span>
                    <span className={`${styles.deleteValue} float-right`} onClick={this.toggleDeleteContribution}>
                        <Tooltip message="Delete contribution" hideDefaultIcon={true}>
                            <Icon icon={faTrash} /> Delete
                        </Tooltip>
                    </span>
                </ListGroupItem>
            </>
        );
    }
}

export default ValueItem;