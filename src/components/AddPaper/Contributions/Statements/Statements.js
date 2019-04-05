import React, { Component } from 'react';
import { ListGroup } from 'reactstrap';
import styles from '../Contributions.module.scss';
import StatementItem from './StatementItem';
import AddStatement from './AddStatement';
import { connect } from 'react-redux';
import { nextStep } from '../../../../actions/addPaper';
import Breadcrumbs from './Breadcrumbs';

class Statements extends Component {
    constructor(props) {
        super(props);
    }

    handleInputChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    statements = () => {
        let propertyIds = Object.keys(this.props.resources.byId).length !== 0 ? this.props.resources.byId[this.props.selectedResource].propertyIds : [];

        return <ListGroup className={styles.listGroupEnlarge}>
            {propertyIds.map((propertyId, index) => {
                let property = this.props.properties.byId[propertyId];

                // statement is provided in seperate props, so the props can be validated more easily
                return <StatementItem
                    id={propertyId}
                    predicateLabel={property.label}
                    key={'statement-' + index}
                    index={index}
                    isExistingProperty={property.isExistingProperty ? true : false}
                />
            })}

            <AddStatement />
        </ListGroup>;
    }

    addLevel = (level, maxLevel) => {
        return maxLevel != 0 ? <div className={styles.levelBox}>
            {maxLevel != level + 1 && this.addLevel(level + 1, maxLevel)}
            {maxLevel == level + 1 && this.statements()}
        </div> : this.statements();
    }

    render() {
        if (this.props.hidden) {
            return <></>;
        }

        let elements = this.addLevel(0, this.props.level);

        return <>
            {this.props.level != 0 ? <>
                <br />

                <Breadcrumbs />
            </> : ''}

            {elements}
        </>;
    }
}

const mapStateToProps = state => {
    return {
        ...state.addPaper,
        researchProblems: state.addPaper.contributions.byId[state.addPaper.selectedContribution] ? state.addPaper.contributions.byId[state.addPaper.selectedContribution].researchProblems : [],
    }
};

const mapDispatchToProps = dispatch => ({
    nextStep: () => dispatch(nextStep()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Statements);