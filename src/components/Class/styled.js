import Tree from 'rc-tree';
import styled from 'styled-components';
import 'rc-tree/assets/index.css';

const AnimatedTree = styled(Tree)`
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
