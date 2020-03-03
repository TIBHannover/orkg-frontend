import BaseElement from './BaseElement';
import * as d3 from 'd3';
import './nodeLoaderAnimation.css';
import DrawTools from '../drawTools';

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
        this.status = 'unknown';
        this.multicoloring = true;
        this._resourceId = 'unknown';
        this.nodeHasBeenExplored = false;
        this.graph = undefined;
        this.renderingAnimationGroup = undefined;
        this.collapseExapandGroup = undefined;
        this.stackViewGroup = undefined;
        this._parentNodeForPosition = undefined;
        this.defaultDuration = 400;
        this.percentModifier = 1.0;
        this.isLiteralItem = false;
        this.type('resource');

        this.filterCollapsedLinks = this.filterCollapsedLinks.bind(this);
        this.startLayoutTransition = this.startLayoutTransition.bind(this);
        this.addDoubleClickAction = this.addDoubleClickAction.bind(this);
        this.setExploreAnimation = this.setExploreAnimation.bind(this);
        this.resourceId = this.resourceId.bind(this);
        this.addHoverCollapseExpandButton = this.addHoverCollapseExpandButton.bind(this);
        this.removeHoverCollapseExpandButton = this.removeHoverCollapseExpandButton.bind(this);

        this.collapseButton_mouseHoverIn = this.collapseButton_mouseHoverIn.bind(this);
        this.collapseButton_mouseHoverOut = this.collapseButton_mouseHoverOut.bind(this);
        this.addStackedView = this.addStackedView.bind(this);
        this.makeInvisibleForAnimation = this.makeInvisibleForAnimation.bind(this);
        this.parentNodeForPosition = this.parentNodeForPosition.bind(this);
        this.setToParentNodePosition = this.setToParentNodePosition.bind(this);

        this.setAnimationDurationPercentage = this.setAnimationDurationPercentage.bind(this);

        // performance optimization stuff;
        this.redraw = this.redraw.bind(this);

        // some helper functions; [ensures that status values are correctly set!]
        this.setStatusLeafNode = this.setStatusLeafNode.bind(this);
    }

    setAnimationDurationPercentage(val) {
        this.percentModifier = val;
    }

    setToParentNodePosition() {
        if (this._parentNodeForPosition) {
            this.x = this._parentNodeForPosition.x;
            this.y = this._parentNodeForPosition.y;
        }
    }

    parentNodeForPosition(node) {
        this._parentNodeForPosition = node;
    }

    setStatusLeafNode() {
        this.status = 'leafNode';
        this.isLiteralItem = true;
    }

    // redraw function for better performance;
    redraw() {
        this.removeAllRenderedElementsFromParent();
        this.render(this.svgRoot);
    }

    makeInvisibleForAnimation() {
        this.svgRoot.classed('hidden', true);
        this.incommingLink.forEach(incLink => {
            incLink.makeInvisibleForAnimation();
        });
    }

    collapseButton_mouseHoverIn() {
        this.mouseHoverIn();
        this.circ.classed('collapseExpandButtonHovered', true);
    }

    collapseButton_mouseHoverOut() {
        this.mouseHoverOut();
        this.circ.classed('collapseExpandButtonHovered', false);
    }

    addHoverCollapseExpandButton() {
        if (this.collapseExapandGroup) {
            this.collapseExapandGroup.classed('hidden', false);
        } else {
            const that = this;
            this.collapseExapandGroup = this.svgRoot.append('g');
            this.circ = this.collapseExapandGroup.append('circle');

            const radius = 15;
            this.circ.attr('r', radius);
            this.circ.attr('cx', Math.sqrt(50 * 25));
            this.circ.attr('cy', -Math.sqrt(50 * 25));
            this.circ.classed('collapseExpandButton', true);

            // add its hoverActions;
            this.collapseExapandGroup.on('mouseover', this.collapseButton_mouseHoverIn);
            this.collapseExapandGroup.on('mouseout', this.collapseButton_mouseHoverOut);
            switch (this.status) {
                case 'unknown':
                    this.collapseExapandGroup.append('title').text('explore element');
                    // create icon for that;
                    const icon = this.collapseExapandGroup.append('path');
                    icon.attr('id', 'searchIcon');
                    icon.style('fill', '#000');
                    icon.style('stroke-width', '0');
                    icon.attr(
                        'd',
                        'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z'
                    );
                    icon.attr('transform', 'translate(24,-48)');

                    this.collapseExapandGroup.on('click', function() {
                        that.graph.singleNodeExploration(that);
                    });

                    break;
                case 'collapsed':
                    this.collapseExapandGroup.append('title').text('expand node');
                    this.collapseExapandGroup
                        .append('polygon')
                        .attr('points', '15.5,5 11,5 16,12 11,19 15.5,19 20.5,12 ')
                        .attr('transform', 'translate(25,-48)');
                    this.collapseExapandGroup
                        .append('polygon')
                        .attr('points', '8.5,5 4,5 9,12 4,19 8.5,19 13.5,12 ')
                        .attr('transform', 'translate(25,-48)');

                    this.collapseExapandGroup.on('click', function() {
                        that.graph.singleNodeExpansion(that);
                    });
                    break;
                case 'expanded':
                    this.collapseExapandGroup.append('title').text('collapse node');

                    this.collapseExapandGroup
                        .append('polygon')
                        .attr('points', '15.5,5 11,5 16,12 11,19 15.5,19 20.5,12 ')
                        .attr('transform', 'translate(47,-48), scale(-1,1)');
                    this.collapseExapandGroup
                        .append('polygon')
                        .attr('points', '8.5,5 4,5 9,12 4,19 8.5,19 13.5,12 ')
                        .attr('transform', 'translate(47,-48), scale(-1,1)');

                    this.collapseExapandGroup.on('click', function() {
                        that.graph.planCollapseOperations(that);
                    });
                    break;
                default:
                    console.log('leaf node should not have hovers');
            }
        }
    }

    removeHoverCollapseExpandButton() {
        if (this.collapseExapandGroup) {
            this.collapseExapandGroup.classed('hidden', true);
        }
    }

    resourceId(val) {
        if (!arguments.length) {
            return this._resourceId;
        } else {
            this._resourceId = val;
        }
    }

    setExploreAnimation(val) {
        if (val === true) {
            const renderingGroup = this.svgRoot;
            this.renderingAnimationGroup = renderingGroup.append('rect');
            const radius = 43;
            this.renderingAnimationGroup.attr('x', -radius);
            this.renderingAnimationGroup.attr('y', -radius);
            this.renderingAnimationGroup.attr('width', 2 * radius);
            this.renderingAnimationGroup.attr('height', 2 * radius);
            this.renderingAnimationGroup.attr('rx', radius);
            this.renderingAnimationGroup.attr('ry', radius);

            this.renderingAnimationGroup.style('stroke-width', '7px');
            this.renderingAnimationGroup.classed('loadingAnimation', true);
        } else {
            if (this.renderingAnimationGroup) {
                this.renderingAnimationGroup.remove();
            }
        }
    }

    setGraph(g) {
        this.graph = g;
    }

    startLayoutTransition(collapse = false, id, max, callback) {
        // get old value
        let duration = this.defaultDuration * this.percentModifier;
        if (isNaN(duration)) {
            duration = 400;
        }

        const f_x = parseInt(this.x);
        const f_y = parseInt(this.y);
        const that = this;
        let notHidden = false;

        that.svgRoot
            .transition()
            .tween('attr.translate', function() {
                return function(t) {
                    const tr = d3.transform(that.svgRoot.attr('transform'));
                    that.x = tr.translate[0];
                    that.y = tr.translate[1];
                    that.px = that.x;
                    that.py = that.y;

                    that.linkElements.forEach(link => {
                        link.updateDrawPosition();
                    });

                    if (collapse === true && t > 0.85 && notHidden === false) {
                        if (!that.visible()) {
                            that.makeInvisibleForAnimation();
                            that.outgoingLink.forEach(item => {
                                if (item.visible()) {
                                    item.makeInvisibleForAnimation();
                                }
                            });
                        }
                        notHidden = true;
                    }
                };
            })
            .duration(duration)
            .each('end', function() {
                if (callback && id === max) {
                    callback();
                }
            })
            .attr('transform', 'translate(' + f_x + ',' + f_y + ')');
    }

    filterCollapsedLinks() {
        const linksToDraw = [];
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

    updateDrawPosition = function() {
        if (this.svgRoot) {
            this.svgRoot.attr('transform', 'translate(' + this.x + ',' + this.y + ')');
            this.linkElements.forEach(link => {
                link.updateDrawPosition();
            });
        }
    };

    getRadius = function() {
        if (this.shapeRadius) {
            return this.shapeRadius;
        }
        return parseInt(this.configObject.radius);
    };

    getRenderingShape = function() {
        return this.renderingElement;
    };

    addStackedView() {
        this.stackViewGroup = this.svgRoot.append('g');
        DrawTools().renderStackedItems(this.stackViewGroup, this.configObject, this);
    }

    render(parentNode) {
        this.svgRoot = parentNode;

        if (this.isLiteralItem) {
            this.setStatusLeafNode();
        }

        if (this.collapseExapandGroup) {
            this.collapseExapandGroup.remove();
            this.collapseExapandGroup = undefined;
        }

        if (this.stackViewGroup) {
            this.stackViewGroup.remove();
            this.stackViewGroup = undefined;
        }
        if (this.status === 'collapsed') {
            //   add stacked view;
            this.addStackedView();
        }
        super.render(parentNode);

        if (this.iconElement) {
            this.iconElement.remove(); // clear previous rendering element
            this.iconElement.parentSvgRoot = this.svgRoot;
            const iconDef = this.iconElement.drawIcon();
            if (iconDef.textTransform) {
                for (const name in iconDef.textTransform) {
                    if (iconDef.textTransform.hasOwnProperty(name) && this.renderingText) {
                        this.renderingText.attr(name, iconDef.textTransform[name]);
                    }
                }
            }
        }

        this.addHoverEvents();
        if (this.type() === 'resource') {
            this.addDoubleClickAction();
            if (this.status !== 'leafNode') {
                this.addHoverCollapseExpandButton();
            }
        }
    }

    addDoubleClickAction = function() {
        const that = this;
        that.svgRoot.on('dblclick', function() {
            d3.event.stopPropagation();

            if (that._resourceId !== 'unknown') {
                switch (that.status) {
                    case 'unknown':
                        that.graph.singleNodeExploration(that, true);
                        break;
                    case 'expanded':
                        that.graph.planCollapseOperations(that);
                        break;
                    case 'collapsed':
                        that.graph.singleNodeExpansion(that);
                        break;
                    default:
                }
            }
        });
    };
} // end of class definition
