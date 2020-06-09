import React from 'react';
import AutoComplete from 'components/StatementBrowser/AutoComplete';

export function RendererComponent(props) {
    // The avaiable renderer-related props are:
    // - row (row index)
    // - col (column index)
    // - prop (column property name)
    // - TD (the HTML cell element)
    // - cellProperties (the cellProperties object for the edited cell)
    if (props.row === 0) {
        return <div style={{ color: 'grey', fontStyle: 'italic' }}>{props.value}</div>;
    }
    return <>{props.value}</>;
}
