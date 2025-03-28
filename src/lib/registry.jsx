'use client';

import { useServerInsertedHTML } from 'next/navigation';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

// From: https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-components
const StyledComponentsRegistry = ({ children }) => {
    // Only create stylesheet once with lazy initial state
    // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
    const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());

    useServerInsertedHTML(() => {
        const styles = styledComponentsStyleSheet.getStyleElement();
        styledComponentsStyleSheet.instance.clearTag();
        return <>{styles}</>;
    });

    if (typeof window !== 'undefined') return <>{children}</>;

    return <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>{children}</StyleSheetManager>;
};

StyledComponentsRegistry.propTypes = {
    children: PropTypes.node.isRequired,
};

export default StyledComponentsRegistry;
