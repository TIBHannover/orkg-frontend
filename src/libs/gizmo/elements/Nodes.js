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

        this.collapseThisNode = this.collapseThisNode.bind(this);

        // performance optimization stuff;
        this.redraw = this.redraw.bind(this);

        // some helper functions; [ensures that status values are correctly set!]
        this.setStatusLeafNode = this.setStatusLeafNode.bind(this);
    }

    collapseThisNode() {
        this.graph.collapseThisNodeToParent(this);
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

    mouseHoverIn = () => {
        super.mouseHoverIn();
        if (this.singleCollapseGroup) {
            this.singleCollapseGroup.classed('hidden', false);
        }
    };

    mouseHoverOut = () => {
        super.mouseHoverOut();
        if (this.singleCollapseGroup) {
            this.singleCollapseGroup.classed('hidden', true);
        }
    };

    collapseButton_mouseHoverIn() {
        this.mouseHoverIn();
        this.circ.classed('collapseExpandButtonHovered', true);
    }

    collapseButton_mouseHoverOut() {
        this.mouseHoverOut();
        this.circ.classed('collapseExpandButtonHovered', false);
    }

    singleCollapseButton_mouseHoverIn = () => {
        this.mouseHoverIn();
        this.singleCirc.classed('collapseExpandButtonHovered', true);
    };

    singleCollapseButton_mouseHoverOut = () => {
        this.mouseHoverOut();
        this.singleCirc.classed('collapseExpandButtonHovered', false);
    };

    addSingleCollapseHoverButton() {
        const that = this;
        if (this.singleCollapseGroup) {
            this.singleCollapseGroup.class('hidden', true);
        } else {
            // create the hover thing;
            const offsetX = Math.sqrt(50 * 25);

            this.singleCollapseGroup = this.svgRoot.append('g');
            this.singleCirc = this.singleCollapseGroup.append('circle');
            const radius = 15;
            this.singleCirc.attr('r', radius);
            this.singleCirc.attr('cx', -offsetX);
            this.singleCirc.attr('cy', offsetX);
            this.singleCirc.classed('collapseExpandButton', true);
            this.singleCollapseGroup.on('mouseover', this.singleCollapseButton_mouseHoverIn);
            this.singleCollapseGroup.on('mouseout', this.singleCollapseButton_mouseHoverOut);
            this.singleCollapseGroup
                .append('path')
                .attr(
                    'd',
                    'M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z'
                )
                .attr('transform', 'translate(-45,28), scale(0.03,0.03)');

            this.singleCollapseGroup.classed('hidden', true);
            if (this.type() === 'literal') {
                const shape = this.getExpectedShapeSize(this.renderConfig);
                let width = shape.w;
                if (this.getRenderingShape()) {
                    width = this.getRenderingShape().attr('width');
                }
                // push back to origin;
                this.singleCollapseGroup.attr('cx', -Math.sqrt(50 * 25));
                this.singleCollapseGroup.attr('transform', 'translate(' + (offsetX - 15 - 0.5 * width) + ',' + -offsetX + ')');
            }
            this.singleCollapseGroup.on('click', function() {
                that.collapseThisNode();
            });
        }
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

        if (this.singleCollapseGroup) {
            this.singleCollapseGroup.remove();
            this.singleCollapseGroup = undefined;
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

        if (this.incommingLink.length > 0) {
            // make sure the root not can not be single collapsed;
            this.addSingleCollapseHoverButton();
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
