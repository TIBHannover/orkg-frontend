/**
 * Generate a GraphML file from a react-flow diagram object serialization
 * http://graphml.graphdrawing.org/
 * https://docs.yworks.com/yfiles-html/dguide/graph/index.html#graph
 * @param {Object} diagram react-flow diagram
 * @param {Object} diagramResource ORKG diagram resource
 * @return {XML} Download link
 */
export const generateGraphMLFile = (diagram, diagramResource) => {
    const element = document.createElement('a');
    const doc = document.implementation.createDocument('', '', null);
    const graph = doc.createElement('graph');
    graph.setAttribute('id', 'G');
    graph.setAttribute('edgedefault', 'undirected');
    diagram.nodes.map((n) => {
        const node = doc.createElement('node');
        node.setAttribute('id', n.id);
        // NodeLabels
        const data = doc.createElement('data');
        data.setAttribute('key', 'd0');
        const List = doc.createElement('x:List');
        const Label = doc.createElement('y:Label');
        const Text = doc.createElement('y:Label.Text');
        Text.innerHTML = `<![CDATA[${n.data.label}]]>`;
        // NodeGeometry
        const data1 = doc.createElement('data');
        data1.setAttribute('key', 'd1');
        const RectD = doc.createElement('y:RectD');
        RectD.setAttribute('X', n.positionAbsolute.x);
        RectD.setAttribute('Y', n.positionAbsolute.y);
        RectD.setAttribute('Width', n.width);
        RectD.setAttribute('Height', n.height);
        data1.appendChild(RectD);
        Label.appendChild(Text);
        List.appendChild(Label);
        data.appendChild(List);
        node.appendChild(data);
        node.appendChild(data1);
        graph.appendChild(node);
        return null;
    });
    diagram.edges.map((e) => {
        const edge = doc.createElement('edge');
        edge.setAttribute('source', e.source);
        edge.setAttribute('target', e.target);
        edge.setAttribute('id', e.id);
        edge.setAttribute('directed', 'true');
        graph.appendChild(edge);
        return null;
    });
    doc.appendChild(graph);
    // Create the XML file
    const file = new Blob(
        [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<graphml xmlns:y="http://www.yworks.com/xml/yfiles-common/3.0" xmlns:x="http://www.yworks.com/xml/yfiles-common/markup/3.0" xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
            '<key id="d0" for="node" attr.name="NodeLabels" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/NodeLabels"/>',
            '<key id="d1" for="node" attr.name="NodeGeometry" y:attr.uri="http://www.yworks.com/xml/yfiles-common/2.0/NodeGeometry"/>',
            doc.documentElement.outerHTML,
            '</graphml>',
        ],
        { type: 'text/plain' },
    );
    element.href = URL.createObjectURL(file);
    element.download = `${diagramResource?.label ?? 'Diagram'}.graphml`;
    document.body.appendChild(element); // Required for FireFox support
    element.click();
};

/**
 * Generate a JSON file from a react-flow diagram object serialization
 * @param {Object} diagram react-flow diagram
 * @param {Object} diagramResource ORKG diagram resource
 * @return {JSON} Download link
 */
export const generateJSONFile = (diagram, diagramResource) => {
    const element = document.createElement('a');
    // Create the JSON file
    const file = new Blob([JSON.stringify(diagram)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `${diagramResource?.label ?? 'Diagram'}.json`;
    document.body.appendChild(element); // Required for FireFox support
    element.click();
};
