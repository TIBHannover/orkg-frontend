import React, { Component } from 'react';
import PropTypes from 'prop-types';

/* 
    This component is using React's native component styling, it is kind of a mess...
    TODO: replacing inline styles by a better alternative 
*/

const labelStyle = {
    width: '25%',
    float: 'left',
    textAlign: 'center',
    position: 'relative'
}

const numberStyle = {
    zZndex: 1,
    height: '29px',
    width: '29px',
    borderRadius: '25px',
    background: '#e9ecef', //#E86161
    color: '#939393', //#fff
    fontSize: 20,
    textAlign: 'center',
    left: 'calc(50% - 15px)',
    position: 'absolute'
};

const textStyle = {
    display: 'inline-block',
    width: '100%',
    marginTop: 35,
}

const labelGroupStyle = {
    position: 'absolute',
    width: '100%',
}

const lineStyle = {
    height: 4,
    width: '50%',
    display: 'inline-block',
    background: '#e9ecef',
    position: 'absolute',
    left: '0%',
    top: 13,
    zIndex: 0
}

const lineLeftStyle = {
    left: '50%',
}

const selectedStyle = {
    background: '#E86161',
    color: '#fff'
}

class ProgressBar extends Component {
    render() {
        
        let styleSelectedOne = this.props.currentStep >= '1' ? selectedStyle : { };
        let styleSelectedTwo = this.props.currentStep >= '2' ? selectedStyle : { };
        let styleSelectedThree = this.props.currentStep >= '3' ? selectedStyle : { };
        let styleSelectedFour = this.props.currentStep >= '4' ? selectedStyle : { };

        return (
            <div style={{ height: 65, margin: '30px 0 30px', position: 'relative' }}>
                <div style={labelGroupStyle}>
                    <div style={labelStyle}>
                        {/*<div style={{...lineStyle, ...styleSelectedOne}}></div>*/}
                        <div style={{ ...lineStyle, ...lineLeftStyle, ...styleSelectedTwo}}></div>
                        <div style={{...numberStyle, ...styleSelectedOne}}>1</div>
                        <div style={textStyle}>General</div>
                    </div>
                    <div style={labelStyle}>
                        <div style={{...lineStyle, ...styleSelectedTwo}}></div>
                        <div style={{ ...lineStyle, ...lineLeftStyle, ...styleSelectedThree}}></div>
                        <div style={{...numberStyle, ...styleSelectedTwo}}>2</div>
                        <div style={textStyle}>Research field</div>
                    </div>
                    <div style={labelStyle}>
                        <div style={{...lineStyle, ...styleSelectedThree}}></div>
                        <div style={{ ...lineStyle, ...lineLeftStyle, ...styleSelectedFour}}></div>
                        <div style={{...numberStyle, ...styleSelectedThree}}>3</div>
                        <div style={textStyle}>Contributions</div>
                    </div>
                    <div style={labelStyle}>
                        <div style={{...lineStyle, ...styleSelectedFour}}></div>
                        {/*<div style={{ ...lineStyle, ...lineLeftStyle, ...styleSelectedFour}}></div>*/}
                        <div style={{...numberStyle, ...styleSelectedFour}}>4</div>
                        <div style={textStyle}>Finish</div>
                    </div>
                </div>
            </div>
        );
    }
}

ProgressBar.propTypes = {
    currentStep: PropTypes.number.isRequired
};

export default ProgressBar;