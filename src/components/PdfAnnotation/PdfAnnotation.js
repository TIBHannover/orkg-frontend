import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import Toolbar from './Toolbar';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import Dropzone from 'react-dropzone';
import { withTheme } from 'styled-components';

const DragPdf = styled.div`
    margin: 200px auto;
    width: 240px;
    text-align: center;
    border: 4px dashed #bbbdc0;
    padding: 20px;
    border-radius: 15px;
    font-weight: 500;
    color: #a4a0a0;
`;

const FilePlaceholder = styled(Icon)`
    margin-bottom: 15px;
    color: inherit;
`;

const PdfContainer = styled.div`
    display: flex;
    justify-content: center;
    max-height: 0;
`;

const ZoomContainer = styled.div`
    transform-origin: center top;
    //transition: 0.2s;
`;

class PdfAnnotation extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            pdf: '',
            zoom: 1,
            paddingLeft: 0
        };

        this.pdfContainer = React.createRef();
        this.defaultPageWidth = 968;
    }

    handleUpload = files => {
        console.log(files);
        const self = this;

        this.setState({
            loading: true
        });
        console.log(files[0]);
        let form = new FormData();
        form.append('pdf', files[0]);

        fetch('http://localhost:9000', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    console.log('err');
                } else {
                    return response.text();
                }
            })
            .then(function(data) {
                //console.log(data);
                self.setState({
                    loading: false,
                    pdf: data
                });
            })
            .catch(err => {
                console.log(err);
            });
    };

    handleZoomChange = zoom => {
        if (zoom) {
            const maxZoom = this.getFullPageScale();

            if (zoom > maxZoom) {
                zoom = maxZoom;
            } else if (zoom < 0) {
                zoom = 0.1;
            }

            this.setState({
                zoom
            });
            /* Could be helpful for zooming beyond full width
            () => {
                const container = this.pdfContainer.current;
                const difference = container.scrollWidth - container.clientWidth;
                console.log(difference);
            } */
        } else {
            const zoom = this.getFullPageScale();
            this.setState({
                zoom
            });
        }
    };

    getFullPageScale = () => {
        return window.innerWidth / (this.defaultPageWidth + 20);
    };

    render() {
        return (
            <div style={{ paddingTop: 20 }}>
                <Toolbar changeZoom={this.handleZoomChange} fullWidth={this.fullWidth} zoom={this.state.zoom} />
                {this.state.pdf && (
                    <PdfContainer ref={this.pdfContainer} style={{ paddingLeft: this.state.paddingLeft }}>
                        <ZoomContainer style={{ transform: 'scale(' + this.state.zoom + ')' }} dangerouslySetInnerHTML={{ __html: this.state.pdf }} />
                    </PdfContainer>
                )}

                {!this.state.pdf && !this.state.loading && (
                    <Dropzone onDrop={this.handleUpload}>
                        {({ getRootProps, getInputProps, isDragActive }) => (
                            <section>
                                <div {...getRootProps()} style={{ outline: 0 }}>
                                    {/*<input {...getInputProps()} />*/}
                                    <DragPdf style={isDragActive ? { borderColor: this.props.theme.darkblue, color: this.props.theme.darkblue } : {}}>
                                        <FilePlaceholder icon={faFile} style={{ fontSize: 70 }} /> <br />
                                        Drag a PDF file in here to get started
                                    </DragPdf>
                                </div>
                            </section>
                        )}
                    </Dropzone>
                )}

                {this.state.loading && (
                    <DragPdf>
                        <FilePlaceholder spin icon={faSpinner} style={{ fontSize: 70 }} /> <br />
                        Is loading...
                    </DragPdf>
                )}
            </div>
        );
    }
}

export default withTheme(PdfAnnotation);
