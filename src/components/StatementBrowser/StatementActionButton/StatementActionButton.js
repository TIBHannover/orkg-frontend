import { useRef } from 'react';
import Tippy from '@tippyjs/react';
import ActionButtonView from './ActionButtonView';
import PropTypes from 'prop-types';
import ConfirmationTooltip from '../ConfirmationTooltip/ConfirmationTooltip';

const StatementActionButton = props => {
    const tippy = useRef(null);
    const confirmButtonRef = useRef(null);

    const onShown = () => {
        confirmButtonRef.current.focus();
    };

    const onShow = () => {
        if (props.onVisibilityChange) {
            props.onVisibilityChange(true);
        }
    };

    const onHide = () => {
        if (props.onVisibilityChange) {
            props.onVisibilityChange(false);
        }
    };

    const closeTippy = () => {
        tippy.current.hide();
    };

    const handleClick = e => {
        e.stopPropagation();
        if (!props.requireConfirmation) {
            props.action();
        }
    };

    const tippyChildren = (
        <ActionButtonView
            title={props.title}
            icon={props.icon}
            iconSpin={props.iconSpin}
            action={handleClick}
            isDisabled={props.isDisabled}
            size={props.iconSize}
            testId={props.testId}
        />
    );

    return props.requireConfirmation && !props.isDisabled ? (
        <Tippy trigger="mouseenter" content={props.title}>
            <Tippy
                onShown={onShown}
                onShow={onShow}
                onHide={onHide}
                onCreate={tippyInst => (tippy.current = tippyInst)}
                interactive={true}
                trigger="click"
                appendTo={props.appendTo}
                content={
                    <ConfirmationTooltip
                        message={props.confirmationMessage}
                        closeTippy={closeTippy}
                        ref={confirmButtonRef}
                        buttons={props.confirmationButtons}
                    />
                }
            >
                {tippyChildren}
            </Tippy>
        </Tippy>
    ) : (
        <>
            <Tippy hideOnClick={false} interactive={props.interactive} trigger="mouseenter" content={props.title}>
                {tippyChildren}
            </Tippy>
        </>
    );
};

StatementActionButton.propTypes = {
    title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    icon: PropTypes.object.isRequired,
    iconSpin: PropTypes.bool.isRequired,
    testId: PropTypes.string,
    iconSize: PropTypes.oneOf(['xs', 'sm', 'lg']),
    action: PropTypes.func,
    isDisabled: PropTypes.bool,
    appendTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    onVisibilityChange: PropTypes.func,
    requireConfirmation: PropTypes.bool,
    confirmationMessage: PropTypes.string,
    interactive: PropTypes.bool,
    confirmationButtons: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            color: PropTypes.string.isRequired,
            icon: PropTypes.object.isRequired,
            action: PropTypes.func
        })
    )
};

StatementActionButton.defaultProps = {
    iconSpin: false,
    requireConfirmation: false,
    interactive: false,
    appendTo: 'parent',
    action: () => {}
};

export default StatementActionButton;
