import { Col } from 'reactstrap';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
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
    }
    & a {
        color: ${props => props.theme.bodyColor};
    }
    transition: color 0.5s ease;
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
        <StatsBoxStyled className={`d-flex flex-grow-1 ${props.className} text-center box rounded`}>
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
                            <Number>
                                <CountUp duration={1.1} end={props.number} separator=" " />
                            </Number>
                        ) : (
                            'Loading...'
                        )}
                        <Label>
                            {props.icon && <Icon size="20" icon={props.icon} className="mr-2" />}
                            {props.label}
                        </Label>
                    </LabelWrapper>
                </div>
            </ConditionalWrapper>
        </StatsBoxStyled>
    );
};

ColoredStatsBox.propTypes = {
    icon: PropTypes.object,
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
