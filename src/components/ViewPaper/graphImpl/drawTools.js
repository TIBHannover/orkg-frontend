import * as d3 from 'd3';

export default function DrawTools() {
    let dt = {};
    dt.drawElement = drawElement;
    dt.measureTextWidth = measureTextWidth;
    dt.drawLinkElement = drawLinkElement;
    dt.computeIntersectionPointsForMLP = computeIntersectionPointsForMLP;
    dt.drawArrowHead = drawArrowHead;
    dt.angle2NormedVec = angle2NormedVec;
    dt.angleFromVector = angleFromVector;
    dt.cropTextIfNeeded = cropTextIfNeeded;
    return dt;
}


function cropTextIfNeeded(node, config, labelText) {

    if (config.fontSizeOverWritesShapeSize === false) {
        return labelText;
    } else {
        // identify the shape size
        let result = labelText;
        const shapeSize = node.getExpectedShapeSize(config);
        if (config.renderingType === 'circle') { // use radius
            result = cropText(labelText, config, Math.min(1.9 * shapeSize.r));
        }
        if (config.renderingType === 'rect') { // use width
            result = cropText(labelText, config, Math.min(shapeSize.w, 250));
        }
        return result;
    }
}

function cropText(input, config, width) {
    let truncatedText = input;
    let textWidth;
    let ratio;
    let newTruncatedTextLength;
    while (true) {
        textWidth = measureTextWidth(truncatedText, config.fontFamily, config.fontSize);
        if (textWidth <= width) {
            break;
        }
        ratio = textWidth / width;
        newTruncatedTextLength = Math.floor(truncatedText.length / ratio);
        if (truncatedText.length === newTruncatedTextLength) {
            break;
        }
        truncatedText = truncatedText.substring(0, newTruncatedTextLength);
    }
    if (input.length > truncatedText.length) {
        return input.substring(0, truncatedText.length - 6) + '...';
    }
    return input;
}

function angleFromVector(vx, vy) {
    const len = Math.sqrt(vx * vx + vy * vy);
    const nx = vx / len;
    const ny = vy / len;
    let angle = Math.atan2(-ny, nx) * 180 / Math.PI;
    if (angle < 0) {
        angle += 360;
    }
    return angle;
}

function angle2NormedVec(angle) {
    const xn = Math.cos(angle * Math.PI / 180);
    const yn = Math.sin(angle * Math.PI / 180);
    return {x: xn, y: -yn}
}

function drawArrowHead(parent, container, identifier, configObject) {

    if (configObject.link_arrowHead === 'true') {
        let v1, v2, v3, v4;
        const scale = configObject.link_arrowHead_scaleFactor;
        v1 = scale * -14;
        v2 = scale * -10;
        v3 = scale * 28;
        v4 = scale * 20;

        const vB_String = v1 + ' ' + v2 + ' ' + v3 + ' ' + v4;
        const arrowHead = container.append('marker')
            .attr('id', identifier)
            .attr('viewBox', vB_String)
            .attr('markerWidth', scale * 10)
            .attr('markerHeight', scale * 10)
            .attr('orient', 'auto');

        parent.attr('marker-end', 'url(#' + identifier + ')');

        let m1X = -12 * scale;
        let m1Y = 8 * scale;
        let m2X = -12 * scale;
        let m2Y = -8 * scale;
        let renderingShape = arrowHead.append('path');
        renderingShape.attr('d', 'M0,0L ' + m1X + ',' + m1Y + 'L' + m2X + ',' + m2Y + 'L' + 0 + ',' + 0);
        addStrokeElements(renderingShape, configObject, 'link_arrowHead_stroke');
        return [arrowHead, renderingShape];
    }
}

function addStrokeElements(element, cfg, selector) {

    const color = cfg[selector + 'Color'];
    const width = cfg[selector + 'Width'];
    const style = cfg[selector + 'Style'];

    element.style('stroke', color);
    element.style('stroke-width', width);
    if (style !== 'solid') {
        if (style === 'dashed') {
            element.style('stroke-dasharray', 8);
        }
        if (style === 'dotted') {
            element.style('stroke-dasharray', 3);
        }
    }
}

function renderBaseShape(cfg, pNode, renderingShape) {
    let radius = parseInt(cfg.radius);
    let width = parseInt(cfg.width);
    let height = parseInt(cfg.height);

    if (pNode) {
        const shapeObj = pNode.getExpectedShapeSize(cfg);
        radius = shapeObj.r;
        width = shapeObj.w;
        height = shapeObj.h;
    }

    // fix max width of element :
    width = Math.min(width, 250);
    // check if is uml style << TODO;
    /**  render a pure circle **/
    if (cfg.renderingType === 'circle') {
        renderingShape.attr('x', -radius);
        renderingShape.attr('y', -radius);
        renderingShape.attr('width', 2 * radius);
        renderingShape.attr('height', 2 * radius);
        renderingShape.attr('rx', radius);
        renderingShape.attr('ry', radius);
    }

    /**  render a rectangle with possible rounded corners provided by config **/
    if (cfg.renderingType === 'rect') {
        renderingShape.attr('x', -0.5 * width);
        renderingShape.attr('y', -0.5 * height);
        renderingShape.attr('width', width);
        renderingShape.attr('height', height);
        if (cfg.roundedCorner) {
            const tok = cfg.roundedCorner.split(',');
            renderingShape.attr('rx', parseFloat(tok[0]));
            renderingShape.attr('ry', parseFloat(tok[1]));
        }
    }

    /**  render an ellipse **/
    if (cfg.renderingType === 'ellipse') {
        renderingShape.attr('x', -0.5 * width);
        renderingShape.attr('y', -0.5 * height);
        renderingShape.attr('width', width);
        renderingShape.attr('height', height);
        renderingShape.attr('rx', width);
        renderingShape.attr('ry', height);
    }

    /** apply stroke and fill colors as addition stroke style related parameters **/
    renderingShape.attr('fill', cfg.bgColor);
    if (cfg.strokeElement === true || cfg.strokeElement === 'true') {
        addStrokeElements(renderingShape, cfg, 'stroke');
    }
}

function drawElement(pGroup, cfg, pNode) {
    if (cfg.renderingType === 'umlStyle') { // currently ignored for beta release
        let uml_renderingShape = pGroup.append('rect');
        renderBaseShape(cfg.renderingAttributes, pNode, uml_renderingShape);
        let linksToDraw = pNode.filterCollapsedLinks();
        console.log(linksToDraw);
        return uml_renderingShape;
    } else { // currently always native node-link visualization
        let renderingShape = pGroup.append('rect');
        renderBaseShape(cfg, pNode, renderingShape);
        return renderingShape
    }
}

function drawLinkElement(parentGroup, configObject) {
    let renderingShape;
    if (configObject.link_strokeWidth) {
        renderingShape = parentGroup.append('path');
        // renderingShape = parentGroup.append(configObject.link_renderingType);
        addStrokeElements(renderingShape, configObject, 'link_stroke');
    } else {
        renderingShape = parentGroup.append('path');
        renderingShape.style('stroke', '#000000');
        renderingShape.style('stroke-width', '2px');
    }
    renderingShape.style('fill', 'none');
    return renderingShape;
}


function measureTextWidth(text, fontFamily, fontSize) {
    let d = d3.select('body').append('text');
    d.attr('id', 'width-test');
    d.attr('style', 'position:absolute; float:left; white-space:nowrap; font-family:' + fontFamily + ';font-size: ' + fontSize);

    d.text(text);
    let w = document.getElementById('width-test').offsetWidth;
    d.remove();
    return w;
}

function computeIntersectionPointsForMLP(domain, property, range, offset) {
    let distOffset = 0;
    if (offset) {
        distOffset = offset;
    }

    let iP = {x1: domain.x, y1: domain.y, x2: range.x, y2: range.y};

    let dom_cfgObj = domain.getConfigObj();
    let ran_cfgObj = range.getConfigObj();

    let offsetDirection = computeNormalizedOffsetDirection(domain, range);
    const p1 = shapeBasedIntersectionPoint(dom_cfgObj, domain, offsetDirection, distOffset);

    offsetDirection = computeNormalizedOffsetDirection(range, domain);
    const p2 = shapeBasedIntersectionPoint(ran_cfgObj, range, offsetDirection, distOffset, p1);

    // set the positions into the intersection point
    iP.x1 = p1.x;
    iP.y1 = p1.y;
    iP.x2 = p2.x;
    iP.y2 = p2.y;

    return iP;
}


function computeNormalizedOffsetDirection(source, target) {
    const x = target.x - source.x;
    const y = target.y - source.y;
    const len = Math.sqrt(x * x + y * y);
    return {x: x / len, y: y / len};
}

function shapeBasedIntersectionPoint(config, element, offsetDirection, distOffset, origin) {
    let IntPoint = {};

    if (config.renderingType === 'circle') {
        let distanceToBorder = parseInt(element.getRadius()) + distOffset;
        IntPoint.x = element.x + (distanceToBorder * offsetDirection.x);
        IntPoint.y = element.y + (distanceToBorder * offsetDirection.y);
        return IntPoint;
    }

    let distanceToBorderX, distanceToBorderY;
    // TODO: Used for later GizMO elements;
    // if (config.renderingType === 'ellipse') {
    //
    //     distX = element.getRenderingShape().attr('width');
    //     distY = element.getRenderingShape().attr('height');
    //
    //     distanceToBorderX = 0.5 * parseFloat(distX);
    //     distanceToBorderY = 0.5 * parseFloat(distY);
    //
    //     IntPoint.x = element.x + (distanceToBorderX * offsetDirection.x);
    //     IntPoint.y = element.y + (distanceToBorderY * offsetDirection.y);
    // }

    if (config.renderingType === 'rect') {
        const shape = element.getExpectedShapeSize(config, true);


        let width = Math.min(shape.w, 250);
        let height = shape.h;


        // TODO
        // if (range.isUmlCustomShape()) {
        //
        //   ranDistX = range.getRenderingShape().attr('width');
        //   ranDistY = range.getRenderingShape().attr('height');
        //
        // }

        distanceToBorderX = 0.5 * parseFloat(width);
        distanceToBorderY = 0.5 * parseFloat(height);

        if (!origin) {
            let scale = 1.0;
            if (Math.abs(offsetDirection.x) >= Math.abs(offsetDirection.y)) {
                scale = 1.0 / Math.abs(offsetDirection.x);
            } else {
                scale = 1.0 / Math.abs(offsetDirection.y);
            }
            IntPoint.x = element.x + (scale * distanceToBorderX * offsetDirection.x);
            IntPoint.y = element.y + (scale * distanceToBorderY * offsetDirection.y);
            return IntPoint;
        } else {
            let rad_angle = Math.atan2(offsetDirection.y, offsetDirection.x);

            let c1_x = distanceToBorderX;
            let c1_y = Math.tan(rad_angle) * c1_x;
            let c2_x = distanceToBorderY / Math.tan(rad_angle);
            let c2_y = distanceToBorderY;

            let ipX = 0;
            let ipY = 0;

            if (Math.abs(c1_y) < distanceToBorderY) {
                // use this point;
                ipX = c1_x;
                ipY = c1_y;
            } else {
                ipX = c2_x;
                ipY = c2_y;
            }
            // possible intersection points
            const pX1 = element.x - ipX;
            const pY1 = element.y - ipY;
            const pX2 = element.x + ipX;
            const pY2 = element.y + ipY;

            // take the smaller distance point;
            const d1_x = pX1 - origin.x;
            const d1_y = pY1 - origin.y;
            const d2_x = pX2 - origin.x;
            const d2_y = pY2 - origin.y;
            const len1 = Math.sqrt(d1_x * d1_x + d1_y * d1_y);
            const len2 = Math.sqrt(d2_x * d2_x + d2_y * d2_y);

            // use the point that has the lower distance to the domain node
            if (len1 < len2) {
                IntPoint.x = pX1;
                IntPoint.y = pY1;
            } else {
                IntPoint.x = pX2;
                IntPoint.y = pY2;
            }
            return IntPoint;
        }// end of case when we compute the origin
    }// end of 'rect' if case
}


