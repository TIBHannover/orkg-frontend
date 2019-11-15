import React from 'react';
import { Col } from 'reactstrap';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import NumberFormat from 'react-number-format';

const StatsBoxStyled = styled(Col)`
    color: #fff;
    padding: 0!important;
    display:flex;

    &.blue {
        background-color: #4CA7D0;
    }
    &.green {
        background-color: #4AA84E;
    }
    &.orange {
        background-color: #CC7138;
    }
    &.black {
        background-color: #4F4D50;
    }
`;

const IconContainer = styled.div`
    width:74px;
    height:74px;
    font-size: 32px;
    align-items: center;
    justify-content: center;
    display: flex;
    

    &.blue {
        background-color: #3F90B4;
    }
    &.green {
        background-color: #2C8930;
    }
    &.orange {
        background-color: #A75929;
    }
    &.black {
        background-color: #2F2D2F;
    }
`;

const LabelWrapper = styled.div`
    padding-left: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const Number = styled.div`
    font-size:26px;
    line-height:1;
`;

const Label = styled.div`
    font-size:18px;
`;

const ColoredStatsBox = (props) => {
    return (
        <StatsBoxStyled className={`box ${props.className} ${props.color}`}>
            <IconContainer className={props.color}><Icon icon={props.icon} /></IconContainer>
            <LabelWrapper>
                {!props.isLoading ? (<Number><NumberFormat value={props.number} displayType={'text'} thousandSeparator={' '} /></Number>) : 'Loading...'}
                <Label>{props.label}</Label>
            </LabelWrapper>
        </StatsBoxStyled>
    );
}

ColoredStatsBox.propTypes = {
    icon: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['blue', 'green', 'orange', 'black']).isRequired,
    number: PropTypes.number,
    className: PropTypes.string,
    isLoading: PropTypes.bool,
};

ColoredStatsBox.defaultProps = {
    className: null,
    number: 0,
}

export default ColoredStatsBox;