import { Container, Row, TabContent, TabPane } from 'reactstrap';
import React, { Component } from 'react';
import styled from 'styled-components';
import classnames from 'classnames';
import GeneralSettings from '../components/UserSettings/GeneralSettings';
import Password from '../components/UserSettings/Password';

export const StyledSettingsMenu = styled.ul`
    list-style: none;
    padding: 0;
    padding-top: 15px;

    > li {
        padding: 9px 10px 9px 15px;
        margin-bottom: 5px;
        transition: 0.3s background;
        border-radius: ${props => props.theme.borderRadius};
        cursor: pointer;

        &.active,
        &:hover {
            background: ${props => props.theme.orkgPrimaryColor};
            color: #fff;
        }
        &.active a {
            color: #fff;
        }
    }
`;

class UserSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 'general'
        };
    }

    componentDidMount() {
        // Set document title
        document.title = 'User Settings - ORKG';
    }

    toggleTab = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    };

    render = () => (
        <>
            <Container className="p-0">
                <h1 className="h4 mt-4 mb-4">Account Settings</h1>
            </Container>
            <Container className="p-0">
                <Row>
                    <div className="col-3 justify-content-center">
                        <Container className="box rounded p-3">
                            <StyledSettingsMenu>
                                <li
                                    onClick={() => {
                                        this.toggleTab('general');
                                    }}
                                    className={classnames({
                                        active: this.state.activeTab === 'general' || this.state.activeTab === 'delete'
                                    })}
                                >
                                    <span>General settings</span>
                                </li>
                                <li
                                    className={classnames({ active: this.state.activeTab === 'password' })}
                                    onClick={() => {
                                        this.toggleTab('password');
                                    }}
                                >
                                    <span>Password</span>
                                </li>
                            </StyledSettingsMenu>
                        </Container>
                    </div>
                    <div className="col-9 justify-content-center">
                        <TabContent className="box rounded pt-4 pb-3 pl-5 pr-5" activeTab={this.state.activeTab}>
                            <TabPane tabId="general">
                                <GeneralSettings />
                            </TabPane>
                            <TabPane tabId="password">
                                <Password />
                            </TabPane>
                            <TabPane tabId="delete">test3</TabPane>
                        </TabContent>
                    </div>
                </Row>
            </Container>
        </>
    );
}

export default UserSettings;
