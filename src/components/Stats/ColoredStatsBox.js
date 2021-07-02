import { Col } from 'reactstrap';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';

const StatsBoxStyled = styled(Col)`
    color: ${props => props.theme.bodyColor};
    padding: 0 !important;
    display: flex;
    min-height: 74px !important;
    position: relative;
`;

const IconContainer = styled.div`
    width: 74px;
    height: 74px;
    font-size: 32px;
    align-items: center;
    justify-content: center;
    display: flex;
    color: ${props => props.theme.secondary};
`;

const LabelWrapper = styled.div`
    padding: 0 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const Number = styled.div`
    font-size: 26px;
    line-height: 1;
    color: ${props => props.theme.dark};
`;

const Label = styled.div`
    margin-top: 5px;
    font-size: 18px;
`;

const ColoredStatsBox = props => {
    return (
        <StatsBoxStyled className={`box rounded ${props.className} ${props.icon ? '' : 'text-center'}`}>
            <div className="d-flex flex-grow-1 mt-2 mb-2" style={{ minHeight: '74px' }}>
                {props.icon && (
                    <IconContainer className={`rounded-left `}>
                        <Icon icon={props.icon} />
                    </IconContainer>
                )}
                <LabelWrapper className="flex-grow-1">
                    {!props.isLoading ? (
                        <Number>
                            <CountUp duration={1.1} end={props.number} separator=" " />
                        </Number>
                    ) : (
                        'Loading...'
                    )}
                    <Label>{props.label}</Label>
                </LabelWrapper>
            </div>
        </StatsBoxStyled>
    );
};

ColoredStatsBox.propTypes = {
    icon: PropTypes.object,
    label: PropTypes.string.isRequired,
    number: PropTypes.number,
    className: PropTypes.string,
    isLoading: PropTypes.bool
};

ColoredStatsBox.defaultProps = {
    className: null,
    number: 0
};

export default ColoredStatsBox;
