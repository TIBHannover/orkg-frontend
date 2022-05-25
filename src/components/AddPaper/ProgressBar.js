import { Component } from 'react';
import PropTypes from 'prop-types';

/*
    This component is using React's native component styling, it is kind of a mess...
    TODO: replacing inline styles with styled components
*/

const labelStyle = {
    width: '33.33%',
    float: 'left',
    textAlign: 'center',
    position: 'relative',
};

const numberStyle = {
    zZndex: 1,
    height: '29px',
    width: '29px',
    borderRadius: '25px',
    background: '#e9ecef', // #E86161
    color: '#939393', // #fff
    fontSize: 20,
    textAlign: 'center',
    left: 'calc(50% - 15px)',
    position: 'absolute',
    transition: '.5s background',
};

const textStyle = {
    display: 'inline-block',
    width: '100%',
    marginTop: 35,
};

const labelGroupStyle = {
    position: 'absolute',
    width: '100%',
};

const lineStyle = {
    height: 4,
    width: '50%',
    display: 'inline-block',
    background: '#e9ecef',
    position: 'absolute',
    left: '0%',
    top: 13,
    zIndex: 0,
    transition: '.7s background',
};

const lineLeftStyle = {
    left: '50%',
};

const selectedStyle = {
    background: '#E86161',
    color: '#fff',
};

class ProgressBar extends Component {
    render() {
        const styleSelectedOne = this.props.currentStep >= '1' ? selectedStyle : {};
        const styleSelectedTwo = this.props.currentStep >= '2' ? selectedStyle : {};
        const styleSelectedThree = this.props.currentStep >= '3' ? selectedStyle : {};

        return (
            <div style={{ height: 65, margin: '30px 0 30px', position: 'relative' }}>
                <div style={labelGroupStyle}>
                    <div style={labelStyle}>
                        {/* <div style={{...lineStyle, ...styleSelectedOne}}></div> */}
                        <div style={{ ...lineStyle, ...lineLeftStyle, ...styleSelectedTwo }} />
                        <div style={{ ...numberStyle, ...styleSelectedOne }}>1</div>
                        <div style={textStyle}>General</div>
                    </div>
                    <div style={labelStyle}>
                        <div style={{ ...lineStyle, ...styleSelectedTwo }} />
                        <div style={{ ...lineStyle, ...lineLeftStyle, ...styleSelectedThree }} />
                        <div style={{ ...numberStyle, ...styleSelectedTwo }}>2</div>
                        <div style={textStyle}>Research field</div>
                    </div>
                    <div style={labelStyle}>
                        <div style={{ ...lineStyle, ...styleSelectedThree }} />
                        <div style={{ ...numberStyle, ...styleSelectedThree }}>3</div>
                        <div style={textStyle}>Contributions</div>
                    </div>
                </div>
            </div>
        );
    }
}

ProgressBar.propTypes = {
    currentStep: PropTypes.number.isRequired,
};

export default ProgressBar;
