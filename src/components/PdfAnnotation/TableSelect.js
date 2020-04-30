import React, { Component } from 'react';
import { withTheme } from 'styled-components';
import { compose } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import ExtractionModal from './ExtractionModal';

const Container = styled.div`
    &.enable-table-select {
        // for pages
        cursor: crosshair; // set the cursor
        user-select: none; // disable text selection
        -webkit-touch-callout: none;

        // for images
        img {
            pointer-events: none;
        }
    }
`;

const SelectHelper = styled.div`
    position: absolute;
    background: #28afe975;
    border: 2px dashed #28afe9bd;
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

class TableSelect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            startX: -1,
            startY: -1,
            rect: null,
            showExtractionModal: false
        };
    }

    onMouseDown = e => {
        //this.isDragging = true;
        //this.curX = this.startX = e.offsetX;
        //this.curY = this.startY = e.offsetY;
        // replace offsetX with pageX, minus the position of the page
        this.setState({
            isDragging: true,
            startX: e.nativeEvent.offsetX,
            startY: e.nativeEvent.offsetY
        });
    };

    onMouseMove = e => {
        if (!this.state.isDragging || this.props.selectedTool !== 'tableSelect') {
            return;
        }

        const event = e.nativeEvent;

        this.setState(prevState => ({
            rect: {
                x: Math.min(prevState.startX, event.offsetX),
                y: Math.min(prevState.startY, event.offsetY),
                w: Math.abs(event.offsetX - prevState.startX),
                h: Math.abs(event.offsetY - prevState.startY)
            }
        }));
    };

    onMouseUp = e => {
        this.setState({
            isDragging: false
        });
    };

    handleExtract = e => {
        e.stopPropagation(); // don't propagate to mouse down for dragging
        this.setState({
            showExtractionModal: true
        });
    };

    toggleModel = () => {
        this.setState(prevState => ({
            showExtractionModal: !prevState.showExtractionModal
        }));
    };

    render() {
        const { rect } = this.state;
        // disable pointer events to ensure offsetX and offsetY on drag are from the page parent (and not other child elements)
        const pointerStyles = { pointerEvents: this.props.selectedTool === 'tableSelect' ? 'none' : 'auto' };

        return (
            <>
                <Container
                    className={this.props.selectedTool === 'tableSelect' && 'enable-table-select'}
                    onMouseDown={this.onMouseDown}
                    onMouseUp={this.onMouseUp}
                    onMouseMove={this.onMouseMove}
                >
                    <div style={pointerStyles}>
                        {this.props.children}
                        {rect && (
                            <SelectHelper style={{ top: rect.y, left: rect.x, width: rect.w, height: rect.h }}>
                                {!this.state.isDragging && (
                                    <Button style={{ pointerEvents: 'all' }} color="primary" size="sm" onMouseDown={this.handleExtract}>
                                        Extract table
                                    </Button>
                                )}
                            </SelectHelper>
                        )}
                    </div>
                </Container>

                {this.state.showExtractionModal && ( // prevent unneeded rerenders, only render when required
                    <ExtractionModal
                        isOpen={this.state.showExtractionModal}
                        toggle={this.toggleModel}
                        region={this.state.rect}
                        pageNumber={this.props.pageNumber}
                    />
                )}
            </>
        );
    }
}

TableSelect.propTypes = {
    children: PropTypes.node.isRequired,
    selectedTool: PropTypes.string.isRequired,
    pageNumber: PropTypes.number.isRequired
};

const mapStateToProps = state => ({
    selectedTool: state.pdfAnnotation.selectedTool
});

const mapDispatchToProps = dispatch => ({});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme
)(TableSelect);
