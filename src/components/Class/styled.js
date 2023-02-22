import Tree from 'rc-tree';
import styled from 'styled-components';
import 'rc-tree/assets/index.css';

export const motion = {
    motionName: 'node-motion',
    motionAppear: false,
    onAppearStart: () => ({ height: 0 }),
    onAppearActive: node => ({ height: node.scrollHeight }),
    onLeaveStart: node => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
};

const AnimatedTree = styled(Tree)`
    .rc-tree-indent {
        line-height: 40px;
        height: 24px;
    }
    .rc-tree-indent-unit {
        position: relative;
        height: 100%;
    }
    .rc-tree-indent-unit::before {
        position: absolute;
        top: 0;
        inset-inline-end: 7px;
        bottom: -4px;
        border-inline-end: 1.4px dotted #ddd;
        content: '';
    }
    .rc-tree-node-content-wrapper:hover {
        background-color: ${props => props.theme.primary};
        color: #fff;
        opacity: 0.8;
        pointer-events: auto;
    }
    .rc-tree-node-selected {
        background-color: ${props => props.theme.primary};
        color: #fff;
        padding: 0 4px !important;
        box-shadow: 0 0 0 1px ${props => props.theme.primary};
        display: inline-block;
        opacity: 1;
    }
    .rc-tree-child-tree {
        display: block;
    }
    .node-motion {
        transition: all 0.3s;
        overflow-y: hidden;
    }
    .animation {
        .rc-tree-treenode {
            display: flex;

            .rc-tree-indent {
                position: relative;
                align-self: stretch;
                display: flex;
                flex-wrap: nowrap;
                align-items: stretch;

                .rc-tree-indent-unit {
                    position: relative;
                    height: 100%;

                    &::before {
                        position: absolute;
                        top: 0;
                        bottom: 0;
                        border-right: 1px solid blue;
                        left: 50%;
                        content: '';
                    }

                    &-end {
                        &::before {
                            display: none;
                        }
                    }

                    // End should ignore
                    // &-end {
                    //   &::before {
                    //     display: none;
                    //   }
                    // }
                }
            }

            .rc-tree-switcher-noop {
                &::before {
                    content: '';
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background: red;
                    border-radius: 100%;
                }
            }

            // Motion
            &-motion:not(.node-motion-appear-active) {
                // .rc-tree-indent-unit {
                //   &::before {
                //     display: none;
                //   }
                // }
            }
        }
    }
`;

export default AnimatedTree;
