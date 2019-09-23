import React from 'react';
import { Tooltip as ReactstrapTooltip } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { guid } from '../../utils';

class Tooltip extends React.Component {
    constructor(props) {
        super(props);

        this.toggle = this.toggle.bind(this);

        this.state = {
            tooltipOpen: false
        };

        this.id = `tooltip-${guid()}`; // generate ID to connect the tooltip with the text 
    }

    toggle() {
        this.setState({
            tooltipOpen: !this.state.tooltipOpen
        });
    }

    render() {
        const style = {
            fontSize: '1rem',
            color: this.props.colorIcon ? this.props.colorIcon : 'initial',
        }
        const className = !this.props.colorIcon ? 'text-primary' : '';

        const trigger = this.props.trigger ? this.props.trigger : 'click hover focus';

        return (
            <span>
                <span id={this.id}>
                    {this.props.children} {!this.props.hideDefaultIcon ? <span style={style}><FontAwesomeIcon icon={faQuestionCircle} className={className} /></span> : ''}
                </span>

                <ReactstrapTooltip
                    delay={{ show: 0, hide: 250 }}
                    placement="top"
                    autohide={false}
                    isOpen={this.state.tooltipOpen}
                    target={this.id}
                    toggle={this.toggle}
                    trigger={trigger}
                >
                    {this.props.message}
                </ReactstrapTooltip>
            </span>
        );
    }
}

Tooltip.propTypes = {
    children: PropTypes.node,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]).isRequired,
    hideDefaultIcon: PropTypes.bool,
    colorIcon: PropTypes.string,
    trigger: PropTypes.string,
}

Tooltip.defaultProps = {
    hideDefaultIcon: false,
    colorIcon: null,
}

export default Tooltip;