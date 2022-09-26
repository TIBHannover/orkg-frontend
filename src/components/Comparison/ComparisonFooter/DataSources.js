import { useSelector } from 'react-redux';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { ENTITIES } from 'constants/graphSettings';

function DataSources() {
    const isLoadingMetadata = useSelector(state => state.comparison.isLoadingMetadata);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const references = useSelector(state => state.comparison.comparisonResource.references);

    return (
        <div>
            {!isLoadingMetadata && !isFailedLoadingMetadata && references?.length > 0 && (
                <div id="dataSources" style={{ lineHeight: 1.5 }}>
                    <h5 className="mt-5">Data sources</h5>
                    <ul>
                        {references.map((reference, index) => (
                            <li key={`ref${index}`}>
                                <small>
                                    <i>
                                        <ValuePlugins type={ENTITIES.LITERAL}>{reference.label}</ValuePlugins>
                                    </i>
                                </small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default DataSources;
