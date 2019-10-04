/* eslint-disable */

import React, {Component} from 'react';
import {Button} from 'reactstrap';

export default class LinkButton extends Component {

    render() {
        return (<span className={this.props.className}>
            <Button onClick={this.props.onClick}>
                <span className={this.props.spanClassName} />
                {this.props.value}
            </Button>
                </span>)
    }

}
