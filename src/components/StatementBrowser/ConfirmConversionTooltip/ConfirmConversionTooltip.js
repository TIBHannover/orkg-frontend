import { useEffect, useRef } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup } from 'reactstrap';
import PropTypes from 'prop-types';
import a from 'indefinite';

const ConfirmConversionTooltip = props => {
    const yesButtonRef = useRef(null);

    useEffect(() => {
        yesButtonRef.current.focus();
    }, []);

    return (
        <div className="text-center p-1" style={{ width: '200px', color: '#fff', fontSize: '0.95rem', wordBreak: 'normal' }}>
            <p className="mb-2">
                The value you entered looks like {a(props.suggestionType?.name || '', { articleOnly: true })} <b>{props.suggestionType?.name}</b>. Do
                you want to convert it?
            </p>
            <ButtonGroup size="sm" className="mt-1 mb-1  d-flex">
                <Button
                    onClick={() => {
                        props.acceptSuggestion();
                    }}
                    innerRef={yesButtonRef}
                    className="px-2"
                    color="success"
                    style={{ paddingTop: 2, paddingBottom: 2 }}
                >
                    <Icon icon={faCheck} className="mr-1" />
                    Convert
                </Button>
                <Button onClick={() => props.rejectSuggestion()} className="px-2" style={{ paddingTop: 2, paddingBottom: 2 }}>
                    <Icon icon={faTimes} className="mr-1" /> Keep
                </Button>
            </ButtonGroup>
        </div>
    );
};

ConfirmConversionTooltip.propTypes = {
    acceptSuggestion: PropTypes.func.isRequired,
    rejectSuggestion: PropTypes.func.isRequired,
    suggestionType: PropTypes.object.isRequired
};

ConfirmConversionTooltip.defaultProps = {};

export default ConfirmConversionTooltip;
