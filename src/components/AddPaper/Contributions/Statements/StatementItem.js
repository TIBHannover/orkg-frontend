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

        const isCollapsed = this.props.addPaper.selectedProperty === this.props.id;

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

        let valueIds = Object.keys(this.props.addPaper.properties.byId).length !== 0 ? this.props.addPaper.properties.byId[this.props.id].valueIds : [];
        
        return (
            <>
                <ListGroupItem active={isCollapsed} onClick={() => this.props.togglePropertyCollapse(this.props.id)} className={listGroupClass}>
                    {this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1)}

                    {valueIds.length === 1 && !isCollapsed ?
                        <>: <em className="text-muted">{this.props.addPaper.values.byId[valueIds[0]].label}</em></>
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
                                let value = this.props.addPaper.values.byId[valueId];

                                return <ValueItem
                                    key={index}
                                    storeType={this.props.type}
                                    label={value.label}
                                    id={valueId}
                                    type={value.type}
                                    resourceId={value.resourceId}
                                    propertyId={this.props.id}
                                    isExistingValue={value.isExistingValue}
                                />
                            })}

                            {this.props.enableEdit ? <AddValue handleAddValue={this.props.handleAddValue}
                                predicateId={this.props.predicateId} /> : ''}
                        </ListGroup>
                    </div>
                </Collapse>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        addPaper: state.addPaper,
    }
};

const mapDispatchToProps = dispatch => ({
    togglePropertyCollapse: (id) => dispatch(togglePropertyCollapse(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementItem);