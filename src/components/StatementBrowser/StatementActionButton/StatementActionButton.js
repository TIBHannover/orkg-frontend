import { useRef } from 'react';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import ActionButtonView from 'components/StatementBrowser/StatementActionButton/ActionButtonView';
import ConfirmationTooltip from 'components/StatementBrowser/ConfirmationTooltip/ConfirmationTooltip';

const StatementActionButton = ({
    iconSpin = false,
    requireConfirmation = false,
    interactive = false,
    appendTo = 'parent',
    action = () => {},
    onVisibilityChange,
    title,
    testId,
    icon,
    isDisabled,
    confirmationButtons,
    confirmationMessage,
    iconSize,
}) => {
    const tippy = useRef(null);
    const confirmButtonRef = useRef(null);

    const onShown = () => {
        confirmButtonRef.current.focus();
    };

    const onShow = () => {
        if (onVisibilityChange) {
            onVisibilityChange(true);
        }
    };

    const onHide = () => {
        if (onVisibilityChange) {
            onVisibilityChange(false);
        }
    };

    const closeTippy = () => {
        tippy.current.hide();
    };

    const handleClick = e => {
        e.stopPropagation();
        if (!requireConfirmation) {
            action();
        }
    };

    const tippyChildren = (
        <ActionButtonView
            title={title}
            icon={icon}
            iconSpin={iconSpin}
            action={handleClick}
            isDisabled={isDisabled}
            size={iconSize}
            testId={testId}
        />
    );

    return requireConfirmation && !isDisabled ? (
        <Tippy trigger="mouseenter" content={title}>
            <Tippy
                onShown={onShown}
                onShow={onShow}
                onHide={onHide}
                onCreate={tippyInst => (tippy.current = tippyInst)}
                interactive={true}
                trigger="click"
                appendTo={appendTo}
                content={
                    <ConfirmationTooltip message={confirmationMessage} closeTippy={closeTippy} ref={confirmButtonRef} buttons={confirmationButtons} />
                }
            >
                {tippyChildren}
            </Tippy>
        </Tippy>
    ) : (
        <>
            <Tippy appendTo={appendTo} hideOnClick={false} interactive={interactive} trigger="mouseenter" content={title}>
                {tippyChildren}
            </Tippy>
        </>
    );
};

StatementActionButton.propTypes = {
    title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
    icon: PropTypes.object.isRequired,
    iconSpin: PropTypes.bool,
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
            action: PropTypes.func,
        }),
    ),
};

export default StatementActionButton;
