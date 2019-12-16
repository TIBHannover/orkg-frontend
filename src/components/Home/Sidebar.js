import React, { Component } from 'react';
import RecentlyAddedPapers from './RecentlyAddedPapers';
import FeaturedPapers from './FeaturedPapers';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

const AnimationContainer = styled(CSSTransition)`
    &.fadeIn-enter {
        opacity: 0;
    }

    &.fadeIn-enter.fadeIn-enter-active {
        opacity: 1;
        transition: 1s opacity;
    }
`;

const FeaturedTabs = styled.div`
    .tab {
        margin-bottom: 0;
        padding: 15px;
        color: #bebbac;
        cursor: pointer;
        border-bottom: 2px solid #fff;
        -webkit-transition: border 500ms ease-out;
        -moz-transition: border 500ms ease-out;
        -o-transition: border 500ms ease-out;
        transition: border 500ms ease-out;
        &.active,
        &:hover {
            border-bottom: 2px solid #e86161;
            color: #646464;
        }
    }
`;

class Sidebar extends Component {
    constructor(props) {
        super(props);

        this.state = {
            activeTab: 2
        };
    }

    toggle = tab => {
        if (this.state.activeTab !== tab) {
            this.setState({ activeTab: tab });
        }
    };

    render = () => {
        let rightSidebar;

        switch (this.state.activeTab) {
            case 1:
            default:
                rightSidebar = (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <FeaturedPapers />
                    </AnimationContainer>
                );
                break;
            case 2:
                rightSidebar = (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <RecentlyAddedPapers />
                    </AnimationContainer>
                );
                break;
        }

        return (
            <div className="box rounded-lg" style={{ flexGrow: '1', overflow: 'hidden' }}>
                <FeaturedTabs className="clearfix row">
                    <div className={`h6 col-md-6 text-center tab ${this.state.activeTab === 2 ? 'active' : ''}`} onClick={() => this.toggle(2)}>
                        Recently added papers
                    </div>
                    <div className={`h6 col-md-6 text-center tab ${this.state.activeTab === 1 ? 'active' : ''}`} onClick={() => this.toggle(1)}>
                        Featured papers
                    </div>
                </FeaturedTabs>
                <TransitionGroup exit={false}>{rightSidebar}</TransitionGroup>
            </div>
        );
    };
}

Sidebar.propTypes = {};

export default Sidebar;
