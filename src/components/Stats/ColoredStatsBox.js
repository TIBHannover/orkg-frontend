import { Col } from 'reactstrap';
import styled from 'styled-components';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

const StatsBoxStyled = styled(Col)`
    color: ${props => props.theme.bodyColor};
    padding: 0 !important;
    display: flex;
    min-height: 74px !important;
    position: relative;
    & a:hover {
        text-decoration: none;
        color: ${props => props.theme.primary};
        .number {
            color: ${props => props.theme.primary};
        }
    }
    & a {
        color: ${props => props.theme.bodyColor};
    }
    .number {
        font-size: 26px;
        line-height: 1;
        color: ${props => props.theme.dark};
        white-space: nowrap;
    }
    transition: color 0.5s ease;
`;

const LabelWrapper = styled.div`
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const Label = styled.div`
    margin-top: 5px;
    font-size: 18px;
`;

const ColoredStatsBox = props => {
    return (
        <StatsBoxStyled className={`d-flex flex-grow-1 ${props.className} text-center box rounded mb-3 mx-2`}>
            <ConditionalWrapper
                condition={props.link}
                wrapper={children => (
                    <Link className="flex-grow-1" to={props.link}>
                        {children}
                    </Link>
                )}
            >
                <div className="d-flex flex-grow-1 mt-2 mb-2" style={{ minHeight: '74px' }}>
                    <LabelWrapper className="flex-grow-1">
                        {!props.isLoading ? (
                            <div className="number">
                                <CountUp duration={1.1} end={props.number} separator=" " />
                            </div>
                        ) : (
                            'Loading...'
                        )}
                        <Label>{props.label}</Label>
                    </LabelWrapper>
                </div>
            </ConditionalWrapper>
        </StatsBoxStyled>
    );
};

ColoredStatsBox.propTypes = {
    label: PropTypes.string.isRequired,
    number: PropTypes.number,
    className: PropTypes.string,
    isLoading: PropTypes.bool,
    link: PropTypes.string
};

ColoredStatsBox.defaultProps = {
    className: null,
    number: 0
};

export default ColoredStatsBox;
