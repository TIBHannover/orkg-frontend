import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Badge, Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { updateAnnotationClass, removeAnnotation, toggleEditAnnotation } from 'actions/addPaper';
import Tippy from '@tippy.js/react';
import { predicatesUrl } from 'services/backend/predicates';
import capitalize from 'capitalize';
import styled, { withTheme } from 'styled-components';
import { StyledStatementItem } from '../Contributions/styled';
import AutoComplete from 'components/Autocomplete/Autocomplete';
import toArray from 'lodash/toArray';
import { compose } from 'redux';

const ListGroupItemStyle = styled(ListGroupItem)`
    .rangeOption {
        visibility: hidden;
        cursor: pointer;
    }

    &:hover .rangeOption {
        visibility: visible;
        display: inline-block !important;
    }
`;

const RangeItemOption = styled.div`
    display: inline-block !important;

    & > .rangeOption {
        font-size: 90%;

        &:hover {
            text-decoration: underline;
        }
    }
`;

class AbstractRangesList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultOptions: []
        };
    }

    componentDidMount() {
        this.setState({ defaultOptions: this.props.classOptions });
    }

    handleChangeAnnotationClass = (selectedOption, { action }, range) => {
        if (action === 'select-option') {
            this.props.updateAnnotationClass({ range, selectedOption });
        } else if (action === 'create-option') {
            const newOption = {
                label: selectedOption.label,
                id: selectedOption.label
            };
            this.props.updateAnnotationClass({ range, selectedOption: newOption });
        } else if (action === 'clear') {
            this.props.removeAnnotation(range);
        }
    };

    render() {
        const rangeArray = toArray(this.props.ranges).filter(r => r.certainty >= this.props.certaintyThreshold);
        return (
            <div>
                <ListGroup>
                    {rangeArray.length > 0 ? (
                        rangeArray.map(range => {
                            return (
                                <ListGroupItemStyle key={`r${range.id}`} onClick={() => null}>
                                    <div className="flex-grow-1">
                                        {!range.isEditing ? (
                                            <>
                                                {capitalize(range.text)}{' '}
                                                <Badge pill style={{ color: '#333', background: this.props.getClassColor(range.class.label) }}>
                                                    {range.class.label}
                                                </Badge>
                                                <RangeItemOption className="float-right">
                                                    <Button
                                                        color="link"
                                                        size="sm"
                                                        className="rangeOption p-0 mr-3"
                                                        onClick={() => this.props.toggleEditAnnotation(range.id)}
                                                    >
                                                        <Tippy content="Edit label">
                                                            <span>
                                                                <Icon icon={faPen} /> Edit
                                                            </span>
                                                        </Tippy>
                                                    </Button>
                                                    <Button
                                                        color="link"
                                                        size="sm"
                                                        className="rangeOption p-0 mr-2"
                                                        onClick={() => this.props.removeAnnotation(range)}
                                                    >
                                                        <Tippy content="Delete Annotation">
                                                            <span>
                                                                <Icon icon={faTrash} /> Delete
                                                            </span>
                                                        </Tippy>
                                                    </Button>
                                                </RangeItemOption>
                                            </>
                                        ) : (
                                            <AutoComplete
                                                requestUrl={predicatesUrl}
                                                defaultOptions={this.props.classOptions}
                                                placeholder="Select or type to enter a property"
                                                onChange={(e, a) => {
                                                    this.handleChangeAnnotationClass(e, a, range);
                                                    this.props.toggleEditAnnotation(range.id);
                                                }}
                                                value={{
                                                    label: range.class.label ? range.class.label : '',
                                                    id: range.class.id,
                                                    certainty: range.certainty,
                                                    range_id: range.id,
                                                    isEditing: range.isEditing
                                                }}
                                                onBlur={() => {
                                                    this.props.toggleEditAnnotation(range.id);
                                                }}
                                                key={value => value}
                                                isClearable
                                                openMenuOnFocus={true}
                                                autoLoadOption={true}
                                                allowCreate={true}
                                                autoFocus={true}
                                            />
                                        )}
                                    </div>
                                </ListGroupItemStyle>
                            );
                        })
                    ) : (
                        <StyledStatementItem>No annotations</StyledStatementItem>
                    )}
                </ListGroup>
            </div>
        );
    }
}

AbstractRangesList.propTypes = {
    abstract: PropTypes.string.isRequired,
    ranges: PropTypes.object.isRequired,
    classOptions: PropTypes.array.isRequired,
    certaintyThreshold: PropTypes.array.isRequired,
    getClassColor: PropTypes.func.isRequired,
    removeAnnotation: PropTypes.func.isRequired,
    toggleEditAnnotation: PropTypes.func.isRequired,
    updateAnnotationClass: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    ranges: state.addPaper.ranges,
    abstract: state.addPaper.abstract
});

const mapDispatchToProps = dispatch => ({
    removeAnnotation: data => dispatch(removeAnnotation(data)),
    toggleEditAnnotation: data => dispatch(toggleEditAnnotation(data)),
    updateAnnotationClass: data => dispatch(updateAnnotationClass(data))
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTheme
)(AbstractRangesList);
