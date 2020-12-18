import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faArrowCircleLeft, faArrowCircleRight } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

export default class PreviewCarouselComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            startItemIndex: 0,
            showArrowLeft: false,
            showArrowRight: false
        };
        this.childWidth = 215;
    }

    componentDidMount = () => {
        this.executeUpdates();
        // add resize event
        window.addEventListener('resize', this.resizeEvent);
    };

    componentDidUpdate = prevProps => {
        if (prevProps.reloadingSizeFlag !== this.props.reloadingSizeFlag) {
            this.executeUpdates();
        }
    };
    componentWillUnmount() {
        window.removeEventListener('resize', this.resizeEvent);
    }

    // just a wrapper function for better code reading
    resizeEvent = () => {
        this.executeUpdates();
    };

    executeUpdates = () => {
        const item = document.getElementById('PreviewCarouselContainer');

        const areaWidth = item.scrollWidth;
        const clientWidth = item.clientWidth;
        const left = item.scrollLeft;
        const leftMax = item.scrollLeftMax;

        const needUpdate = clientWidth < areaWidth;
        if (needUpdate || (this.state.showArrowLeft || this.state.showArrowRight)) {
            this.handleLeftArrowShow(left);
            this.handleRightArrowShow(left, leftMax);
        }
    };

    handleRightArrowShow = (left, max) => {
        if (left === max) {
            if (this.state.showArrowRight) {
                this.setState({ showArrowRight: false });
            }
        } else {
            if (!this.state.showArrowRight) {
                this.setState({ showArrowRight: true });
            }
        }
    };

    handleLeftArrowShow = val => {
        if (val > 0) {
            if (!this.state.showArrowLeft) {
                this.setState({ showArrowLeft: true });
            }
        } else {
            if (this.state.showArrowLeft) {
                this.setState({ showArrowLeft: false });
            }
        }
    };

    handleScrollLeft = () => {
        const item = document.getElementById('PreviewCarouselContainer');
        item.scrollTo({
            top: 0,
            left: item.scrollLeft - this.childWidth,
            behavior: 'smooth'
        });
    };
    handleScrollRight = () => {
        const item = document.getElementById('PreviewCarouselContainer');
        item.scrollTo({
            top: 0,
            left: item.scrollLeft + this.childWidth,
            behavior: 'smooth'
        });
    };

    executeWheelEvent = event => {
        if (this.state.showArrowLeft || this.state.showArrowRight) {
            event.preventDefault();
            if (event.deltaY > 0) {
                this.handleScrollLeft();
            } else {
                this.handleScrollRight();
            }
        }
    };

    /** component rendering entrance point **/
    render() {
        return (
            <div style={{ paddingTop: '10px', height: '200px' }}>
                <h2 className="h4 mb-1 mt-1 flex-grow-1">Chart Visualizations</h2>
                <div
                    id="PreviewCarouselContainer"
                    style={{ display: 'flex', width: '100%', overflowX: 'hidden' }}
                    onScroll={() => this.executeUpdates()}
                    onWheel={event => {
                        this.executeWheelEvent(event);
                    }}
                >
                    {this.props.children}
                </div>
                <div style={{ display: 'block', height: '35px' }}>
                    {this.state.showArrowLeft && (
                        <span
                            style={{ marginTop: '5px', position: 'relative', float: 'left', cursor: 'pointer' }}
                            onClick={() => {
                                this.handleScrollLeft();
                            }}
                        >
                            <Icon icon={faArrowCircleLeft} className="text-primary" style={{ fontSize: 25 }} />
                        </span>
                    )}
                    {this.state.showArrowRight && (
                        <span
                            style={{ marginTop: '5px', position: 'relative', float: 'right', cursor: 'pointer' }}
                            onClick={() => {
                                this.handleScrollRight();
                            }}
                        >
                            <Icon icon={faArrowCircleRight} className="text-primary " style={{ fontSize: 25 }} />
                        </span>
                    )}
                </div>
            </div>
        );
    }
}

PreviewCarouselComponent.propTypes = {
    children: PropTypes.any,
    reloadingSizeFlag: PropTypes.bool
};
