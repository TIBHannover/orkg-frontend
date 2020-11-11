import React from 'react';
import { Container } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const StepStyled = styled.div`
    height: 29px;
    width: 29px;
    border-radius: 25px;
    background: ${props => props.theme.darkblue};
    color: rgb(255, 255, 255);
    font-size: 20px;
    text-align: center;
    left: 0;
    position: absolute;
    transition: background 0.5s ease 0s;
    top: -2px;

    &.active {
        background: ${props => props.theme.primary};
    }
`;

const LineStyled = styled.div`
    height: 35px;
    width: 4px;
    display: inline-block;
    background: ${props => props.theme.darkblue};
    position: absolute;
    left: 13px;
    top: 25px;
    z-index: 0;
    transition: background 0.7s ease 0s;

    &.top {
        top: -25px;
    }
    &.active {
        background: ${props => props.theme.primary};
    }
`;

const TitleStyled = styled.h1`
    font-size: 130%;
    margin-left: 35px;

    &:not(.active) {
        color: ${props => props.theme.darkblue};
    }
`;

const StepContainer = props => {
    const { step, title, topLine, bottomLine, active, children } = props;
    const activeClasses = active ? 'active' : '';
    const topClasses = classNames({
        top: true,
        active
    });
    const titleClasses = classNames({
        'h4 mt-4 mb-4': true,
        active
    });

    return (
        <>
            <Container className="position-relative">
                {topLine && <LineStyled className={topClasses} />}

                <StepStyled className={activeClasses}>{step}</StepStyled>

                {bottomLine && <LineStyled className={activeClasses} />}

                <TitleStyled className={titleClasses}>{title}</TitleStyled>
            </Container>
            {active && (
                <Container className="box rounded pt-4 pb-4 pl-5 pr-5 position-relative" style={{ zIndex: 1 }}>
                    {children}
                </Container>
            )}
        </>
    );
};

StepContainer.propTypes = {
    step: PropTypes.string.isRequired,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    topLine: PropTypes.bool,
    bottomLine: PropTypes.bool,
    active: PropTypes.bool,
    children: PropTypes.node
};

StepContainer.defaultProps = {
    topLine: false,
    bottomLine: false,
    active: false,
    children: null
};

export default StepContainer;
