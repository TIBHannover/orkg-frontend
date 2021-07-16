import { Col } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import { Link } from 'react-router-dom';

const StatsBoxStyled = styled(Col)`
    padding: 0 !important;
    display: flex;
    border-right: 2px solid #d9dbe3;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
    transition: color 0.5s ease;
    .number {
        font-size: 37px;
        color: #8b91a5;
    }
`;

const Label = styled.div`
    font-size: 18px;
`;

const InlineStatsBox = props => {
    return (
        <StatsBoxStyled className="text-center" style={props.hideBorder ? { border: 0 } : {}}>
            <ConditionalWrapper condition={props.link} wrapper={children => <Link to={props.link}>{children}</Link>}>
                {!props.isLoading ? (
                    <div className="number">
                        <CountUp duration={1.1} end={props.number} separator=" " />
                    </div>
                ) : (
                    'Loading...'
                )}
                <Label>{props.label}</Label>
            </ConditionalWrapper>
        </StatsBoxStyled>
    );
};

InlineStatsBox.propTypes = {
    label: PropTypes.string.isRequired,
    number: PropTypes.number,
    hideBorder: PropTypes.bool,
    isLoading: PropTypes.bool,
    link: PropTypes.string
};

InlineStatsBox.defaultProps = {
    className: null,
    hideBorder: false,
    number: 0
};

export default InlineStatsBox;
