import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import styles from '../Contributions.module.scss';
import StatementItem from './StatementItem';
import AddStatement from './AddStatement';
import { connect } from 'react-redux';
import Breadcrumbs from './Breadcrumbs';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import Statements from './Statements';

class StatementBrowserDialog extends Component {

    render() {

        return (
            <Modal isOpen={this.props.show} toggle={this.props.toggleModal} size="lg">
                <ModalHeader toggle={this.props.toggleModal}>View existing resource</ModalHeader>
                <ModalBody>
                    <Statements
                        enableEdit={false}
                        resourceId={this.props.resourceId}
                    />
                </ModalBody>
                {/*<ModalFooter>
                    <Button color="primary" onClick={this.props.toggleModal}>Do Something</Button>{' '}
                    <Button color="secondary" onClick={this.props.toggleModal}>Cancel</Button>
                </ModalFooter>*/}
            </Modal>
        );
    }
}

StatementBrowserDialog.propTypes = {
  resourceId: PropTypes.any,
  show: PropTypes.bool,
  toggleModal: PropTypes.func
}

const mapStateToProps = state => {
    return {
        //level: state.addPaper.level,
        //resources: state.addPaper.resources,
        //properties: state.addPaper.properties,
        //isFetchingStatements: state.addPaper.isFetchingStatements,
        //selectedResource: state.addPaper.selectedResource,
    }
};

export default connect(
    mapStateToProps
)(StatementBrowserDialog);