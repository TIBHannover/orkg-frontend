import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { deleteProperty, toggleEditPropertyLabel } from '../../actions/statementBrowser';
import { deleteStatementsByIds } from '../../network';
import Confirm from 'reactstrap-confirm';
import { toast } from 'react-toastify';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import PropTypes from 'prop-types';

class StatementOptions extends Component {
    toggleDeleteStatement = async e => {
        e.stopPropagation();

        let property = this.props.properties.byId[this.props.id];
        let title = '';
        let message = '';
        if (property.valueIds.length === 0) {
            title = (
                <>
                    Delete the <i>{property.label}</i> property?
                </>
            );
            message = 'Are you sure you want to delete this property?';
        } else {
            title = (
                <>
                    Delete the <i>{property.label}</i> property and all related values?
                </>
            );
            message = `Also, ${property.valueIds.length} related ${property.valueIds.length === 1 ? 'value' : 'values'} will be deleted.`;
        }
        let result = await Confirm({
            title: title,
            message: message,
            cancelColor: 'light'
        });

        if (result) {
            if (this.props.syncBackend) {
                // Delete All related statements
                if (property.valueIds.length > 0) {
                    let statementsIds = [];
                    for (let valueId of property.valueIds) {
                        statementsIds.push(this.props.values.byId[valueId].statementId);
                    }
                    deleteStatementsByIds(statementsIds);
                    toast.success(`${property.valueIds.length} ${property.valueIds.length === 1 ? 'Statement' : 'Statements'} deleted successfully`);
                }
            }
            this.props.deleteProperty({
                id: this.props.id,
                resourceId: this.props.selectedResource
            });
        }
    };

    render() {
        return (
            <>
                {!this.props.isEditing && (
                    <span
                        className={'deletePredicate mr-3'}
                        onClick={e => {
                            e.stopPropagation();
                            this.props.toggleEditPropertyLabel({ id: this.props.id });
                        }}
                    >
                        <Tippy content="Edit property">
                            <span>
                                <Icon icon={faPen} /> Edit
                            </span>
                        </Tippy>
                    </span>
                )}
                <span className={'deletePredicate mr-4'} onClick={this.toggleDeleteStatement}>
                    <Tippy content="Delete statement">
                        <span>
                            <Icon icon={faTrash} /> Delete
                        </span>
                    </Tippy>
                </span>
            </>
        );
    }
}

StatementOptions.propTypes = {
    id: PropTypes.string.isRequired,
    selectedResource: PropTypes.string.isRequired,
    deleteProperty: PropTypes.func.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired
};

const mapStateToProps = state => {
    return {
        selectedResource: state.statementBrowser.selectedResource,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values
    };
};

const mapDispatchToProps = dispatch => ({
    deleteProperty: id => dispatch(deleteProperty(id)),
    toggleEditPropertyLabel: data => dispatch(toggleEditPropertyLabel(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StatementOptions);
