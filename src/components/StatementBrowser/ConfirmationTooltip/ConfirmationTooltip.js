import { useRef, useEffect, createRef, forwardRef, useImperativeHandle } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ConfirmationTooltipStyled = styled.div`
    color: #fff;
    font-size: 0.95rem;
    word-break: normal;
    .btn {
        padding-top: 2px;
        padding-bottom: 2px;
    }
`;

/**
 * This component is made to be a content for a tippy
 * Make sure to use ref props when you use this component
 */
const ConfirmationTooltip = forwardRef((props, ref) => {
    const buttonsRef = useRef([]);

    if (buttonsRef.current.length !== props.buttons.length) {
        buttonsRef.current = Array(props.buttons.length)
            .fill()
            .map((_, i) => buttonsRef.current[i] || createRef());
    }

    useImperativeHandle(ref, () => ({
        focus: () => {
            buttonsRef.current[0].current.focus();
        },
    }));

    useEffect(() => {
        const onKeyPressed = e => {
            if (e.keyCode === 27) {
                // escape
                props.closeTippy();
            }
            if (e.keyCode === 9) {
                // Tab
                e.preventDefault();
                e.stopPropagation();
                // focus on next button
                for (const [index, button] of buttonsRef.current.entries()) {
                    const nextIndex = (index + 1) % props.buttons.length;
                    if (document.activeElement === button.current) {
                        buttonsRef.current[nextIndex].current.focus();
                        break;
                    }
                }
            }
        };
        document.addEventListener('keydown', onKeyPressed);

        return () => {
            document.removeEventListener('keydown', onKeyPressed);
        };
    }, [props.closeTippy, props.buttons.length, props]);

    return (
        <ConfirmationTooltipStyled className="text-center p-1">
            <div className="mb-2">{props.message}</div>
            <ButtonGroup tabIndex="0" size="sm" className="my-1">
                {props.buttons.map((button, i) => (
                    <Button
                        onClick={() => {
                            button.action?.();
                            props.closeTippy();
                        }}
                        innerRef={buttonsRef.current[i]}
                        className="px-2"
                        key={i}
                        color={button.color}
                    >
                        <Icon icon={button.icon} className="me-1" />
                        {button.title}
                    </Button>
                ))}
            </ButtonGroup>
        </ConfirmationTooltipStyled>
    );
});

ConfirmationTooltip.propTypes = {
    message: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    closeTippy: PropTypes.func.isRequired,
    buttons: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
            icon: PropTypes.object.isRequired,
            action: PropTypes.func,
        }),
    ).isRequired,
};

export default ConfirmationTooltip;
