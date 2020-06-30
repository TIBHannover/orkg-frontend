import React from 'react';
import { Col } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';

const StatsBoxStyled = styled(Col)`
    padding: 0 !important;
    display: flex;
    border-right: 2px solid #d9dbe3;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Number = styled.div`
    font-size: 37px;
    color: #8b91a5;
`;

const Label = styled.div`
    font-size: 18px;
`;

const InlineStatsBox = props => {
    return (
        <StatsBoxStyled className={props.className} style={props.hideBorder ? { border: 0 } : {}}>
            {!props.isLoading ? (
                <Number>
                    <NumberFormat value={props.number} displayType="text" thousandSeparator={' '} />
                </Number>
            ) : (
                'Loading...'
            )}
            <Label>{props.label}</Label>
        </StatsBoxStyled>
    );
};

InlineStatsBox.propTypes = {
    label: PropTypes.string.isRequired,
    className: PropTypes.string,
    number: PropTypes.number,
    hideBorder: PropTypes.bool,
    isLoading: PropTypes.bool
};

InlineStatsBox.defaultProps = {
    className: null,
    hideBorder: false,
    number: 0
};

export default InlineStatsBox;
