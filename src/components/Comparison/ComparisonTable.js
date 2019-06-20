import React, { Component } from 'react';
import { Table } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTimes, faArrowCircleRight, faArrowCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import capitalize from 'capitalize';
import classNames from 'classnames';
import TableCell from './TableCell.js';

const ScrollContainer = styled.div`
    overflow-x: hidden; // auto is maybe a better UX, but hidden looks better :) 
    float: left; 
    width: 100%;
    padding: 10px 0;
    scroll-behavior: smooth;

    &.overflowing-right {
        box-shadow: inset -9px 0 5px -5px #d9d9d9;
    }
    &.overflowing-left {
        box-shadow: inset 9px 0 5px -5px #d9d9d9;
    }
    &.overflowing-both {
        box-shadow: inset 9px 0 5px -5px #d9d9d9, inset -9px 0 5px -5px #d9d9d9;
    }
`;

const Row = styled.tr`
    &:last-child td > div {
        border-bottom:2px solid #CFCBCB;
        border-radius:0 0 11px 11px;
    }
`;

const Properties = styled.td`
    padding-right:10px;
    padding:0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
    width:250px;
`;

const PropertiesInner = styled.div`
    background: #80869B;
    height:100%;
    color:#fff;
    padding:10px;
    border-bottom:2px solid #8B91A5!important;

    &.first {
        border-radius:11px 11px 0 0;
    }

    &.last {
        border-radius:0 0 11px 11px;
    }
`;

const ItemHeader = styled.td`
    padding-right:10px;
    min-height:50px;
    padding: 0 10px!important;
    margin:0;
    display: table-cell;
    height:100%;
    width:250px;
    position:relative;
`;

const ItemHeaderInner = styled.div`
    padding:5px 10px;
    background:#E86161;
    border-radius:11px 11px 0 0;
    color:#fff;
    height:100%;

    a {
        color:#fff!important;
    }
`;

const Contribution = styled.div`
    color:#FFA5A5;
    font-size:85%;
`;

const Delete = styled.div`
    position:absolute;
    top:-4px;
    right:7px;
    background:#FFA3A3;
    border-radius:20px;
    width:24px;
    height:24px;
    text-align:center;
    color:#E86161;
    cursor:pointer;
`;

const ScrollButton = styled.div`
    border-radius:30px;
    color: ${props => props.theme.darkblue};
    width:30px;
    height:30px;
    font-size:27px;
    cursor:pointer;
    transition: 0.2s filter;

    &.next {
        float: right;
    }
    &.back {
        float: left;
    }
    &:hover {
        filter: brightness(85%);
    }
`;

class ComparisonTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showPropertiesDialog: false,
            showShareDialog: false,
            containerScrollLeft: 0,
            showNextButton: false,
            showBackButton: false,
        }

        this.scrollContainer = React.createRef();
        this.scrollAmount = 500;
    }

    componentDidMount = () => {
        this.scrollContainer.current.addEventListener('scroll', this.handleScroll);
        this.defaultNextButtonState();
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.contributions !== prevProps.contributions && this.props.contributions.length > 3) {
            this.defaultNextButtonState();
        }
    }

    componentWillUnmount = () => {
        this.scrollContainer.current.removeEventListener('scroll', this.handleScroll);
    }

    defaultNextButtonState = () => {
        if (this.props.contributions.length > 3) {
            this.setState({
                showNextButton: true,
            });
        }
    }

    scrollNext = () => {
        this.scrollContainer.current.scrollLeft += this.scrollAmount
    }

    scrollBack = () => {
        this.scrollContainer.current.scrollLeft -= this.scrollAmount
    }

    handleScroll = () => {
        const { scrollWidth, offsetWidth, scrollLeft } = this.scrollContainer.current;

        this.setState({
            showBackButton: this.scrollContainer.current.scrollLeft !== 0,
            showNextButton: offsetWidth + scrollLeft !== scrollWidth
        });
    }

    render() {
        const scrollContainerClasses = classNames({
            'overflowing-left': this.state.showBackButton,
            'overflowing-right': this.state.showNextButton,
            'overflowing-both': this.state.showBackButton && this.state.showNextButton
        });

        return (
            <>
                <ScrollContainer ref={this.scrollContainer} className={scrollContainerClasses}>
                    <Table id="comparisonTable" className="mb-0" style={{ borderCollapse: 'collapse', tableLayout: 'fixed', height: 'max-content', width: '100%' }}>
                        <tbody className="table-borderless">
                            <tr className="table-borderless">
                                <Properties><PropertiesInner className="first">Properties</PropertiesInner></Properties>

                                {this.props.contributions.map((contribution, index) => {
                                    return (
                                        <ItemHeader key={`contribution${index}`}>
                                            <ItemHeaderInner>
                                                <Link to={reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, { resourceId: contribution.paperId, contributionId: contribution.id})}>
                                                    {contribution.title}
                                                </Link>
                                                <br />
                                                <Contribution>{contribution.contributionLabel}</Contribution>
                                            </ItemHeaderInner>

                                            {this.props.contributions.length > 2 &&
                                                <Delete onClick={() => this.props.removeContribution(contribution.id)}>
                                                    <Icon icon={faTimes} />
                                                </Delete>}
                                        </ItemHeader>
                                    )
                                })}
                            </tr>

                            {this.props.properties.map((property, index) => {
                                if (!property.active || !this.props.data[property.id]) {
                                    return null;
                                }

                                return (
                                    <Row key={`row${index}`}>
                                        <Properties>
                                            <PropertiesInner>
                                                {/*For when the path is available: <Tooltip message={property.path} colorIcon={'#606679'}>*/}
                                                {capitalize(property.label)}
                                                {/*</Tooltip>*/}
                                            </PropertiesInner>
                                        </Properties>
                                        {this.props.contributions.map((contribution, index2) => {
                                            const data = this.props.data[property.id][index2];

                                            return (
                                                <TableCell
                                                    key={index2}
                                                    data={data}
                                                />
                                            )
                                        })}
                                    </Row>
                                )
                            })}
                        </tbody>
                    </Table>
                </ScrollContainer>

                {this.state.showBackButton &&
                    <ScrollButton onClick={this.scrollBack} className="back"><Icon icon={faArrowCircleLeft} /></ScrollButton>
                }
                {this.state.showNextButton &&
                    <ScrollButton onClick={this.scrollNext} className="next"><Icon icon={faArrowCircleRight} /></ScrollButton>
                }
            </>
        );
    }
}

ComparisonTable.propTypes = {
    contributions: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    properties: PropTypes.array.isRequired,
    removeContribution: PropTypes.func.isRequired,
}

export default ComparisonTable;