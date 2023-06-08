// import './style.css';
import { GraphCanvas } from 'reagraph';
import { range } from 'd3-array';

export default function ReGraph() {
    return (
        <div className="App">
            {range(10).map(i => (
                <div key={i} style={{ border: 'solid 1px red', height: 550, width: 800, margin: 15, position: 'absolute' }}>
                    <GraphCanvas
                        cameraMode="pan"
                        layoutType="forceDirected2d"
                        sizingType="none"
                        nodes={[
                            {
                                id: '1',
                                label: '1',
                            },
                            {
                                id: '2',
                                label: '2',
                            },
                        ]}
                        edges={[
                            {
                                source: '1',
                                target: '2',
                                id: '1-2',
                                label: '1-2',
                            },
                            {
                                source: '2',
                                target: '1',
                                id: '2-1',
                                label: '2-1',
                            },
                        ]}
                    />
                </div>
            ))}
        </div>
    );
}
