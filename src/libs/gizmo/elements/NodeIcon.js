export default class NodeIcon {
    constructor() {
        this.iconType = undefined;

        this.iconLibrary = {};
        this.parentSvgRoot = undefined;
        this.renderedIcon = undefined;
        this.parentNode = undefined;
        this.drawIcon = this.drawIcon.bind(this);
        this.remove = this.remove.bind(this);
        this.createIconLibrary();
    }

    remove() {
        if (this.renderedIcon) {
            this.renderedIcon.remove(); // forward to d3 remove function
            this.renderedIcon = undefined;
        }
    }

    drawIcon() {
        // returns the icon

        if (this.iconLibrary.hasOwnProperty(this.iconType)) {
            const iconDef = this.iconLibrary[this.iconType];
            this.renderedIcon = this.parentSvgRoot.append(iconDef.primitive);
            if (iconDef.primitive === 'path') {
                this.renderedIcon.attr('d', iconDef.pathData);
            }
            if (iconDef.strokeWidth) {
                this.renderedIcon.style('stroke-width', iconDef.strokeWidth);
            }
            if (iconDef.transformation) {
                if (iconDef.transformation.indexOf('$$LEFT$$') !== -1) {
                    let transformationValue = iconDef.transformation;
                    const xOffset = 0.5 * this.parentNode.getRenderingElementSize().w + 23;

                    transformationValue = transformationValue.replace('$$LEFT$$', `-${xOffset}`);
                    this.renderedIcon.attr('transform', transformationValue);
                } else {
                    this.renderedIcon.attr('transform', iconDef.transformation);
                }
            }
            if (iconDef.color) {
                this.renderedIcon.attr('fill', iconDef.color);
            }

            if (iconDef.primitive === 'g') {
                iconDef.primitiveData.forEach(prim => {
                    const subPrim = this.renderedIcon.append(prim.primitive);
                    for (const name in prim.attributes) {
                        if (prim.attributes.hasOwnProperty(name)) {
                            if (name === 'strokeWidth') {
                                subPrim.attr('stroke-width', prim.attributes[name]);
                            } else {
                                subPrim.attr(name, prim.attributes[name]);
                            }
                        }
                    }
                });
            }

            return iconDef;
        }
    }

    createIconLibrary() {
        // user Icon;
        this.createUserIcon();
        // doi icon
        this.createDoiIcon();
        this.createPaperIcon();
    }

    createUserIcon() {
        const icon = {};
        icon.primitive = 'path';
        icon.pathData =
            'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z';
        icon.color = '#40424a';
        icon.strokeWidth = 0;
        icon.transformation = 'translate(-23,-40), scale(0.1,0.1)';
        icon.textTransform = { dy: '27px' };
        this.iconLibrary.userIcon = icon;
    }

    createPaperIcon() {
        const icon = {};
        icon.primitive = 'path';
        icon.pathData =
            'M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm64 236c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-64c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12v8zm0-72v8c0 6.6-5.4 12-12 12H108c-6.6 0-12-5.4-12-12v-8c0-6.6 5.4-12 12-12h168c6.6 0 12 5.4 12 12zm96-114.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z';
        icon.color = '#40424a';
        icon.strokeWidth = 0;
        icon.transformation = 'translate(-20,-40), scale(0.1,0.1)';
        icon.textTransform = { dy: '27px' };
        this.iconLibrary.paperIcon = icon;
    }

    createDoiIcon() {
        const icon = {};
        icon.primitive = 'g';
        icon.primitiveData = [
            { primitive: 'circle', attributes: { stroke: 'black', strokeWidth: '5px', fill: '#fcb425', cx: '65', cy: 65, r: 64 } },
            {
                primitive: 'path',
                attributes: {
                    fill: '#231f20',
                    d:
                        'm 49.819127,84.559148 -11.854304,0 0,-4.825665 c -1.203594,1.510894 -4.035515,3.051053 -5.264716,3.742483 -2.151101,1.203585 -5.072066,1.987225 -7.812161,1.987225 -4.430246,0 -8.373925,-1.399539 -11.831057,-4.446924 -4.1229464,-3.636389 -6.0602455,-9.19576 -6.0602455,-15.188113 0,-6.094791 2.1126913,-10.960381 6.3380645,-14.59676 3.354695,-2.893745 7.457089,-5.209795 11.810505,-5.209795 2.535231,0 5.661807,0.227363 7.889738,1.302913 1.280414,0.614601 3.572628,2.060721 4.929872,3.469179 l 0,-25.420177 11.854304,0 z m -12.1199,-18.692584 c 0,-2.253538 -0.618258,-4.951555 -2.205973,-6.513663 -1.587724,-1.587724 -4.474153,-2.996182 -6.727691,-2.996182 -2.509615,0 -4.834476,1.825511 -6.447807,3.720535 -1.306031,1.536501 -1.959041,3.905269 -1.959041,5.877114 0,1.971835 0.740815,4.165004 2.046836,5.701505 1.587714,1.895025 3.297985,3.193739 5.833216,3.193739 2.279145,0 4.989965,-0.956662 6.552083,-2.51877 1.587714,-1.562108 2.908377,-4.185134 2.908377,-6.464278 z"',
                },
            },
            {
                primitive: 'path',
                attributes: {
                    fill: '#ffffff',
                    d:
                        'm 105.42764,25.617918 c -1.97184,0 -3.64919,0.69142 -5.03204,2.074271 -1.357247,1.357245 -2.035864,3.021779 -2.035864,4.993633 0,1.971835 0.678617,3.649193 2.035864,5.032034 1.38285,1.382861 3.0602,2.074281 5.03204,2.074281 1.99744,0 3.67479,-0.678627 5.03203,-2.035861 1.38285,-1.382861 2.07428,-3.073012 2.07428,-5.070454 0,-1.971854 -0.69143,-3.636388 -2.07428,-4.993633 -1.38285,-1.382851 -3.0602,-2.074271 -5.03203,-2.074271 z M 74.219383,45.507921 c -7.323992,0 -12.970625,2.283009 -16.939921,6.848949 -3.277876,3.782438 -4.916803,8.118252 -4.916803,13.008406 0,5.430481 1.626124,10.009834 4.878383,13.738236 3.943689,4.538918 9.475093,6.808622 16.59421,6.808622 7.093512,0 12.612122,-2.269704 16.555801,-6.808622 3.252259,-3.728402 4.878393,-8.1993 4.878393,-13.413648 0,-5.160323 -1.638938,-9.604602 -4.916803,-13.332994 -4.020509,-4.56594 -9.398263,-6.848949 -16.13326,-6.848949 z m 24.908603,1.386686 0,37.634676 12.599304,0 0,-37.634676 -12.599304,0 z M 73.835252,56.975981 c 2.304752,0 4.263793,0.852337 5.877124,2.554426 1.638928,1.675076 2.458402,3.727881 2.458402,6.159457 0,2.458578 -0.806671,4.538022 -2.419992,6.240111 -1.613331,1.675086 -3.585175,2.514099 -5.915534,2.514099 -2.612051,0 -4.737546,-1.027366 -6.376474,-3.080682 -1.331637,-1.648053 -1.997451,-3.539154 -1.997451,-5.673528 0,-2.107362 0.665814,-3.985138 1.997451,-5.633201 1.638928,-2.053316 3.764423,-3.080682 6.376474,-3.080682 z',
                },
            },
        ];
        // expected with;

        icon.transformation = 'translate($$LEFT$$,-10), scale(0.16,0.16)';

        this.iconLibrary.doiIcon = icon;
    }
}
