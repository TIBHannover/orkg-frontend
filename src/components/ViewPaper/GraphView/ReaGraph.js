// import './style.css';
import { GraphCanvas, lightTheme } from 'reagraph';

export default function ReGraph() {
    const myTheme = {
        ...lightTheme,
        node: {
            ...lightTheme.node,
            color: '#000',
        },
    };
    const nodes = [
        {
            id: 'n-1',
            label: '1',
        },
        {
            id: 'n-2',
            label: '2',
        },
        {
            id: 'n-3',
            label: '3',
        },
        {
            id: 'n-4',
            label: '4',
        },
    ];
    const edges = [
        {
            id: '1->2',
            source: 'n-1',
            target: 'n-2',
            label: 'Edge 1-2',
        },
        {
            id: '1->3',
            source: 'n-1',
            target: 'n-3',
            label: 'Edge 1-3',
        },
        {
            id: '1->4',
            source: 'n-1',
            target: 'n-4',
            label: 'Edge 1-4',
        },
    ];
    return (
        <div className="App">
            <div style={{ border: 'solid 1px red', height: 550, width: 800, margin: 15 }}>
                <GraphCanvas theme={myTheme} nodes={nodes} edges={edges} />
            </div>
        </div>
    );
}

// import React from 'react';
// import { Chart } from 'regraph';

// export default function ReGraph() {
//     return (
//         <Chart
//             items={{
//                 luke: { label: { text: 'Luke Skywalker' } },
//                 leia: { label: { text: 'Princess Leia' } },
//                 link: {
//                     id1: 'luke',
//                     id2: 'leia',
//                     label: { text: 'Siblings' },
//                 },
//             }}
//         />
//     );
// }
