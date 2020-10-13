import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Badge } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { updateAnnotationClass, removeAnnotation, toggleEditAnnotation } from '../../../actions/addPaper';
import Tippy from '@tippy.js/react';
import { submitGetRequest } from '../../../network';
import { predicatesUrl } from 'services/backend/predicates';
import AsyncCreatableSelect from 'react-select/async-creatable';
import capitalize from 'capitalize';
import styled, { withTheme } from 'styled-components';
import { StyledStatementItem } from '../Contributions/styled';
import toArray from 'lodash/toArray';
import { compose } from 'redux';

const ListGroupItemStyle = styled(ListGroupItem)`
    .rangeOption {
        display: none;
        cursor: pointer;
    }

    &:hover .rangeOption {
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

    IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(predicatesUrl + encodeURIComponent(valueWithoutHashtag));
                } catch (err) {
                    responseJsonExact = null;
                }

                if (responseJsonExact) {
                    responseJson.unshift(responseJsonExact);
                }
            }
        }

        return responseJson;
    };

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

    loadOptions = async value => {
        try {
            if (!value || value === '' || value.trim() === '') {
                return this.props.classOptions;
            }

            let queryParams = '';

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1);
                queryParams = '&exact=true';
            }

            let responseJson = await submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(value) + queryParams);
            responseJson = await this.IdMatch(value, responseJson);

            if (this.props.classOptions && this.props.classOptions.length > 0) {
                let newProperties = this.props.classOptions;
                newProperties = newProperties.filter(({ label }) => label.includes(value)); // ensure the label of the new property contains the search value

                responseJson.unshift(...newProperties);
            }

            if (responseJson.length > this.maxResults) {
                responseJson = responseJson.slice(0, this.maxResults);
            }

            const options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id
                })
            );

            return options;
        } catch (err) {
            console.error(err);

            return [];
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
                                                    <span className="rangeOption mr-3" onClick={() => this.props.toggleEditAnnotation(range.id)}>
                                                        <Tippy content="Edit label">
                                                            <span>
                                                                <Icon icon={faPen} /> Edit
                                                            </span>
                                                        </Tippy>
                                                    </span>
                                                    <span className="rangeOption mr-2" onClick={() => this.props.removeAnnotation(range)}>
                                                        <Tippy content="Delete Annotation">
                                                            <span>
                                                                <Icon icon={faTrash} /> Delete
                                                            </span>
                                                        </Tippy>
                                                    </span>
                                                </RangeItemOption>
                                            </>
                                        ) : (
                                            <AsyncCreatableSelect
                                                loadOptions={this.loadOptions}
                                                value={{
                                                    label: range.class.label ? range.class.label : 'Select or type something...',
                                                    id: range.class.id,
                                                    certainty: range.certainty,
                                                    range_id: range.id,
                                                    isEditing: range.isEditing
                                                }}
                                                getOptionLabel={({ label }) => label}
                                                getOptionValue={({ id }) => id}
                                                onChange={(e, a) => {
                                                    this.handleChangeAnnotationClass(e, a, range);
                                                    this.props.toggleEditAnnotation(range.id);
                                                }}
                                                key={value => value}
                                                cacheOptions
                                                defaultOptions={true}
                                                isClearable
                                                openMenuOnClick={false}
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
