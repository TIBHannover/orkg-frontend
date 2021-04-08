import { createRef, Component } from 'react';
import { Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import ROUTES from 'constants/routes';
import Tippy from '@tippyjs/react';
import { reverse } from 'named-urls';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import classNames from 'classnames';
import { ActionButton } from 'components/AddPaper/Contributions/styled';

export const StyledInput = styled(Input)`
    background: #fff;
    color: ${props => props.theme.primary};
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: calc(1em + 0.6rem) !important;

    &:focus {
        background: #fff;
        color: ${props => props.theme.primary};
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

        this.inputRefs = createRef();
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
        const listItem = (
            <span className="selectContribution">
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
                {!this.state.isEditing && <span>{this.props.contribution.label}</span>}
                {this.props.enableEdit && !this.state.isEditing && (
                    <>
                        {this.props.canDelete && this.props.isSelected && (
                            <span className="float-right mr-1">
                                <Tippy content="Delete contribution">
                                    <span>
                                        <ActionButton
                                            color="link"
                                            onClick={e => {
                                                e.stopPropagation();
                                                this.props.toggleDeleteContribution(this.props.contribution.id);
                                            }}
                                        >
                                            <Icon icon={faTrash} />
                                        </ActionButton>
                                    </span>
                                </Tippy>
                            </span>
                        )}
                        {this.props.isSelected && (
                            <span className="float-right mr-1 ml-1">
                                <Tippy content="Edit the contribution label">
                                    <span>
                                        <ActionButton
                                            color="link"
                                            onClick={e => {
                                                e.stopPropagation();
                                                this.toggleEditLabelContribution(this.props.contribution.id, e);
                                            }}
                                        >
                                            <Icon icon={faPen} />
                                        </ActionButton>
                                    </span>
                                </Tippy>
                            </span>
                        )}
                    </>
                )}
            </span>
        );

        const listClasses = classNames({
            'contribution-item': true,
            'active-contribution': this.props.isSelected
        });

        const isViewPaperPage = this.props.paperId;
        const shouldRenderLink = isViewPaperPage && !this.props.isSelected && !this.state.isEditing;

        return shouldRenderLink ? (
            <li>
                <Link
                    className={listClasses}
                    to={reverse(ROUTES.VIEW_PAPER, { resourceId: this.props.paperId, contributionId: this.props.contribution.id })}
                >
                    {listItem}
                </Link>
            </li>
        ) : (
            <li>
                <ConditionalWrapper
                    condition={!this.props.isSelected}
                    wrapper={children => (
                        <button
                            className={listClasses}
                            onClick={
                                !isViewPaperPage
                                    ? () =>
                                          this.props.handleSelectContribution && !this.state.isEditing
                                              ? this.props.handleSelectContribution(this.props.contribution.id)
                                              : undefined
                                    : undefined
                            }
                        >
                            {children}
                        </button>
                    )}
                >
                    <div className={this.props.isSelected ? listClasses : undefined}>{listItem}</div>
                </ConditionalWrapper>
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
    toggleDeleteContribution: PropTypes.func.isRequired,
    enableEdit: PropTypes.bool.isRequired
};

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ContributionItemList);
