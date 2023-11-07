import Link from 'components/NextJsMigration/Link';
import { Col } from 'reactstrap';
import styled from 'styled-components';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
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

const ColoredStatsBox = ({ link, isLoading, label, className = null, number = 0 }) => (
    <StatsBoxStyled className={`d-flex flex-grow-1 ${className} text-center box rounded mb-3 mx-2`}>
        <ConditionalWrapper
            condition={link}
            wrapper={children => (
                <Link className="flex-grow-1" href={link}>
                    {children}
                </Link>
            )}
        >
            <div className="d-flex flex-grow-1 mt-2 mb-2" style={{ minHeight: '74px' }}>
                <LabelWrapper className="flex-grow-1">
                    {!isLoading ? (
                        <div className="number">
                            <CountUp duration={1.1} end={number} separator=" " />
                        </div>
                    ) : (
                        'Loading...'
                    )}
                    <Label>{label}</Label>
                </LabelWrapper>
            </div>
        </ConditionalWrapper>
    </StatsBoxStyled>
);

ColoredStatsBox.propTypes = {
    label: PropTypes.string.isRequired,
    number: PropTypes.number,
    className: PropTypes.string,
    isLoading: PropTypes.bool,
    link: PropTypes.string,
};

export default ColoredStatsBox;
