import React, { Component } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSearchMinus, faICursor, faVectorSquare, faSearchPlus, faExpandArrowsAlt, faSave } from '@fortawesome/free-solid-svg-icons';

const ToolbarStyled = styled.div`
    background: ${props => props.theme.darkblue};
    position: fixed;
    width: 100%;
    top: 72px;
    padding: 10px 7px;
    box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.13);
    z-index: 1;
`;

class Toolbar extends Component {
    render() {
        return (
            <ToolbarStyled>
                <Button color="darkblueDarker" size="sm">
                    <Icon icon={faICursor} className="mr-2" />
                    Text select
                </Button>
                <Button color="darkblueDarker" size="sm" className="ml-2">
                    <Icon icon={faVectorSquare} className="mr-2" />
                    Table select
                </Button>

                <div className="float-right">
                    <ButtonGroup style={{ marginRight: 10 }}>
                        <Button
                            color="darkblueDarker"
                            size="sm"
                            style={{ marginRight: 2 }}
                            onClick={() => this.props.changeZoom(this.props.zoom + 0.2)}
                        >
                            <Icon icon={faSearchPlus} />
                        </Button>
                        <Button
                            color="darkblueDarker"
                            size="sm"
                            style={{ marginRight: 2 }}
                            onClick={() => this.props.changeZoom(this.props.zoom - 0.2)}
                        >
                            <Icon icon={faSearchMinus} />
                        </Button>
                        <Button color="darkblueDarker" size="sm" onClick={() => this.props.changeZoom()}>
                            <Icon icon={faExpandArrowsAlt} />
                        </Button>
                    </ButtonGroup>
                    <Button color="darkblueDarker" size="sm">
                        <Icon icon={faSave} /> Save
                    </Button>
                </div>
            </ToolbarStyled>
        );
    }
}

export default Toolbar;
