import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ShortRecord extends Component {

    render() {
        return (
            <div className="shortRecord">
                <div className="shortRecord-header"><a href={this.props.href}>{this.props.header}</a></div>
                <div className="shortRecord-content">{this.props.children}</div>
            </div>
        )
    }

}

ShortRecord.propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
}

export default ShortRecord;