import React, { Component } from 'react';
import { ListGroup, ListGroupItem } from 'reactstrap';
import AddProperty from 'components/StatementBrowser/AddProperty';
import TemplateHeader from 'components/AddPaper/Contributions/TemplateWizzard/TemplateHeader';
import PropertyItem from 'components/AddPaper/Contributions/TemplateWizzard/PropertyItem';
import styled from 'styled-components';
import PropTypes from 'prop-types';

export const TemplateStyle = styled(ListGroup)`
    .headerOptions {
        display: none;
    }
    &:hover .headerOptions {
        display: inline-block;
        span {
            background-color: ${props => props.theme.buttonDark};
            color: ${props => props.theme.ultraLightBlue};
        }
    }
`;

export const AddPropertWrapper = styled(ListGroupItem)`
    border-top: 0 !important;
    padding: 0 !important;
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
    & .propertyHolder {
        height: 30px;
        background-color: ${props => props.theme.ultraLightBlue};
    }
`;

class ContributionTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editPropertyLabel: false,
            editValueLabel: true
        };
        this.inputRefs = React.createRef();
        this.inputRefsValue = React.createRef();
        this.inputRefsProperty = React.createRef();
    }

    render() {
        return (
            <TemplateStyle className={'mt-3 mb-5'}>
                <TemplateHeader label={this.props.label} />
                {this.props.properties.map((p, index) => (
                    <PropertyItem key={`pi${index}`} label={p.label} inTemplate={true} values={p.values} />
                ))}

                <AddPropertWrapper>
                    <div className={'row no-gutters'}>
                        <div className={'col-4 propertyHolder'} />
                    </div>
                    <AddProperty inTemplate={true} contextStyle="Template" />
                </AddPropertWrapper>
            </TemplateStyle>
        );
    }
}

ContributionTemplate.propTypes = {
    label: PropTypes.string.isRequired,
    properties: PropTypes.array.isRequired,
    inTemplate: PropTypes.bool.isRequired
};

ContributionTemplate.defaultProps = {
    inTemplate: false,
    label: 'Type',
    properties: []
};

export default ContributionTemplate;
