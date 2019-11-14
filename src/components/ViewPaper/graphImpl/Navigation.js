import * as d3 from 'd3';

export default class Navigation {
    constructor(props) {
        this.graph = props.graph;
        this.layout = props.graph.layout;

        // variables;
        this.dragBehaviour = undefined;
        this.zoom = undefined;

        this.graphTranslation = [0, 0];
        this.zoomFactor = 1.0;

        this.getDragBehaviour = this.getDragBehaviour.bind(this);
        this.getZoomFunction = this.getZoomFunction.bind(this);
        this.initializeRendering = this.initializeRendering.bind(this);

        this.zoomed = this.zoomed.bind(this);
        this.zoomToExtent = this.zoomToExtent.bind(this);

        this.clearData = this.clearData.bind(this);

        //helper functions
        this.waitForForce = this.waitForForce.bind(this);
        this.transform = this.transform.bind(this);
        this.getWorldPosFromScreen = this.getWorldPosFromScreen.bind(this);

        this.intervalTimer = null;
        this.intervalWaiter = this.intervalWaiter.bind(this);
        this.clearIterativeWaiter = this.clearIterativeWaiter.bind(this);
    }

    clearIterativeWaiter() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }
    }

    intervalWaiter(interval) {
        if (this.graph && this.graph.layout && this.graph.layout.force) {
            const force = this.graph.layout.force;
            if (force.alpha() < 0.05) {
                // remove timer and zoom to extent;
                clearInterval(this.intervalTimer);
                this.zoomToExtent(false);
                return;
            }
            this.intervalTimer = setTimeout(this.intervalWaiter, interval)
        }
    }

    waitForForce() {
        if (this.graph.layout.layoutType() === 'force') {
            this.intervalWaiter(500); // gives as argument the interval in ms to wait
        } else {
            this.zoomToExtent(false);
        }
    }

    clearData() {
        delete this.dragBehaviour;
        delete this.zoom;
        delete this.graph;
        delete this.layout;
    }

    getDragBehaviour() {
        return this.dragBehaviour;
    }

    getZoomFunction() {
        return this.zoom;
    }

    initializeRendering() {
        let graph = this.graph;
        let that = this;

        this.dragBehaviour = d3.behavior.drag()
            .origin(function (d) {
                return d;
            })
            .on('dragstart', function (d) {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                d.fixed = true;
            })
            .on('drag', function (d) {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                d.setPosition(d3.event.x, d3.event.y);
                d.px = d3.event.x;
                d.py = d3.event.y;
                // if (!forcePaused) {
                if (graph.layout.layoutType() === 'force') {
                    graph.layout.resumeForce()

                }
                d.updateDrawPosition();
            })
            .on('dragend', function (d) {
                if (graph.layout.layoutType() === 'force') {
                    graph.layout.resumeForce()

                }
                d.fixed = false;
            });

        // Apply the zooming factor.
        this.zoom = d3.behavior.zoom()
            .duration(150)
            .scaleExtent([0.02, 5])
            .on('zoom', that.zoomed)
            .on('zoomstart', function () {

                if (d3.event.sourceEvent && d3.event.sourceEvent.buttons && d3.event.sourceEvent.buttons === 1) {
                    graph.svgRoot.style('cursor', 'move');
                }
            })
            .on('zoomend', function () {
                graph.svgRoot.style('cursor', 'auto');
                // save the graph values;
                const t = d3.transform(graph.graphRoot.attr('transform'));
                that.graphTranslation[0] = t.translate[0];
                that.graphTranslation[1] = t.translate[1];
                that.zoomFactor = t.scale[0];
            });
        graph.svgRoot.call(that.zoom);
        that.zoom = that.zoom.scaleExtent([0.02, 5]);
        if (graph.graphRoot) {
            that.zoom.event(graph.graphRoot);
        }
    }

    zoomed() {
        const that = this;
        const graph = that.graph;
        let graphContainer = graph.graphRoot;
        let zoomEventByMWheel = false;
        if (d3.event.sourceEvent) {
            if (d3.event.sourceEvent.deltaY) {
                zoomEventByMWheel = true;
            }
        }
        if (zoomEventByMWheel === false) {
            if (that.transformAnimation === true) {
                return;
            }
            that.zoomFactor = d3.event.scale;
            that.graphTranslation = d3.event.translate;
            graphContainer.attr('transform', 'translate(' + that.graphTranslation + ')scale(' + that.zoomFactor + ')');
            return;
        }
        /** animate the transition **/
        this.zoomFactor = d3.event.scale;
        this.graphTranslation = d3.event.translate;
        graphContainer.transition()
            .tween('attr.translate', function () {
                return function () {
                    that.transformAnimation = true;
                    let tr = d3.transform(graphContainer.attr('transform'));
                    that.graphTranslation[0] = tr.translate[0];
                    that.graphTranslation[1] = tr.translate[1];
                    that.zoomFactor = tr.scale[0];
                };
            })
            .each('end', function () {
                that.transformAnimation = false;
            })
            .attr('transform', 'translate(' + that.graphTranslation + ')scale(' + that.zoomFactor + ')')
            .ease('linear')
            .duration(250);
    }

    zoomToExtent(awaitForceStable) {
        if (awaitForceStable) {
            this.waitForForce();
            return;
        }
        // save some vars
        const graph = this.graph;
        const that = this;

        // get the rendering dom elements
        const bbox = graph.graphRoot.node().getBoundingClientRect();
        const svgBbox = graph.svgRoot.node().getBoundingClientRect();

        // get the graph coordinates
        const bboxOffset = 20; // default radius of a node;
        let topLeft = this.getWorldPosFromScreen(bbox.left - svgBbox.left, bbox.top - svgBbox.top, that.graphTranslation, that.zoomFactor);
        let botRight = this.getWorldPosFromScreen(bbox.right - svgBbox.left, bbox.bottom - svgBbox.top, that.graphTranslation, that.zoomFactor);

        // get svg size;
        const w = svgBbox.width;
        const h = svgBbox.height;

        // reduce the graph viewport by bboxOffset ; >> used for scaleFactor computations
        topLeft.x += bboxOffset;
        topLeft.y -= bboxOffset;
        botRight.x -= bboxOffset;
        botRight.y += bboxOffset;

        // gets the graph viewport size
        const g_w = botRight.x - topLeft.x;
        const g_h = botRight.y - topLeft.y;

        // position in word coords where we want to zoom to;
        const posX = 0.5 * (topLeft.x + botRight.x);
        const posY = 0.5 * (topLeft.y + botRight.y);

        // zoom factor calculations and fail safes;
        let newZoomFactor = 1.0; // fail save if graph and window are squares
        //get the smaller one
        let a = w / g_w;
        let b = h / g_h;
        if (a < b) {
            newZoomFactor = a;
        } else {
            newZoomFactor = b;
        }
        // fail saves
        if (newZoomFactor > that.zoom.scaleExtent()[1]) {
            newZoomFactor = that.zoom.scaleExtent()[1];
        }
        if (newZoomFactor < that.zoom.scaleExtent()[0]) {
            newZoomFactor = that.zoom.scaleExtent()[0];
        }

        // center point of the svg element
        const cx = 0.5 * w;
        const cy = 0.5 * h;

        let cp = this.getWorldPosFromScreen(cx, cy, this.graphTranslation, this.zoomFactor);

        // apply Zooming
        const sP = [cp.x, cp.y, h / that.zoomFactor];
        const eP = [posX, posY, h / newZoomFactor];

        // interpolation function
        let pos_interpolation = d3.interpolateZoom(sP, eP);

        let lenAnimation = pos_interpolation.duration;
        if (lenAnimation > 2500) { // fix duration to be max 2.5 sec
            lenAnimation = 2500;
        }

        // apply the interpolation
        graph.graphRoot.attr('transform', that.transform(sP, cx, cy, that))
            .transition()
            .duration(lenAnimation)
            .attrTween('transform', function () {
                return function (t) {
                    return that.transform(pos_interpolation(t), cx, cy, that);
                };
            })
            .each('end', function () {
                graph.graphRoot.attr('transform', 'translate(' + that.graphTranslation + ')scale(' + that.zoomFactor + ')');
                that.zoom.translate(that.graphTranslation);
                that.zoom.scale(that.zoomFactor);
            });
    }

    /** Helper functions **/
    getWorldPosFromScreen(x, y, translate, scale) {
        // have to check if scale is array or value >> temp variable
        let temp = scale[0], xn, yn;
        if (temp) {
            xn = (x - translate[0]) / temp;
            yn = (y - translate[1]) / temp;
        } else {
            xn = (x - translate[0]) / scale;
            yn = (y - translate[1]) / scale;
        }
        return {x: xn, y: yn};
    }

    transform(p, cx, cy, parent) {
        // one iteration step for the locate target animation
        parent.zoomFactor = parent.graph.svgRoot.node().getBoundingClientRect().height / p[2];
        parent.graphTranslation = [(cx - p[0] * parent.zoomFactor), (cy - p[1] * parent.zoomFactor)];
        parent.zoom.translate(parent.graphTranslation);
        parent.zoom.scale(parent.zoomFactor);
        return 'translate(' + parent.graphTranslation[0] + ',' + parent.graphTranslation[1] + ')scale(' + parent.zoomFactor + ')';
    }
} // end of class definition
