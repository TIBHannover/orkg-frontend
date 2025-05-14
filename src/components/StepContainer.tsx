import classNames from 'classnames';
import { FC, ReactNode } from 'react';
import { Container } from 'reactstrap';
import styled from 'styled-components';

const StepStyled = styled.div`
    height: 29px;
    width: 29px;
    border-radius: 25px;
    background: ${(props) => props.theme.secondary};
    color: rgb(255, 255, 255);
    font-size: 20px;
    text-align: center;
    left: 0;
    position: absolute;
    transition: background 0.5s ease 0s;
    top: -2px;

    &.active {
        background: ${(props) => props.theme.primary};
    }
`;

const LineStyled = styled.div`
    height: 35px;
    width: 4px;
    display: inline-block;
    background: ${(props) => props.theme.secondary};
    position: absolute;
    left: 13px;
    top: 25px;
    z-index: 0;
    transition: background 0.7s ease 0s;

    &.top {
        top: -25px;
    }
    &.active {
        background: ${(props) => props.theme.primary};
    }
`;

const TitleStyled = styled.h1`
    font-size: 130%;
    margin-left: 35px;

    &:not(.active) {
        color: ${(props) => props.theme.secondary};
    }
`;
type StepContainerProps = {
    step?: string;
    title?: ReactNode;
    topLine?: boolean;
    bottomLine?: boolean;
    active?: boolean;
    children?: ReactNode;
};
const StepContainer: FC<StepContainerProps> = ({ step, title, topLine = false, bottomLine = false, active = false, children = null }) => {
    const activeClasses = active ? 'active' : '';
    const topClasses = classNames({
        top: true,
        active,
    });
    const titleClasses = classNames({
        'h4 mt-4 mb-4': true,
        active,
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
                <Container className="box rounded pt-4 pb-4 ps-5 pe-5 position-relative" style={{ zIndex: 1 }}>
                    {children}
                </Container>
            )}
        </>
    );
};

export default StepContainer;
