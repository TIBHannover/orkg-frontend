import React, { Component } from 'react';
import { ListGroup } from 'reactstrap';
import { StyledLevelBox, StyledStatementItem } from '../AddPaper/Contributions/styled';
import StatementItem from './StatementItem';
import AddProperty from './AddProperty';
import { connect } from 'react-redux';
import Breadcrumbs from './Breadcrumbs';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { initializeWithoutContribution } from '../../actions/statementBrowser';

class Statements extends Component {
    constructor(props) {
        super(props);

        if (this.props.initialResourceId) {
            this.props.initializeWithoutContribution({
                resourceId: this.props.initialResourceId,
                label: this.props.initialResourceLabel
            });
        }
    }

    handleInputChange = e => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    statements = () => {
        let propertyIds =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.selectedResource
                ? this.props.resources.byId[this.props.selectedResource].propertyIds
                : [];
        let shared =
            Object.keys(this.props.resources.byId).length !== 0 && this.props.selectedResource
                ? this.props.resources.byId[this.props.selectedResource].shared
                : 1;

        return (
            <ListGroup className={'listGroupEnlarge'}>
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
                                    isExistingProperty={property.isExistingProperty ? true : false}
                                    enableEdit={shared <= 1 ? this.props.enableEdit : false}
                                    syncBackend={this.props.syncBackend}
                                    isLastItem={propertyIds.length === index + 1}
                                    openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                    isEditing={property.isEditing}
                                    isSaving={property.isSaving}
                                />
                            );
                        })
                    ) : (
                        <StyledStatementItem>No values</StyledStatementItem>
                    )
                ) : (
                    <StyledStatementItem>
                        <Icon icon={faSpinner} spin /> Loading
                    </StyledStatementItem>
                )}

                {(shared <= 1) & this.props.enableEdit ? <AddProperty syncBackend={this.props.syncBackend} /> : ''}
            </ListGroup>
        );
    };

    addLevel = (level, maxLevel) => {
        return maxLevel !== 0 ? (
            <StyledLevelBox>
                {maxLevel !== level + 1 && this.addLevel(level + 1, maxLevel)}
                {maxLevel === level + 1 && this.statements()}
            </StyledLevelBox>
        ) : (
            this.statements()
        );
    };

    render() {
        let elements = this.addLevel(0, this.props.level);

        return (
            <>
                {this.props.level !== 0 ? (
                    <>
                        <Breadcrumbs openExistingResourcesInDialog={this.props.openExistingResourcesInDialog} />
                    </>
                ) : (
                    ''
                )}

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
    syncBackend: PropTypes.bool.isRequired,
    initializeWithoutContribution: PropTypes.func.isRequired,
    initialResourceId: PropTypes.string,
    initialResourceLabel: PropTypes.string,
    openExistingResourcesInDialog: PropTypes.bool
};

Statements.defaultProps = {
    openExistingResourcesInDialog: false,
    initialResourceId: null,
    initialResourceLabel: null,
    syncBackend: false
};

const mapStateToProps = state => {
    return {
        level: state.statementBrowser.level,
        resources: state.statementBrowser.resources,
        properties: state.statementBrowser.properties,
        isFetchingStatements: state.statementBrowser.isFetchingStatements,
        selectedResource: state.statementBrowser.selectedResource
    };
};

const mapDispatchToProps = dispatch => ({
    initializeWithoutContribution: data => dispatch(initializeWithoutContribution(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Statements);
