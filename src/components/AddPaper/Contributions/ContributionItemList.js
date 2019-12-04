import React, { Component } from 'react';
import { Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import ROUTES from '../../../constants/routes';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { reverse } from 'named-urls';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

/*contributionsList*/
export const StyledInput = styled(Input)`
    background: #fff;
    color: ${props => props.theme.orkgPrimaryColor};
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: calc(1.5em + 0.5rem);

    &:focus {
        background: #fff;
        color: ${props => props.theme.orkgPrimaryColor};
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

class ContributionItemList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            modalDataset: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
            isEditing: false,
            draftLabel: this.props.contribution.label
        };

        this.inputRefs = React.createRef();
    }

    componentDidUpdate(prevProps) {
        if (this.props.contribution.label !== prevProps.contribution.label) {
            this.setState({ draftLabel: this.props.contribution.label });
        }
    }

    toggleEditLabelContribution = () => {
        if (this.state.isEditing) {
            this.setState({ isEditing: false });
        } else {
            // enable editing and focus on the input
            this.setState({ isEditing: true }, () => {
                this.inputRefs.current.focus();
            });
        }
    };

    handleChangeLabel = event => {
        this.setState({ draftLabel: event.target.value });
    };

    render() {
        return (
            <li className={this.props.isSelected ? 'activeContribution' : ''}>
                <span className={'selectContribution'}>
                    {this.state.isEditing && (
                        <StyledInput
                            bsSize="sm"
                            innerRef={this.inputRefs}
                            value={this.state.draftLabel}
                            onChange={this.handleChangeLabel}
                            onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                            onBlur={e => {
                                this.props.handleChangeContributionLabel(this.props.contribution.id, this.state.draftLabel);
                                this.toggleEditLabelContribution();
                            }}
                            onFocus={e =>
                                setTimeout(() => {
                                    document.execCommand('selectAll', false, null);
                                }, 0)
                            } // Highlights the entire label when edit
                        />
                    )}
                    {!this.state.isEditing && (
                        <span>
                            {this.props.paperId && !this.props.isSelected ? (
                                <Link to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paperId, contributionId: this.props.contribution.id })}>
                                    {this.props.contribution.label}
                                </Link>
                            ) : (
                                <span
                                    className={'selectContribution'}
                                    onClick={() =>
                                        this.props.handleSelectContribution
                                            ? this.props.handleSelectContribution(this.props.contribution.id)
                                            : undefined
                                    }
                                >
                                    {this.props.contribution.label}
                                </span>
                            )}
                        </span>
                    )}
                    {!this.state.isEditing && (
                        <>
                            {this.props.canDelete && (
                                <span className={`deleteContribution float-right mr-1 ${!this.props.isSelected && 'd-none'}`}>
                                    <Tippy content="Delete contribution">
                                        <span>
                                            <Icon
                                                icon={faTrash}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    this.props.toggleDeleteContribution(this.props.contribution.id);
                                                }}
                                            />
                                        </span>
                                    </Tippy>
                                </span>
                            )}
                            <span className={`deleteContribution float-right mr-1 ${!this.props.isSelected && 'd-none'}`}>
                                <Tippy content="Edit the contribution label">
                                    <span>
                                        <Icon
                                            icon={faPen}
                                            onClick={e => {
                                                e.stopPropagation();
                                                this.toggleEditLabelContribution(this.props.contribution.id, e);
                                            }}
                                        />
                                    </span>
                                </Tippy>
                            </span>
                        </>
                    )}
                </span>
            </li>
        );
    }
}

ContributionItemList.propTypes = {
    contribution: PropTypes.object.isRequired,
    canDelete: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    paperId: PropTypes.string,
    handleSelectContribution: PropTypes.func,
    handleChangeContributionLabel: PropTypes.func.isRequired,
    toggleDeleteContribution: PropTypes.func.isRequired
};

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ContributionItemList);
