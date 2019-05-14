import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import styles from '../Contributions.module.scss';
import StatementItem from './StatementItem';
import AddStatement from './AddStatement';
import { connect } from 'react-redux';
import Breadcrumbs from './Breadcrumbs';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

class Statements extends Component {

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    statements = () => {

        let propertyIds = Object.keys(this.props.resources.byId).length !== 0 ? this.props.resources.byId[this.props.selectedResource].propertyIds : [];

        return (
            <ListGroup className={styles.listGroupEnlarge}>
                {!this.props.isFetchingStatements ? (
                    propertyIds.length > 0 ? (
                        propertyIds.map((propertyId, index) => {
                            let property = this.props.properties.byId[propertyId];

                            return (
                                <StatementItem
                                    id={propertyId}
                                    predicateLabel={property.label}
                                    key={'statement-' + index}
                                    index={index}
                                    type={this.props.type}
                                    isExistingProperty={property.isExistingProperty ? true : false}
                                    enableEdit={this.props.enableEdit}
                                    isLastItem={propertyIds.length === index + 1}
                                />
                            )
                        }))
                        : <ListGroupItem className={styles.statementItem} style={{ cursor: 'default' }}>No values</ListGroupItem>
                ) : (
                        <ListGroupItem className={styles.statementItem} style={{ cursor: 'default' }}>
                            <Icon icon={faSpinner} spin /> Loading
                        </ListGroupItem>
                    )}

                {this.props.enableEdit ? <AddStatement /> : ''}
            </ListGroup>
        );
    }

    addLevel = (level, maxLevel) => {
        return maxLevel !== 0 ? (
            <div className={styles.levelBox}>
                {maxLevel !== level + 1 && this.addLevel(level + 1, maxLevel)}
                {maxLevel === level + 1 && this.statements()}
            </div>
        ) : this.statements();
    }

    render() {
        let elements = this.addLevel(0, this.props.level);

        return (
            <>
                {this.props.level !== 0 ? (
                    <>
                        <Breadcrumbs />
                    </>
                ) : ''}

                {elements}
            </>
        );
    }
}

Statements.propTypes = {
    level: PropTypes.number.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    isFetchingStatements: PropTypes.bool.isRequired,
    selectedResource: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    resourceId: PropTypes.string.isRequired,
    type: PropTypes.string,
};

const mapStateToProps = state => {
    return {
        level: state.addPaper.level,
        resources: state.addPaper.resources,
        properties: state.addPaper.properties,
        isFetchingStatements: state.addPaper.isFetchingStatements,
        selectedResource: state.addPaper.selectedResource,
    }
};

export default connect(
    mapStateToProps
)(Statements);