export default class Options {
    constructor() {

        this.layerObject = [];
        this._renderingStyle = 'vowl'; // possible vowl, uml

        // objectFunctions
        this.loadDefaultOptions = this.loadDefaultOptions.bind(this);
        this.layerDefinitionObject = this.layerDefinitionObject.bind(this);
        this.nodeConfig = this.nodeConfig.bind(this);
        this.edgeConfig = this.edgeConfig.bind(this);
        this.datatypeConfig = this.datatypeConfig.bind(this);
        this.datatypeLinkConfig = this.datatypeLinkConfig.bind(this);

        this.renderingStyle = this.renderingStyle.bind(this);

    }


    renderingStyle(val) {
        if (!arguments.length) {
            return this._renderingStyle;
        }
        this._renderingStyle = val;
    }

    loadDefaultOptions() {
        this.loadLayerOptions();
    }


    loadLayerOptions() {
        // defines on which layer nodes/links and the properties

        // TopDown Layering;

        // Nodes (resources)
        //   --> Properties (labeled text)
        //       --> Links  (lines)
        //           --> Arrows;

        this.layerObject = ['arrows', 'edges', 'properties', 'nodes'];
    }

    layerDefinitionObject() {
        return this.layerObject
    }

    nodeConfig() {
        if (this._renderingStyle === 'vowl') {
            return {
                'renderingType': 'circle',
                'bgColor': '#aaccff',
                'fontSizeOverWritesShapeSize': 'false',
                'radius': '50',
                'strokeElement': 'true',
                'strokeStyle': 'solid',
                'strokeWidth': '2px',
                'strokeColor': '#000000',
                'fontFamily': 'Helvetica,Arial,sans-serif',
                'fontColor': '#000000',
                'fontSize': '12px',
                'hoverInCursor': 'pointer',
                'hoverInColor': '#ff0000',
                'hoverInStrokeColor': '#ff0000',
                'hoverInFontColor': '#000000',
                'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                'overWriteOffset': '15',
                'hoverInFontSize': '12px',
            }
        }
        if (this._renderingStyle === 'uml') {
            return {

                'renderingType': 'umlStyle',
                'umlShapeAdjustsShapeSize': 'allElements',
                'umlElementScaleFactor': '1',
                'umlHeightOffset': '5',
                'umlOffsetToHeader': '13',
                'umlOffsetToAfterLastElement': '0',
                'umlMarginLeft': '5',
                'umlMarginRight': '5',
                'umlShowDatatypeProperty': 'true',
                'umlMarginBetween': '5',
                'umlDrawHeaderLine': 'true',
                'umlHeaderAlign': 'center',
                'umlPropertyAlign': 'left',
                'umlNestElements': 'dt_loops',
                'renderingAttributes': {
                    'renderingType': 'rect',
                    'bgColor': '#ffffff',
                    'roundedCorner': '10,10',
                    'fontSizeOverWritesShapeSize': 'false',
                    'width': '100',
                    'height': '50',
                    'strokeElement': 'true',
                    'strokeStyle': 'solid',
                    'strokeWidth': '2px',
                    'strokeColor': '#000000',
                    'fontFamily': 'Helvetica,Arial,sans-serif',
                    'fontColor': '#000000',
                    'fontSize': '12px',
                    'hoverInCursor': 'pointer',
                    'hoverInColor': '#64bbff',
                    'hoverInStrokeColor': '#1f20ff',
                    'hoverInFontColor': '#000000',
                    'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                    'hoverInFontSize': '12px'
                }
            }

        }
    }

    edgeConfig() {
        if (this._renderingStyle === 'vowl') {
            return {
                'renderingType': 'rect',
                'bgColor': '#aaccff',
                'roundedCorner': '0,0',
                'fontSizeOverWritesShapeSize': 'true',
                'overWriteOffset': '5',
                'strokeElement': 'false',
                'fontFamily': 'Helvetica,Arial,sans-serif',
                'fontColor': '#000000',
                'fontSize': '12px',
                'hoverInCursor': 'pointer',
                'hoverInColor': '#ff0000',
                'hoverInStrokeColor': '#ff0000',
                'hoverInFontColor': '#000000',
                'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                'hoverInFontSize': '12px',
                'link_strokeStyle': 'solid',
                'link_strokeWidth': '2px',
                'link_strokeColor': '#000000',
                'link_hoverColor': '#ff0000',
                'link_arrowHead': 'true',
                'link_renderingType': 'line',
                'link_arrowHead_renderingType': 'triangle',
                'link_arrowHead_scaleFactor': '1',
                'link_arrowHead_strokeWidth': '2px',
                'link_arrowHead_strokeStyle': 'solid',
                'link_arrowHead_strokeColor': '#000000',
                'link_arrowHead_fillColor': '#000000'
            }
        }
        if (this._renderingStyle === 'uml') {
            return {
                'renderingType': 'rect',
                'bgColor': '#aaccff',
                'roundedCorner': '10,10',
                'fontSizeOverWritesShapeSize': 'true',
                'overWriteOffset': '10',
                'strokeElement': 'false',
                'fontFamily': 'Helvetica,Arial,sans-serif',
                'fontColor': '#000000',
                'fontSize': '12px',
                'hoverInCursor': 'pointer',
                'hoverInColor': '#ff0000',
                'hoverInStrokeColor': '#ff0000',
                'hoverInFontColor': '#000000',
                'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                'hoverInFontSize': '12px',
                'link_strokeStyle': 'solid',
                'link_strokeWidth': '2px',
                'link_strokeColor': '#000000',
                'link_hoverColor': '#ff0000',
                'link_arrowHead': 'true',
                'link_renderingType': 'line',
                'link_arrowHead_renderingType': 'triangle',
                'link_arrowHead_scaleFactor': '1',
                'link_arrowHead_strokeWidth': '2px',
                'link_arrowHead_strokeStyle': 'solid',
                'link_arrowHead_strokeColor': '#000000',
                'link_arrowHead_fillColor': '#000000'
            }
        }
    }

    datatypeConfig() {
        if (this._renderingStyle === 'vowl') {
            return {
                'renderingType': 'rect',
                'bgColor': '#ffcc33',
                'roundedCorner': '0,0',
                'fontSizeOverWritesShapeSize': 'true',
                'overWriteOffset': '5',
                'strokeElement': 'true',
                'strokeStyle': 'solid',
                'strokeWidth': '2px',
                'strokeColor': '#000000',
                'fontFamily': 'Helvetica,Arial,sans-serif',
                'fontColor': '#000000',
                'fontSize': '12px',
                'hoverInCursor': 'pointer',
                'hoverInColor': '#ff0000',
                'hoverInStrokeColor': '#ff0000',
                'hoverInFontColor': '#000000',
                'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                'hoverInFontSize': '12px',
            }
        }
        if (this._renderingStyle === 'uml') {
            return {
                'renderingType': 'rect',
                'bgColor': '#ffcc33',
                'roundedCorner': '0,0',
                'fontSizeOverWritesShapeSize': 'true',
                'overWriteOffset': '5',
                'strokeElement': 'true',
                'strokeStyle': 'solid',
                'strokeWidth': '2px',
                'strokeColor': '#000000',
                'fontFamily': 'Helvetica,Arial,sans-serif',
                'fontColor': '#000000',
                'fontSize': '12px',
                'hoverInCursor': 'pointer',
                'hoverInColor': '#ff0000',
                'hoverInStrokeColor': '#ff0000',
                'hoverInFontColor': '#000000',
                'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                'hoverInFontSize': '12px',
            }
        }
    }

    datatypeLinkConfig() {
        if (this._renderingStyle === 'vowl') {
            return {
                'renderingType': 'rect',
                'bgColor': '#99cc66',
                'roundedCorner': '0,0',
                'fontSizeOverWritesShapeSize': 'true',
                'overWriteOffset': '5',
                'strokeElement': 'false',
                'link_strokeStyle': 'solid',
                'link_strokeWidth': '2px',
                'link_strokeColor': '#000000',
                'link_hoverColor': '#ff0000',
                'link_arrowHead': 'true',
                'link_renderingType': 'line',
                'link_arrowHead_renderingType': 'triangle',
                'link_arrowHead_scaleFactor': '1',
                'link_arrowHead_strokeWidth': '2px',
                'link_arrowHead_strokeStyle': 'solid',
                'link_arrowHead_strokeColor': '#000000',
                'link_arrowHead_fillColor': '#000000',
                'fontFamily': 'Helvetica,Arial,sans-serif',
                'fontColor': '#000000',
                'fontSize': '12px',
                'hoverInCursor': 'pointer',
                'hoverInColor': '#ff0000',
                'hoverInStrokeColor': '#ff0000',
                'hoverInFontColor': '#000000',
                'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                'hoverInFontSize': '12px',
            }
        }
        if (this._renderingStyle === 'uml') {
            return {
                'renderingType': 'rect',
                'bgColor': '#99cc66',
                'roundedCorner': '0,0',
                'fontSizeOverWritesShapeSize': 'true',
                'overWriteOffset': '5',
                'strokeElement': 'false',
                'link_strokeStyle': 'solid',
                'link_strokeWidth': '2px',
                'link_strokeColor': '#000000',
                'link_hoverColor': '#ff0000',
                'link_arrowHead': 'true',
                'link_renderingType': 'line',
                'link_arrowHead_renderingType': 'triangle',
                'link_arrowHead_scaleFactor': '1',
                'link_arrowHead_strokeWidth': '2px',
                'link_arrowHead_strokeStyle': 'solid',
                'link_arrowHead_strokeColor': '#000000',
                'link_arrowHead_fillColor': '#000000',
                'fontFamily': 'Helvetica,Arial,sans-serif',
                'fontColor': '#000000',
                'fontSize': '12px',
                'hoverInCursor': 'pointer',
                'hoverInColor': '#ff0000',
                'hoverInStrokeColor': '#ff0000',
                'hoverInFontColor': '#000000',
                'hoverInFontFamily': 'Helvetica,Arial,sans-serif',
                'hoverInFontSize': '12px',
            }
        }
    }

}
