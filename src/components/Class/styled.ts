import 'rc-tree/assets/index.css';

import Tree from 'rc-tree';
import styled from 'styled-components';

export const motion = {
    motionName: 'node-motion',
    motionAppear: false,
    onAppearStart: () => ({ height: 0 }),
    onAppearActive: (node: { scrollHeight: number }) => ({ height: node.scrollHeight }),
    onLeaveStart: (node: { offsetHeight: number }) => ({ height: node.offsetHeight }),
    onLeaveActive: () => ({ height: 0 }),
};

/*
 * AnimatedTree — rc-tree styled with ORKG CSS variables (see globals.css).
 * All colors resolve via CSS vars so the tree adapts automatically to dark mode.
 */
const AnimatedTree = styled(Tree as any)`
    color: var(--foreground);

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
        border-inline-end: 1.4px dotted var(--separator);
        content: '';
    }
    .rc-tree-switcher {
        color: var(--muted);
    }
    .rc-tree-node-content-wrapper {
        color: var(--foreground);
        border-radius: var(--radius);
        transition:
            background-color 0.15s ease,
            color 0.15s ease;
    }
    .rc-tree-node-content-wrapper:hover {
        background-color: var(--accent);
        color: var(--accent-foreground);
        opacity: 0.85;
        pointer-events: auto;
    }
    .rc-tree-node-selected {
        background-color: var(--accent) !important;
        color: var(--accent-foreground) !important;
        padding: 0 4px !important;
        box-shadow: 0 0 0 1px var(--accent);
        display: inline-block;
        opacity: 1;
    }
    .rc-tree-node-selected a,
    .rc-tree-node-content-wrapper:hover a {
        color: var(--accent-foreground);
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
                        border-right: 1px solid var(--separator);
                        left: 50%;
                        content: '';
                    }

                    &-end {
                        &::before {
                            display: none;
                        }
                    }
                }
            }

            .rc-tree-switcher-noop {
                &::before {
                    content: '';
                    display: inline-block;
                    width: 16px;
                    height: 16px;
                    background: var(--muted);
                    border-radius: 100%;
                }
            }
        }
    }
`;

export default AnimatedTree;
