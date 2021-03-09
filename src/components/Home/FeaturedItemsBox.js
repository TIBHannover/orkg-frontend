import { useState } from 'react';
import FeaturedComparisons from './FeaturedComparisons';
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
        border-bottom: 2px solid ${props => props.theme.ultraLightBlueDarker};
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

const SidebarStyledBox = styled.div`
    flex-grow: 1;
    overflow: hidden;
    @media (max-width: 768px) {
        margin-top: 20px;
    }
`;

export default function FeaturedItemsBox() {
    const [activeTab, setActiveState] = useState(2);

    return (
        <SidebarStyledBox className="box rounded-lg mt-3">
            <FeaturedTabs className="clearfix d-flex">
                <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={e => e.keyCode === 13 && setActiveState(2)}
                    className={`h6 col-md-6 text-center tab ${activeTab === 2 ? 'active' : ''}`}
                    onClick={() => setActiveState(2)}
                >
                    Comparisons
                </div>
                <div
                    role="button"
                    tabIndex="0"
                    onKeyDown={e => e.keyCode === 13 && setActiveState(1)}
                    className={`h6 col-md-6 text-center tab ${activeTab === 1 ? 'active' : ''}`}
                    onClick={() => setActiveState(1)}
                >
                    Papers
                </div>
            </FeaturedTabs>
            <TransitionGroup exit={false}>
                {activeTab === 1 ? (
                    <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <FeaturedPapers />
                    </AnimationContainer>
                ) : (
                    <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                        <FeaturedComparisons />
                    </AnimationContainer>
                )}
            </TransitionGroup>
        </SidebarStyledBox>
    );
}
