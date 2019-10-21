import React, { Component } from 'react';
import { Container, Button, Alert, UncontrolledAlert, Modal, ModalHeader, ModalBody, Collapse, ListGroup, Input } from 'reactstrap';
import { getStatementsBySubject, getResource } from 'network';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faBars, faProjectDiagram } from '@fortawesome/free-solid-svg-icons';
import { StyledStatementItem, StyledListGroupOpen, StyledValueItem } from 'components/AddPaper/Contributions/styled';
import classNames from 'classnames';
import moment from 'moment';
import { range } from 'utils';
import AuthorsInput from '../../Utils/AuthorsInput';

class EditItem extends Component {


    render() {
        const listGroupClass = classNames({
            statementActive: this.props.open,
            statementItem: true,
            selectable: true,
            'rounded-bottom': this.props.isLastItem && !this.props.open,
        });

        const openBoxClass = classNames({
            listGroupOpenBorderBottom: this.props.isLastItem,
            'rounded-bottom': this.props.isLastItem,
        });

        let input;

        if (this.props.type === 'text') {
            input = <Input value={this.props.value} onChange={this.props.onChange} />;
        } else if(this.props.type === 'month') {
            input = (
                <Input
                    type="select"
                    value={this.props.value} 
                    onChange={this.props.onChange}
                >
                    {moment.months().map((el, index) => {
                        return (
                            <option value={index + 1} key={index + 1}>
                                {el}
                            </option>
                        );
                    })}
                </Input>
            );
        } else if (this.props.type === 'year') {
            input = (
                <Input
                    type="select"
                    value={this.props.value} 
                    onChange={this.props.onChange}
                >
                    {range(1900, moment().year())
                        .reverse()
                        .map((year) => (
                            <option key={year}>{year}</option>
                        ))}
                </Input>
            );
        } else if (this.props.type === 'authors') {
            input = (
                <AuthorsInput 
                    value={this.props.value}
                    handler={this.props.onChange}
                />
            );
        }

        return (
            <>
                <StyledStatementItem className={listGroupClass} onClick={this.props.toggleItem}>
                    {this.props.label}
                </StyledStatementItem>
                <Collapse isOpen={this.props.open}>
                    <StyledListGroupOpen className={openBoxClass}>
                        {input}
                    </StyledListGroupOpen>
                </Collapse>
            </>
        );
    }
}

EditItem.propTypes = {
    // match: PropTypes.shape({
    //     params: PropTypes.shape({
    //         resourceId: PropTypes.string,
    //         contributionId: PropTypes.string,
    //     }).isRequired,
    // }).isRequired,
    // resetStatementBrowser: PropTypes.func.isRequired,
    // location: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

const mapDispatchToProps = dispatch => ({
    //resetStatementBrowser: () => dispatch(resetStatementBrowser()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(EditItem);