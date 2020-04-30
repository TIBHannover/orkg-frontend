import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import TableEditor from './TableEditor';

class ExtractionModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            extractedTable: null,
            loading: false
        };
    }

    componentDidMount() {
        this.setState({
            loading: true
        });

        const { x, y, w, h } = this.props.region;

        const form = new FormData();
        form.append('pdf', this.props.pdf);
        form.append('region', this.pxToPoint(y) + ',' + this.pxToPoint(x) + ',' + this.pxToPoint(y + h) + ',' + this.pxToPoint(x + w));
        form.append('pageNumber', this.props.pageNumber);

        const self = this;

        fetch('http://localhost:9000/extractTable', {
            method: 'POST',
            body: form
        })
            .then(response => {
                if (!response.ok) {
                    console.log('err');
                } else {
                    return response.json();
                }
            })
            .then(function(data) {
                console.log(data);
                self.setState({
                    extractedTable: data,
                    loading: false
                });
            })
            .catch(err => {
                console.log(err);
            });
    }

    pxToPoint = x => (x * 72) / 96;

    render() {
        console.log(this.state.extractedTable);
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle} size="lg">
                <ModalHeader toggle={this.props.toggle}>Table extraction</ModalHeader>
                <ModalBody>
                    {!this.state.loading && this.state.extractedTable && <TableEditor data={this.state.extractedTable} />}

                    {this.state.loading && (
                        <div className="text-center" style={{ fontSize: 40 }}>
                            <Icon icon={faSpinner} spin />
                        </div>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

ExtractionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    pageNumber: PropTypes.number.isRequired,
    pdf: PropTypes.object.isRequired,
    region: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        w: PropTypes.number.isRequired,
        h: PropTypes.number.isRequired
    })
};

const mapStateToProps = state => ({
    pdf: state.pdfAnnotation.pdf
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExtractionModal);
