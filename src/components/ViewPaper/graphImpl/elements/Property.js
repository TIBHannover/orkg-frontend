import DrawTools from '../drawTools'
import BaseElement from './BaseElement';


export default class Property extends BaseElement {
    constructor(props) {
        super(props);
        this.id('property_');
        this.domain = undefined;
        this.range = undefined;
        this.link = undefined;
        this.renderingLine = undefined;

        this.propertyType = 'single';

        // bind new functions;
        this.domainNode = this.domainNode.bind(this);
        this.rangeNode = this.rangeNode.bind(this);
        this.linkElement = this.linkElement.bind(this);
        this.getForceLink = this.getForceLink.bind(this);
    };


    linkElement = function (d) {
        if (!arguments.length) {
            return this.link;
        }
        this.link = d;
    };

    domainNode = function (d) {
        if (!arguments.length) {
            return this.domain;
        }
        this.domain = d;
    };

    rangeNode = function (r) {
        if (!arguments.length) {
            return this.range;
        }
        this.range = r;
    };

    render(parentNode) {
        this.svgRoot = parentNode;
        this.renderingElement = DrawTools().drawElement(this.svgRoot, this.configObject, this);
        this.renderingText = this.drawLabelText(this.svgRoot, this.label);
        this.updateTextPosition();
    };

    updateDrawPosition = function () {
        if (this.propertyType === 'single') {
            // compute center of the domain range part ;
            this.x = 0.5 * (this.range.x + this.domain.x);
            this.y = 0.5 * (this.range.y + this.domain.y);
        }
        if (this.svgRoot) {
            this.svgRoot.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
            this.link.updateDrawPosition();
        }
    };

    getForceLink = function () {
        let that = this;
        return [
            {
                'source': that.domain,
                'target': that.range,
                'propertyData': that
            }
        ];
    };

}// end of class definition
