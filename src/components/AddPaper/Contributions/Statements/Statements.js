import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import styles from '../Contributions.module.scss';
import StatementItem from './StatementItem';
import AddStatement from './AddStatement';
import { connect } from 'react-redux';
import { nextStep } from '../../../../actions/addPaper';
import Breadcrumbs from './Breadcrumbs';

class Statements extends Component {

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    statements = () => {

        let propertyIds = Object.keys(this.props.addPaper.resources.byId).length !== 0 ? this.props.addPaper.resources.byId[this.props.addPaper.selectedResource].propertyIds : [];

        return <ListGroup className={styles.listGroupEnlarge}>
            {propertyIds.length > 0 ? 
            propertyIds.map((propertyId, index) => {
                let property = this.props.addPaper.properties.byId[propertyId];

                // statement is provided in seperate props, so the props can be validated more easily
                return <StatementItem
                    id={propertyId}
                    predicateLabel={property.label}
                    key={'statement-' + index}
                    index={index}
                    type={this.props.type}
                    isExistingProperty={property.isExistingProperty ? true : false}
                    enableEdit={this.props.enableEdit}
                    isLastItem={propertyIds.length === index + 1}
                />
            }) : <ListGroupItem className={styles.statementItem} style={{cursor: 'default'}}>No values</ListGroupItem>}

            
            {this.props.enableEdit ? <AddStatement /> : ''}
        </ListGroup>;
    }

    addLevel = (level, maxLevel) => {
        return maxLevel !== 0 ? <div className={styles.levelBox}>
            {maxLevel !== level + 1 && this.addLevel(level + 1, maxLevel)}
            {maxLevel === level + 1 && this.statements()}
        </div> : this.statements();
    }

    render() {
        if (this.props.hidden) {
            return <></>;
        }
        
        let elements = this.addLevel(0, this.props.addPaper.level);

        return <>
            {this.props.addPaper.level !== 0 ? <>
                <br />

                <Breadcrumbs />
            </> : ''}

            {elements}
        </>;
    }
}

const mapStateToProps = state => {
    return {
        addPaper: state.addPaper,
    }
};

const mapDispatchToProps = dispatch => ({
    nextStep: () => dispatch(nextStep()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Statements);