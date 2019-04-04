import React, { Component } from 'react';
import { crossrefUrl, submitGetRequest } from '../../../../network';
import { ListGroup, ListGroupItem, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronCircleDown, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import Tooltip from '../../../Utils/Tooltip';
import styles from '../Contributions.module.scss';
import classNames from 'classnames';
import ValueItem from './Value/ValueItem';
import AddValue from './Value/AddValue';
import DeleteStatement from './DeleteStatement';
import { throws } from 'assert';
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
        const isCollapsed = this.props.selectedProperty === this.props.id;

        const listGroupClass = classNames({
            [styles.statementActive]: isCollapsed,
            [styles.statementItem]: true
        });

        const chevronClass = classNames({
            [styles.statementItemIcon]: true,
            [styles.open]: isCollapsed,
            'float-right': true
        });

        let valueIds = Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[this.props.id].valueIds : [];

        return (
            <>
                <ListGroupItem active={isCollapsed} onClick={() => this.props.togglePropertyCollapse(this.props.id)} className={listGroupClass}>
                    {this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1)}

                    {this.props.values && this.props.values.length == 1 && !this.props.collapse ?
                        <>: <em className="text-muted">{this.props.values[0].label}</em></>
                        : ''}

                    <Icon icon={isCollapsed ? faChevronCircleDown : faChevronCircleRight} className={chevronClass} />{' '}

                    <DeleteStatement id={this.props.id} />
                </ListGroupItem>

                <Collapse isOpen={isCollapsed}>
                    <div className={styles.listGroupOpen}>
                        <ListGroup flush>
                            {valueIds.map((valueId, index) => {
                                let value = this.props.values.byId[valueId];
                                
                                return <ValueItem
                                    key={index}
                                    label={value.label}
                                    id={value.id}
                                    type={value.type}
                                    resourceId={value.resourceId}
                                    //predicateId={this.props.predicateId}
                                    //handleDeleteValue={this.props.handleDeleteValue} 
                                    />
                            })}

                            <AddValue handleAddValue={this.props.handleAddValue}
                                predicateId={this.props.predicateId} />
                        </ListGroup>
                    </div>
                </Collapse>
            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        ...state.addPaper,
    }
};

const mapDispatchToProps = dispatch => ({
    togglePropertyCollapse: (id) => dispatch(togglePropertyCollapse(id)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementItem);