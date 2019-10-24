import React, { Component } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';

class AddStatementButton extends Component {

    render() {
        return (
            <div className="addToolbar toolbar addToolbar-container toolbar-container">
                <span className="toolbar-button toolbar-button-add">
                    <Button onClick={this.props.onClick}>
                        <span className="fa fa-plus" />add statement
                    </Button>
                </span>
            </div>
        )
    }

}

AddStatementButton.propTypes = {
    onClick: PropTypes.func.isRequired,
};

export default AddStatementButton;
