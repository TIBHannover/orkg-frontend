import React, {Component} from 'react';

export default class LinkButton extends Component {

    render() {
        return <span className={this.props.className}>
            <a href="#" title={this.props.title} onClick={this.props.onClick}>
                <span className={this.props.spanClassName}/>
                {this.props.value}
            </a>
        </span>
    }

}