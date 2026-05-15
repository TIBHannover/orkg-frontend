import { ListBox, Select, Separator } from '@heroui/react';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';

const SUPPORTED_METHODS = ['Table', 'BarChart', 'ColumnChart', 'ScatterChart', 'LineChart', 'PieChart'];

const VisualizationSelector = ({ propagationFunction }) => {
    const selfVisModel = useMemo(() => {
        const model = new SelfVisDataModel();
        model.setRenderingEngine('Google-Charts');
        return model;
    }, []);

    const [visualizationMethod, setVisualizationMethod] = useState(() => selfVisModel.getRenderingMethod() || 'Table');

    useEffect(() => {
        selfVisModel.setRenderingMethod(visualizationMethod);
        propagationFunction?.();
    }, [visualizationMethod, selfVisModel, propagationFunction]);

    return (
        <div className="px-4">
            <Separator className="my-3" />
            <Select
                aria-label="Visualization method"
                value={visualizationMethod}
                onChange={(key) => setVisualizationMethod(String(key))}
                className="flex flex-row items-center gap-2"
            >
                <span className="text-sm whitespace-nowrap">Visualization method</span>
                <Select.Trigger className="min-w-40">
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {SUPPORTED_METHODS.map((method) => (
                            <ListBox.Item key={method} id={method} textValue={method}>
                                {method}
                                <ListBox.ItemIndicator />
                            </ListBox.Item>
                        ))}
                    </ListBox>
                </Select.Popover>
            </Select>
            <Separator className="my-3" />
        </div>
    );
};

VisualizationSelector.propTypes = {
    propagationFunction: PropTypes.func,
};

export default VisualizationSelector;
