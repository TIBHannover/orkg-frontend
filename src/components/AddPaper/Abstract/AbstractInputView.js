import { Component } from 'react';
import { Label, FormFeedback, Alert } from 'reactstrap';
import Textarea from 'react-textarea-autosize';
import { updateAbstract } from '../../../actions/addPaper';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Tooltip from '../../Utils/Tooltip';

class AbstractInputView extends Component {
    handleChange = event => {
        this.props.updateAbstract(event.target.value);
    };

    stripLineBreaks = event => {
        event.preventDefault();
        let text = '';
        if (event.clipboardData || event.originalEvent.clipboardData) {
            text = (event.originalEvent || event).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        // strip line breaks
        text = text.replace(/\r?\n|\r/g, ' ');
        this.props.updateAbstract(this.props.abstract + text);
    };

    render() {
        return (
            <div>
                {!this.props.isAbstractLoading && this.props.isAbstractFailedLoading && (
                    <Alert color="light">We couldn't fetch the abstract of the paper, please enter it manually or skip this step.</Alert>
                )}
                <Alert color="info">
                    The abstract annotator automatically extracts concepts from paper abstracts. This is an <em>experimental feature</em>, which can
                    produce incorrect results.
                </Alert>
                <Label for="paperAbstract">
                    <Tooltip message="Enter the paper abstract to get automatically generated concepts for you paper.">
                        Enter the paper abstract
                    </Tooltip>
                </Label>
                <Textarea
                    id="paperAbstract"
                    className={`form-control pl-2 pr-2 ${!this.props.validation ? 'is-invalid' : ''}`}
                    minRows={8}
                    value={this.props.abstract}
                    onChange={this.handleChange}
                    onPaste={this.stripLineBreaks}
                />
                {!this.props.validation && <FormFeedback className="order-1">Please enter the abstract or skip this step.</FormFeedback>}
            </div>
        );
    }
}

AbstractInputView.propTypes = {
    abstract: PropTypes.string.isRequired,
    updateAbstract: PropTypes.func.isRequired,
    validation: PropTypes.bool.isRequired,
    isAbstractLoading: PropTypes.bool.isRequired,
    isAbstractFailedLoading: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    abstract: state.addPaper.abstract
});

const mapDispatchToProps = dispatch => ({
    updateAbstract: data => dispatch(updateAbstract(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AbstractInputView);
