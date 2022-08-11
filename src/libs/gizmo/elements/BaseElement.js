import DrawTools from '../drawTools';
import NodeIcon from './NodeIcon';

export default class BaseElement {
    constructor(props) {
        // variables;
        this.idValue = 'base_';
        this.svgRoot = undefined;
        this.renderingElement = undefined;
        this.label = 'empty_label';
        this.renderConfig = undefined;
        this.haloGroupElement = undefined;
        this.visibilityStatus = true;

        this.renderingText = null;
        this.shapeRadius = undefined;
        this.elementType = 'undefined';
        this.multicoloring = false;
        this.colorState = { unknown: '#aaccff', collapsed: '#aaccff', expanded: '#aaccff', leafNode: '#cccccc' };
        this.status = 'none';
        this.x = undefined;
        this.y = undefined;
        this.mouseIn = false;
        this.graph = null;
        this.showHalo = false;

        this.addIcon = this.addIcon.bind(this);
        this.iconElement = undefined;

        this.setConfigObj(props.configObject);

        // objectFunctions
        this.setLabel = this.setLabel.bind(this);
        this.setPosition = this.setPosition.bind(this);
        this.render = this.render.bind(this);
        this.updateDrawPosition = this.updateDrawPosition.bind(this);
        this.drawLabelText = this.drawLabelText.bind(this);
        this.updateTextPosition = this.updateTextPosition.bind(this);
        this.id = this.id.bind(this);
        this.getExpectedShapeSize = this.getExpectedShapeSize.bind(this);
        this.updateTextPosition = this.updateTextPosition.bind(this);
        this.drawLabelText = this.drawLabelText.bind(this);
        this.getConfigObj = this.getConfigObj.bind(this);
        this.setConfigObj = this.setConfigObj.bind(this);
        this.type = this.type.bind(this);
        this.visible = this.visible.bind(this);
        this.mouseEntered = this.mouseEntered.bind(this);
        this.mouseHoverIn = this.mouseHoverIn.bind(this);
        this.mouseHoverOut = this.mouseHoverOut.bind(this);
        this.removeAllRenderedElementsFromParent = this.removeAllRenderedElementsFromParent.bind(this);
    }

    drawHalo = pulseAnimation => {
        if (this.haloGroupElement) {
            this.haloGroupElement.remove();
            this.haloGroupElement = undefined;
        }

        this.haloGroupElement = this.svgRoot.append('g');
        DrawTools().renderHalo(this.haloGroupElement, this.configObject, this);
        if (pulseAnimation) {
            this.haloGroupElement.classed('searchResultA', true);
            this.haloGroupElement.attr('animationRunning', true);
        }

        if (pulseAnimation === false) {
            if (this.haloGroupElement) {
                this.haloGroupElement.classed('searchResultA', false);
                this.haloGroupElement.classed('searchResultB', true);
                this.haloGroupElement.attr('animationRunning', false);
            } else {
                this.haloGroupElement.classed('searchResultB', true);
            }
        }
        this.showHalo = true;
    };

    removeHalo = () => {
        if (this.haloGroupElement) {
            this.haloGroupElement.remove();
            this.showHalo = false;
        }
    };

    updateCircleHalo = (pulseItem, newRadius, animate) => {
        if (pulseItem && pulseItem.node()) {
            if (!animate) {
                this.haloGroupElement.classed('searchResultA', false);
                this.haloGroupElement.classed('searchResultB', true);
                this.haloGroupElement.attr('animationRunning', false);
            }
            DrawTools().setCircleAttribute(pulseItem, newRadius);
        }
    };

    setOutOfViewportRadius = newRadius => {
        if (this.haloGroupElement) {
            // get the item;
            const pulseItem = this.haloGroupElement.select('.haloRenderingShape');
            this.updateCircleHalo(pulseItem, newRadius);
        }
    };

    setInViewportRadius = () => {
        // basically gets the rendering shape attributes and propagates them
        const shapeSize = this.getRenderingElementSize();
        if (!this.haloGroupElement) {
            return;
        }
        const pulseItem = this.haloGroupElement.select('.haloRenderingShape');
        const animate = this.haloGroupElement.attr('animationRunning');
        if (this.renderConfig.renderingType === 'circle') {
            const haloRadius = 0.5 * parseInt(shapeSize.w) + 5;
            this.updateCircleHalo(pulseItem, haloRadius, animate);
        } else {
            const haloWidth = parseInt(shapeSize.w) + 5;
            const haloHeight = parseInt(shapeSize.h) + 5;
            const pulseItem = this.haloGroupElement.select('.haloRenderingShape');
            if (pulseItem && pulseItem.node()) {
                pulseItem.attr('x', -0.5 * haloWidth);
                pulseItem.attr('y', -0.5 * haloHeight);
                pulseItem.attr('width', haloWidth);
                pulseItem.attr('height', haloHeight);
                pulseItem.attr('rx', 0);
                pulseItem.attr('ry', 0);
            }
        }
    };

    addIcon(iconName) {
        if (!this.iconElement) {
            this.iconElement = new NodeIcon();
            this.iconElement.parentNode = this;
        }
        this.iconElement.iconType = iconName;
    }

    removeAllRenderedElementsFromParent() {
        if (this.svgRoot) {
            // we have a parent;
            this.svgRoot.selectAll('rect').remove();
            this.svgRoot.selectAll('text').remove();
            this.svgRoot.selectAll('g').remove();
        }
    }

    visible(val) {
        if (!arguments.length) {
            return this.visibilityStatus;
        }
        this.visibilityStatus = val;
    }

    addHoverEvents() {
        // reset mouseEnteredValue (if redraw it will otherwise not behave as expected)
        this.mouseEntered(false);
        this.svgRoot.on('mouseover', this.mouseHoverIn);
        this.svgRoot.on('mouseout', this.mouseHoverOut);
        this.svgRoot.on('click', this.itemClicked);
    }

    itemClicked = () => {
        if (this.graph) {
            this.graph.removeHalos();
            this.graph.clearSearchEntryValue();
        }
    };

    mouseHoverIn() {
        if (this.mouseEntered()) {
            return;
        }
        this.mouseEntered(true);

        // bring the node up
        const selectedNode = this.svgRoot.node();
        const nodeContainer = selectedNode.parentNode;
        nodeContainer.appendChild(selectedNode);

        // remove pulse animation if it is still running (comparing vs string value of true (since attribute) ...
        if (this.haloGroupElement && this.haloGroupElement.attr('animationRunning') === 'true') {
            this.haloGroupElement.classed('searchResultA', false);
            this.haloGroupElement.classed('searchResultB', true);
            this.haloGroupElement.attr('animationRunning', false);
        }

        this.svgRoot.style('cursor', this.configObject.hoverInCursor);
        this.renderingElement.style('fill', this.configObject.hoverInColor);

        if (this.configObject.strokeElement === true || this.configObject.strokeElement === 'true') {
            this.renderingElement.style('stroke', this.configObject.hoverInStrokeColor);
        }
    }

    mouseHoverOut() {
        this.mouseEntered(false);
        this.svgRoot.style('cursor', 'default');
        if (this.multicoloring && this.multicoloring === true && this.type() === 'resource') {
            this.renderingElement.style('fill', this.colorState[this.status]);
        } else {
            this.renderingElement.style('fill', this.configObject.bgColor);
        }

        if (this.configObject.strokeElement === true || this.configObject.strokeElement === 'true') {
            this.renderingElement.style('stroke', this.configObject.strokeColor);
        }
    }

    mouseEntered(val) {
        if (!arguments.length) {
            return this.mouseIn;
        }
        this.mouseIn = val;
    }

    type(t) {
        if (!arguments.length) {
            return this.elementType;
        }
        this.elementType = t;
    }

    setConfigObj(cfg) {
        this.configObject = cfg;

        // update render config
        if (this.configObject.renderingType === 'umlStyle') {
            this.renderConfig = this.configObject.renderingAttributes;
        } else {
            this.renderConfig = this.configObject;
        }
    }

    getRenderingElementSize() {
        return { w: this.renderingElement.attr('width'), h: this.renderingElement.attr('height') };
    }

    getConfigObj() {
        return this.configObject;
    }

    id(val) {
        if (!arguments.length) {
            return this.idValue;
        }
        this.idValue = val;
    }

    setLabel(val) {
        this.label = val;
    }

    setPosition(px, py) {
        this.x = px;
        this.y = py;
    }

    render(parentNode) {
        this.svgRoot = parentNode;
        this.renderingElement = DrawTools().drawElement(this.svgRoot, this.configObject, this);
        this.renderingText = this.drawLabelText(this.svgRoot, this.label);
        this.renderingElement.append('title').text(this.label);
        this.updateTextPosition();

        if (this.showHalo) {
            this.drawHalo(false);
        }
    }

    updateDrawPosition = function() {
        // to be inherited from others
        console.log('to be inherited from others');
    };

    getExpectedShapeSize(cfg) {
        let retValue;
        let textValue = this.label;
        if (this.renderingText) {
            textValue = this.renderingText.text();
        }
        if (cfg.fontSizeOverWritesShapeSize === 'true') {
            const tempRTE = this.svgRoot.append('text').text(textValue);

            tempRTE.style('font-family', cfg.fontFamily);
            tempRTE.style('font-size', cfg.fontSize);
            tempRTE.style('fill', cfg.fontColor);

            const fontSizeProperty = window.getComputedStyle(tempRTE.node()).getPropertyValue('font-size');
            const fontFamily = window.getComputedStyle(tempRTE.node()).getPropertyValue('font-family');
            const fontSize = parseFloat(fontSizeProperty);
            const textWidth = DrawTools().measureTextWidth(textValue, fontFamily, `${fontSize}px`);

            let height = fontSize + 2 * parseInt(cfg.overWriteOffset);
            let width = textWidth + 2 * parseInt(cfg.overWriteOffset);
            const radius = Math.max(0.5 * height, 0.5 * width);
            tempRTE.remove();
            if (isNaN(height)) {
                height = 10;
            }
            if (isNaN(width)) {
                width = 10;
            }

            retValue = { r: radius, w: width, h: height, dynamic: true };
        } else {
            const c_r = parseInt(cfg.radius);
            let c_w = parseInt(cfg.width);
            let c_h = parseInt(cfg.height);
            if ((cfg.renderingType === 'rect' || cfg.renderingType === 'ellipse') && cfg.width === undefined && cfg.height === undefined) {
                // guess
                c_w = 100;
                c_h = 40;
            }
            retValue = { r: c_r, w: c_w, h: c_h, dynamic: false };
        }
        this.shapeRadius = retValue.r;
        return retValue;
    }

    updateTextPosition() {
        if (this.renderingText) {
            const textWidth = DrawTools().measureTextWidth(this.renderingText.text(), this.renderConfig.fontFamily, this.renderConfig.fontSize);

            let cdy = 0;
            if (this.renderConfig.fontSize.indexOf('px') !== -1) {
                cdy = this.renderConfig.fontSize.split('px')[0];
            }
            const dy = 0.25 * cdy;
            const dx = -0.5 * textWidth;
            this.renderingText.attr('dy', `${dy}px`);
            this.renderingText.attr('dx', `${dx}px`);
        }
    }

    drawLabelText(elementSvgRoot, labelText) {
        if (labelText) {
            const textInRendering = DrawTools().cropTextIfNeeded(this, this.renderConfig, labelText);
            const renderingTextElement = elementSvgRoot.append('text').text(textInRendering);

            // apply different styles that are provided by the config
            renderingTextElement.style('font-family', this.renderConfig.fontFamily);
            renderingTextElement.style('font-size', this.renderConfig.fontSize);
            renderingTextElement.style('fill', this.renderConfig.fontColor);
            renderingTextElement.style('pointer-events', 'none');
            return renderingTextElement;
        }
        return null;
    }
} // end of class definition
