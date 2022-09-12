import { Label, FormFeedback, Alert } from 'reactstrap';
import Textarea from 'react-textarea-autosize';
import { updateAbstract } from 'slices/addPaperSlice';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from 'components/Utils/Tooltip';

function AbstractInputView(props) {
    const abstract = useSelector(state => state.addPaper.abstract);
    const dispatch = useDispatch();

    const stripLineBreaks = event => {
        event.preventDefault();
        let text = '';
        if (event.clipboardData || event.originalEvent.clipboardData) {
            text = (event.originalEvent || event).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        // strip line breaks
        text = text.replace(/\r?\n|\r/g, ' ');
        dispatch(updateAbstract(abstract + text));
    };

    return (
        <div>
            {!props.isAbstractLoading && props.isAbstractFailedLoading && (
                <Alert color="light">We couldn't fetch the abstract of the paper, please enter it manually.</Alert>
            )}
            <Alert color="info">
                The provided abstract is not stored and is only used for processing. So you do not have to worry about potential copyright issues
            </Alert>
            <Label for="paperAbstract">
                <Tooltip message="Enter the paper abstract to get automatically generated concepts for you paper.">Enter the paper abstract</Tooltip>
            </Label>
            <Textarea
                id="paperAbstract"
                className={`form-control ps-2 pe-2 ${!props.validation ? 'is-invalid' : ''}`}
                minRows={8}
                value={abstract}
                onChange={event => dispatch(updateAbstract(event.target.value))}
                onPaste={stripLineBreaks}
            />
            {!props.validation && <FormFeedback className="order-1">Please enter the abstract.</FormFeedback>}
        </div>
    );
}

export default AbstractInputView;

AbstractInputView.propTypes = {
    validation: PropTypes.bool.isRequired,
    isAbstractLoading: PropTypes.bool.isRequired,
    isAbstractFailedLoading: PropTypes.bool.isRequired,
};
