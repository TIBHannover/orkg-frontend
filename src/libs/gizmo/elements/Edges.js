import DrawTools from '../drawTools';
import BaseElement from './BaseElement';
import * as d3 from 'd3';
let id = 0;
export default class Edge extends BaseElement {
    constructor(props) {
        super(props);

        this.id('edge_' + id++);
        this.domain = undefined;
        this.range = undefined;
        this.prop = undefined;

        this.renderingLine = undefined;

        // bind new functions;
        this.domainNode = this.domainNode.bind(this);
        this.rangeNode = this.rangeNode.bind(this);
        this.propertyNode = this.propertyNode.bind(this);

        // helper function
        this.lineFunction = d3.svg
            .line()
            .x(function(d) {
                return d.x;
            })
            .y(function(d) {
                return d.y;
            })
            .interpolate('cardinal');
    }

    propertyNode = function(p) {
        if (!arguments.length) {
            return this.prop;
        }
        this.prop = p;
    };

    domainNode = function(d) {
        if (!arguments.length) {
            return this.domain;
        }
        this.domain = d;
    };

    rangeNode = function(r) {
        if (!arguments.length) {
            return this.range;
        }
        this.range = r;
    };

    render(parentNode, markerContainer) {
        this.svgRoot = parentNode;
        this.renderingLine = DrawTools().drawLinkElement(this.svgRoot, this.configObject);
        DrawTools().drawArrowHead(this.svgRoot, markerContainer, this.id() + '_arrowHead', this.configObject);
    }

    updateDrawPosition = function() {
        if (this.renderingLine) {
            let that = this;
            this.renderingLine.attr('d', this.lineFunction(that.calculateLinkPath()));
        }
    };

    calculateLinkPath(expected) {
        let iP;
        if (expected) {
            // todo: used for notation changes
        } else {
            iP = DrawTools().computeIntersectionPointsForMLP(this.domain, this.prop, this.range, 1);
        }

        let fixPoint1 = { x: iP.x1, y: iP.y1 },
            fixPoint2 = { x: this.prop.x, y: this.prop.y },
            fixPoint3 = { x: iP.x2, y: iP.y2 };

        return [fixPoint1, fixPoint2, fixPoint3];
    }
} // end of class definition
