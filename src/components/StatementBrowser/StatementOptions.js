import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { deleteProperty, toggleEditPropertyLabel } from '../../actions/statementBrowser';
import { deleteStatementById } from '../../network';
import StatementOptionButton from './StatementOptionButton';
import { toast } from 'react-toastify';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import PropTypes from 'prop-types';

class StatementOptions extends Component {
    handleDeleteStatement = () => {
        const property = this.props.properties.byId[this.props.id];
        if (this.props.syncBackend) {
            // Delete All related statements
            if (property.valueIds.length > 0) {
                for (const valueId of property.valueIds) {
                    const value = this.props.values.byId[valueId];
                    deleteStatementById(value.statementId);
                }
                toast.success(`${property.valueIds.length} ${property.valueIds.length === 1 ? 'Statement' : 'Statements'} deleted successfully`);
            }
        }
        this.props.deleteProperty({
            id: this.props.id,
            resourceId: this.props.selectedResource
        });
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
                <StatementOptionButton
                    className={'deletePredicate mr-4'}
                    requireConfirmation={true}
                    title={'Delete statement'}
                    buttonText={'Delete'}
                    confirmationMessage={'Are you sure to delete?'}
                    icon={faTrash}
                    action={this.handleDeleteStatement}
                />
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
