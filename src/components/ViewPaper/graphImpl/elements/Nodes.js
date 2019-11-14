import BaseElement from './BaseElement';
import * as d3 from 'd3';

export default class Node extends BaseElement {
    constructor(props) {
        super(props);

        // variables;
        this.id('node_');
        this.getRadius = this.getRadius.bind(this);
        this.getRenderingShape = this.getRenderingShape.bind(this);
        this.addLinkElement = this.addLinkElement.bind(this);
        this.setDepth = this.setDepth.bind(this);
        this.getDepth = this.getDepth.bind(this);

        this.linkElements = [];
        this.incommingLink = [];
        this.outgoingLink = [];
        this.depthValue = -1;
        this.type('resource');

        this.filterCollapsedLinks = this.filterCollapsedLinks.bind(this);
        this.startLayoutTransition = this.startLayoutTransition.bind(this);
    }

    startLayoutTransition(id, max, callback) {
        // get old value
        const f_x = parseInt(this.x);
        const f_y = parseInt(this.y);
        let that = this;

        that.svgRoot.transition()
            .tween('attr.translate', function () {
                return function () {
                    const tr = d3.transform(that.svgRoot.attr('transform'));
                    that.x = tr.translate[0];
                    that.y = tr.translate[1];
                    that.px = that.x;
                    that.py = that.y;

                    that.linkElements.forEach(link => {
                        link.updateDrawPosition();
                    });
                };
            }).each('end', function () {
            if (id === max) { // this should zoom to the extent
                callback();
            }
        }).attr('transform', 'translate(' + f_x + ',' + f_y + ')');
    }


    filterCollapsedLinks() {
        let linksToDraw = [];
        this.outgoingLink.forEach(link => {
            if (!link.visible()) {
                linksToDraw.push(link);
            }
        });
        return linksToDraw;
    }

    addLinkElement(link) {
        this.linkElements.push(link);
        if (link.domainNode() === this) {
            this.outgoingLink.push(link);
        } else {
            this.incommingLink.push(link);
        }
    }

    setDepth(v) {
        this.depthValue = v;
    }

    getDepth() {
        return this.depthValue;
    }

    id(val) {
        if (!arguments.length) {
            return this.idValue;
        } else {
            this.idValue = val;
        }
    }

    setLabel(val) {
        this.label = val;
    }

    setPosition(px, py) {
        this.x = px;
        this.y = py;
    }

    updateDrawPosition = function () {
        if (this.svgRoot) {
            this.svgRoot.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
            this.linkElements.forEach(link => {
                link.updateDrawPosition();
            });
        }
    };

    getRadius = function () {
        if (this.shapeRadius) {
            return this.shapeRadius;
        }
        return parseInt(this.configObject.radius);
    };

    getRenderingShape = function () {
        return this.renderingElement;
    };

} // end of class definition
