import React from 'react';
import { FormGroup, Label } from 'reactstrap';
import { connect } from 'react-redux';

function Format(props) {
    return (
        <div className="p-4">
            <FormGroup className="mb-4">
                <Label>Not implemented!</Label>
            </FormGroup>
        </div>
    );
}

Format.propTypes = {};

const mapStateToProps = state => {};

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Format);
