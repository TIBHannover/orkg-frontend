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
        this.resetRendering = this.resetRendering.bind(this);

        this.zoomed = this.zoomed.bind(this);
        this.zoomToExtent = this.zoomToExtent.bind(this);

        this.clearData = this.clearData.bind(this);

        // helper functions
        this.waitForForce = this.waitForForce.bind(this);
        this.transform = this.transform.bind(this);
        this.getWorldPosFromScreen = this.getWorldPosFromScreen.bind(this);

        this.intervalTimer = null;
        this.intervalWaiter = this.intervalWaiter.bind(this);
        this.clearIterativeWaiter = this.clearIterativeWaiter.bind(this);
        this.stopBackgroundProcesses = this.stopBackgroundProcesses.bind(this);

        this.releaseMutex = this.releaseMutex.bind(this);
        this.interuppted = false;
    }

    stopBackgroundProcesses() {
        this.interuppted = true;
        this.clearIterativeWaiter();
    }

    releaseMutex() {
        this.interuppted = false;
    }

    resetRendering() {
        const backupZ = this.zoomFactor;
        const backupT = this.graphTranslation;
        this.initializeRendering();
        this.zoomFactor = backupZ;
        this.graphTranslation = backupT;

        if (this.zoom) {
            this.graph.graphRoot.attr('transform', `translate(${this.graphTranslation})scale(${this.zoomFactor})`);
            this.zoom.translate(this.graphTranslation);
            this.zoom.scale(this.zoomFactor);
        }
    }

    clearIterativeWaiter() {
        if (this.intervalTimer) {
            clearInterval(this.intervalTimer);
        }
    }

    intervalWaiter(interval) {
        if (this.graph && this.graph.layout && this.graph.layout.force) {
            const { force } = this.graph.layout;
            if (force.alpha() < 0.05) {
                // remove timer and zoom to extent;
                clearInterval(this.intervalTimer);
                if (!this.interuppted) {
                    // call this function as long you have not been interrupted
                    this.zoomToExtent(false);
                }

                return;
            }
            this.intervalTimer = setTimeout(this.intervalWaiter, interval);
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
        const { graph } = this;
        const that = this;

        this.dragBehaviour = d3.behavior
            .drag()
            .origin(d => d)
            .on('dragstart', d => {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                d.fixed = true;
            })
            .on('drag', d => {
                d3.event.sourceEvent.stopPropagation(); // Prevent panning
                d.setPosition(d3.event.x, d3.event.y);
                d.px = d3.event.x;
                d.py = d3.event.y;
                // if (!forcePaused) {
                if (graph.layout.layoutType() === 'force') {
                    graph.layout.resumeForce();
                }
                d.updateDrawPosition();
            })
            .on('dragend', d => {
                if (graph.layout.layoutType() === 'force') {
                    graph.layout.resumeForce();
                }
                d.fixed = false;
            });

        // Apply the zooming factor.
        this.zoom = d3.behavior
            .zoom()
            .duration(150)
            .scaleExtent([0.02, 5])
            .on('zoom', that.zoomed)
            .on('zoomstart', () => {
                if (d3.event.sourceEvent && d3.event.sourceEvent.buttons && d3.event.sourceEvent.buttons === 1) {
                    graph.svgRoot.style('cursor', 'move');
                }
            })
            .on('zoomend', () => {
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
        const { graph } = that;
        const graphContainer = graph.graphRoot;
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
            graphContainer.attr('transform', `translate(${that.graphTranslation})scale(${that.zoomFactor})`);
            graph.updateHaloRadius();
            return;
        }
        /** animate the transition * */
        this.zoomFactor = d3.event.scale;
        this.graphTranslation = d3.event.translate;
        graphContainer
            .transition()
            .tween(
                'attr.translate',
                () =>
                    function () {
                        that.transformAnimation = true;
                        const tr = d3.transform(graphContainer.attr('transform'));
                        that.graphTranslation[0] = tr.translate[0];
                        that.graphTranslation[1] = tr.translate[1];
                        that.zoomFactor = tr.scale[0];
                        graph.updateHaloRadius();
                    },
            )
            .each('end', () => {
                that.transformAnimation = false;
                that.graph.updateHaloRadius();
            })
            .attr('transform', `translate(${that.graphTranslation})scale(${that.zoomFactor})`)
            .ease('linear')
            .duration(250);
    }

    zoomToExtent(awaitForceStable) {
        if (awaitForceStable) {
            this.waitForForce();
            return;
        }
        // save some vars
        const { graph } = this;
        const that = this;

        // get the rendering dom elements
        const bbox = graph.graphRoot.node().getBoundingClientRect();
        const svgBbox = graph.svgRoot.node().getBoundingClientRect();

        // get the graph coordinates
        const bboxOffset = 20; // default radius of a node;
        const topLeft = this.getWorldPosFromScreen(bbox.left - svgBbox.left, bbox.top - svgBbox.top, that.graphTranslation, that.zoomFactor);
        const botRight = this.getWorldPosFromScreen(bbox.right - svgBbox.left, bbox.bottom - svgBbox.top, that.graphTranslation, that.zoomFactor);

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
        let newZoomFactor;
        // get the smaller one
        const a = w / g_w;
        const b = h / g_h;
        if (a <= b) {
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

        const cp = this.getWorldPosFromScreen(cx, cy, this.graphTranslation, this.zoomFactor);

        // apply Zooming
        const sP = [cp.x, cp.y, h / that.zoomFactor];
        const eP = [posX, posY, h / newZoomFactor];

        // interpolation function
        const pos_interpolation = d3.interpolateZoom(sP, eP);

        let lenAnimation = pos_interpolation.duration;
        if (lenAnimation > 2500) {
            // fix duration to be max 2.5 sec
            lenAnimation = 2500;
        }

        // apply the interpolation
        graph.graphRoot
            .attr('transform', that.transform(sP, cx, cy, that))
            .transition()
            .duration(lenAnimation)
            .attrTween(
                'transform',
                () =>
                    function (t) {
                        graph.updateHaloRadius();
                        return that.transform(pos_interpolation(t), cx, cy, that);
                    },
            )
            .each('end', () => {
                if (that.zoom) {
                    graph.graphRoot.attr('transform', `translate(${that.graphTranslation})scale(${that.zoomFactor})`);
                    that.zoom.translate(that.graphTranslation);
                    that.zoom.scale(that.zoomFactor);
                }
            });
    }

    zoomToNode = node => {
        const { graph } = this;
        const that = this;
        const svgBbox = graph.svgRoot.node().getBoundingClientRect();

        const w = svgBbox.width;
        const h = svgBbox.height;

        const defaultZoom = 0.8;
        const defaultTargetZoom = 0.7;
        const cx = 0.5 * w;
        const cy = 0.5 * h;
        const cp = this.getWorldPosFromScreen(cx, cy, this.graphTranslation, this.zoomFactor);
        const sP = [cp.x, cp.y, h / this.zoomFactor];
        const zoomLevel = Math.max(defaultZoom + 0.5 * defaultZoom, defaultTargetZoom);
        const eP = [node.x, node.y, h / zoomLevel];
        const pos_intp = d3.interpolateZoom(sP, eP);

        let lenAnimation = pos_intp.duration;
        if (lenAnimation > 2500) {
            lenAnimation = 2500;
        }

        graph.graphRoot
            .attr('transform', that.transform(sP, cx, cy, that))
            .transition()
            .duration(lenAnimation)
            .attrTween(
                'transform',
                () =>
                    function (t) {
                        that.graph.updateHaloRadius();
                        return that.transform(pos_intp(t), cx, cy, that);
                    },
            )
            .each('end', () => {
                graph.graphRoot.attr('transform', `translate(${that.graphTranslation})scale(${that.zoomFactor})`);
                that.zoom.translate(that.graphTranslation);
                that.zoom.scale(that.zoomFactor);
                graph.updateHaloRadius();
            });
    };

    /** Helper functions * */
    getWorldPosFromScreen(x, y, translate, scale) {
        // have to check if scale is array or value >> temp variable
        const temp = scale[0];
        let xn;
        let yn;
        if (temp) {
            xn = (x - translate[0]) / temp;
            yn = (y - translate[1]) / temp;
        } else {
            xn = (x - translate[0]) / scale;
            yn = (y - translate[1]) / scale;
        }
        return { x: xn, y: yn };
    }

    getScreenCoords = (x, y) => ({ x: this.graphTranslation[0] + x * this.zoomFactor, y: this.graphTranslation[1] + y * this.zoomFactor });

    transform(p, cx, cy, parent) {
        if (parent && parent.graph) {
            // one iteration step for the locate target animation
            parent.zoomFactor = parent.graph.svgRoot.node().getBoundingClientRect().height / p[2];
            parent.graphTranslation = [cx - p[0] * parent.zoomFactor, cy - p[1] * parent.zoomFactor];
            parent.zoom.translate(parent.graphTranslation);
            parent.zoom.scale(parent.zoomFactor);
            return `translate(${parent.graphTranslation})scale(${parent.zoomFactor})`;
        }
    }
} // end of class definition
