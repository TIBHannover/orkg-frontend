import { forwardRef } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const handleIconWrapperSize = wrappersize => {
    switch (wrappersize) {
        case 'xs':
            return '1.5rem';
        case 'lg':
            return '2.5rem';
        case 'sm':
            return '2rem';
        default:
            return '1.5rem';
    }
};

export const OptionButtonStyled = styled(Button)`
    display: inline-block;
    border-radius: 100%;
    background-color: ${props => props.theme.lightDarker};
    color: ${props => props.theme.dark};

    & .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: ${({ wrappersize }) => handleIconWrapperSize(wrappersize)};
        width: ${({ wrappersize }) => handleIconWrapperSize(wrappersize)};
    }

    :first-of-type {
        margin-left: 0 !important;
    }

    :hover {
        background-color: ${props => props.theme.secondary};
        color: #fff;
    }

    :focus {
        box-shadow: 0 0 0 0.2rem rgba(203, 206, 209, 0.5);
    }
`;

const ActionButtonView = forwardRef((props, ref) => {
    return (
        <OptionButtonStyled
            wrappersize={props.size}
            disabled={props.isDisabled}
            color="link"
            className="p-0 mx-1"
            onClick={props.action}
            aria-label={props.title}
            innerRef={ref}
        >
            <span className="icon-wrapper">
                <Icon size={props.size} icon={props.icon} />
            </span>
        </OptionButtonStyled>
    );
});

ActionButtonView.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.object.isRequired,
    size: PropTypes.oneOf(['xs', 'sm', 'lg']).isRequired,
    action: PropTypes.func,
    isDisabled: PropTypes.bool
};

ActionButtonView.defaultProps = {
    size: 'xs'
};

export default ActionButtonView;
