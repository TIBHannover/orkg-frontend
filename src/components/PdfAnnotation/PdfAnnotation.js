import React, { Component } from 'react';
import { Row, Col } from 'reactstrap';
import Toolbar from './Toolbar';
import TableSelect from './TableSelect';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import Dropzone from 'react-dropzone';
import { withTheme } from 'styled-components';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { parse } from 'node-html-parser';
import { setFile, setParsedPdfData } from '../../actions/pdfAnnotation';

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
            zoom: 1
        };

        this.defaultPageWidth = 968;
    }

    handleUpload = files => {
        const self = this;

        this.setState({
            loading: true
        });

        if (files.length === 0) {
            return;
        }

        const pdf = files[0];

        //this.props.setPdf(files[0]);

        const form = new FormData();
        form.append('pdf', pdf);

        fetch('http://localhost:9000/convertPdf', {
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
                const parseData = parse(data, {
                    style: true // retrieve content in <style> (hurt performance slightly)
                });
                const pages = parseData.querySelectorAll('.pf');
                const styles = parseData.querySelectorAll('style');

                self.props.setFile({
                    pdf,
                    pages,
                    styles
                });

                self.parsePdf(pdf);
            })
            .catch(err => {
                console.log(err);
            });
    };

    parsePdf = pdf => {
        const form = new FormData();
        form.append('input', pdf);
        const self = this;

        fetch('http://localhost:8070/api/processFulltextDocument', {
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
            .then(str => new window.DOMParser().parseFromString(str, 'text/xml')) // parse the xml
            .then(function(data) {
                self.props.setParsedPdfData(data);

                self.setState({
                    loading: false
                });
                //console.log('data', data);
                //console.log('data', data.querySelectorAll('ref[type="bibr"]'));
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

                {this.props.pages && (
                    <PdfContainer>
                        <ZoomContainer style={{ transform: 'scale(' + this.state.zoom + ')' }} id="zoom-container">
                            {this.props.pages.map((page, index) => (
                                <div style={{ position: 'relative' }} key={index}>
                                    <TableSelect pageNumber={index + 1} pdf={this.props.pdf}>
                                        <div dangerouslySetInnerHTML={{ __html: page }} />
                                    </TableSelect>
                                </div>
                            ))}
                        </ZoomContainer>

                        {this.props.styles.map((style, index) => (
                            <div dangerouslySetInnerHTML={{ __html: style }} key={index} />
                        ))}
                    </PdfContainer>
                )}

                {!this.props.pages && !this.state.loading && (
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

const mapStateToProps = state => ({
    selectedTool: state.pdfAnnotation.selectedTool,
    pdf: state.pdfAnnotation.pdf,
    pages: state.pdfAnnotation.pages,
    styles: state.pdfAnnotation.styles
});

const mapDispatchToProps = dispatch => ({
    setFile: payload => dispatch(setFile(payload)),
    setParsedPdfData: payload => dispatch(setParsedPdfData(payload))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme
)(PdfAnnotation);
