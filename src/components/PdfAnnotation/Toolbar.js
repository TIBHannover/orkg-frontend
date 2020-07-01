import React from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearchMinus, faSearchPlus, faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ToolbarStyled = styled.div`
    background: ${props => props.theme.darkblue};
    position: fixed;
    width: 100%;
    top: 72px;
    padding: 10px 7px;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.13);
    z-index: 1;
    display: flex;
    align-items: center;
`;

const Toolbar = props => {
    const pdf = useSelector(state => state.pdfAnnotation.pdf);

    return (
        <ToolbarStyled>
            <h1 className="h5 mb-0 ml-2" style={{ color: '#fff', height: 'auto' }}>
                {/* Set the height to overwrite styles from the PDF  */}
                Survey table extractor
            </h1>

            {/*
            <Button color="darkblueDarker" size="sm">
                <Icon icon={faICursor} className="mr-2" />
                Text select
            </Button>
            <Button
                active={this.props.selectedTool === 'tableSelect'}
                color="darkblueDarker"
                size="sm"
                className="ml-2"
                onClick={() => this.selectTool('tableSelect')}
            >
                <Icon icon={faVectorSquare} className="mr-2" />
                Table select
            </Button>
            */}
            <div className="ml-auto">
                <ButtonGroup className="mr-2">
                    <Button
                        color="darkblueDarker"
                        disabled={!pdf}
                        size="sm"
                        style={{ marginRight: 2 }}
                        onClick={() => props.changeZoom(props.zoom - 0.2)}
                    >
                        <Icon icon={faSearchMinus} />
                    </Button>
                    <Button
                        color="darkblueDarker"
                        disabled={!pdf}
                        size="sm"
                        style={{ marginRight: 2 }}
                        onClick={() => props.changeZoom(props.zoom + 0.2)}
                    >
                        <Icon icon={faSearchPlus} />
                    </Button>
                    <Button color="darkblueDarker" disabled={!pdf} size="sm" onClick={() => props.changeZoom()}>
                        <Icon icon={faExpandArrowsAlt} />
                    </Button>
                </ButtonGroup>
            </div>
        </ToolbarStyled>
    );
};

Toolbar.propTypes = {
    changeZoom: PropTypes.func.isRequired,
    zoom: PropTypes.number.isRequired
};

export default Toolbar;
