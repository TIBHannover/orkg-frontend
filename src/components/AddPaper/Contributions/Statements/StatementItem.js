import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../Contributions.module.scss';
import classNames from 'classnames';
import ValueItem from './Value/ValueItem';
import AddValue from './Value/AddValue';
import DeleteStatement from './DeleteStatement';
import { connect } from 'react-redux';
import { togglePropertyCollapse } from '../../../../actions/addPaper';
import PropTypes from 'prop-types';

class StatementItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
        }
    }

    toggleDeleteContribution = () => {
        this.setState(prevState => ({
            deleteContributionModal: !prevState.deleteContributionModal
        }));
    }

    render() {
        const isCollapsed = this.props.selectedProperty === this.props.id;

        const listGroupClass = classNames({
            [styles.statementActive]: isCollapsed,
            [styles.statementItem]: true,
            'rounded-bottom': this.props.isLastItem && !isCollapsed && !this.props.enableEdit,
        });

        const chevronClass = classNames({
            [styles.statementItemIcon]: true,
            [styles.open]: isCollapsed,
            'float-right': true,
        });

        const openBoxClass = classNames({
            [styles.listGroupOpen]: true,
            [styles.listGroupOpenBorderBottom]: this.props.isLastItem && !this.props.enableEdit,
            'rounded-bottom': this.props.isLastItem && !this.props.enableEdit,
        });

        let valueIds = Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[this.props.id].valueIds : [];

        return (
            <>
                <ListGroupItem active={isCollapsed} onClick={() => this.props.togglePropertyCollapse(this.props.id)} className={listGroupClass}>
                    {this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1)}

                    {valueIds.length === 1 && !isCollapsed ?
                        <>
                            : {' '}
                            <em className="text-muted">
                                <ValueItem
                                    label={this.props.values.byId[valueIds[0]].label}
                                    id={valueIds[0]}
                                    type={this.props.values.byId[valueIds[0]].type}
                                    resourceId={this.props.values.byId[valueIds[0]].resourceId}
                                    propertyId={this.props.id}
                                    existingStatement={this.props.values.byId[valueIds[0]].existingStatement}
                                    inline
                                />
                            </em>
                        </>
                        : valueIds.length > 1 && !isCollapsed ?
                            <>: <em className="text-muted">{valueIds.length} values</em></>
                            : ''}

                    <Icon icon={isCollapsed ? faChevronCircleDown : faChevronCircleRight} className={chevronClass} />{' '}

                    {!this.props.isExistingProperty ?
                        <DeleteStatement id={this.props.id} /> : ''}
                </ListGroupItem>

                <Collapse isOpen={isCollapsed}>
                    <div className={openBoxClass}>
                        <ListGroup flush>
                            {valueIds.map((valueId, index) => {
                                let value = this.props.values.byId[valueId];

                                return (
                                    <ValueItem
                                        key={index}
                                        label={value.label}
                                        id={valueId}
                                        type={value.type}
                                        resourceId={value.resourceId}
                                        propertyId={this.props.id}
                                        existingStatement={value.existingStatement}
                                    />
                                )
                            })}

                            {this.props.enableEdit ? (
                                <AddValue />
                            ) : ''}
                        </ListGroup>
                    </div>
                </Collapse>
            </>
        );
    }
}

StatementItem.propTypes = {
    id: PropTypes.string.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isExistingProperty: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    togglePropertyCollapse: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
};

const mapStateToProps = state => {
    return {
        selectedProperty: state.addPaper.selectedProperty,
        properties: state.addPaper.properties,
        values: state.addPaper.values,
    }
};

const mapDispatchToProps = dispatch => ({
    togglePropertyCollapse: (id) => dispatch(togglePropertyCollapse(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementItem);