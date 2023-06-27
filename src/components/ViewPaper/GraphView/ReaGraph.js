// import './style.css';
import { GraphCanvas, lightTheme } from 'reagraph';
import * as PropTypes from 'prop-types';

export default function ReGraph(props) {
    console.log('show props', props);
    const myTheme = {
        ...lightTheme,
        node: {
            ...lightTheme.node,
            color: '#000',
        },
    };

    return (
        <div className="App">
            <div style={{ border: 'solid 1px red', margin: 15, width: 800, height: 800 }}>
                <GraphCanvas theme={myTheme} edges={props.edgesz} nodes={props.nodesz} />
            </div>
        </div>
    );
}
ReGraph.propTypes = {
    // eslint-disable-next-line no-undef
    nodesz: PropTypes.array,
    edgesz: PropTypes.array,
};
