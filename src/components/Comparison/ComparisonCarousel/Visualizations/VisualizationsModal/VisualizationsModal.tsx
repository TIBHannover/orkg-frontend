import { faAdd, faLinkSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useVisualizations from 'components/Comparison/ComparisonCarousel/Visualizations/hooks/useVisualizations';
import Confirm from 'components/Confirmation/Confirmation';
import VisualizationPreview from 'components/Resource/Tabs/Preview/VisualizationPreview/VisualizationPreview';
import ActionButton from 'components/ActionButton/ActionButton';
import AddVisualizationModal from 'libs/selfVisModel/ComparisonComponents/AddVisualizationModal';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { FC, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { setIsOpenVisualizationModal, setUseReconstructedDataInVisualization } from 'slices/comparisonSlice';

type VisualizationsModalProps = {
    toggle: () => void;
};

const VisualizationsModal: FC<VisualizationsModalProps> = ({ toggle }) => {
    const [isLoadingUnlink, setIsLoadingUnlink] = useState(false);

    const { visualizations, unlinkVisualization } = useVisualizations();
    const dispatch = useDispatch();

    // @ts-expect-error awaiting refactoring where all comparison data is moved out of redux store
    const data = useSelector((state) => state.comparison.data);
    // @ts-expect-error awaiting refactoring where all comparison data is moved out of redux store
    const contributions = useSelector((state) => state.comparison.contributions);
    // @ts-expect-error awaiting refactoring where all comparison data is moved out of redux store
    const properties = useSelector((state) => state.comparison.properties);
    // @ts-expect-error awaiting refactoring where all comparison data is moved out of redux store
    const contributionsList = useSelector((state) => state.comparison.configuration.contributionsList);
    // @ts-expect-error awaiting refactoring where all comparison data is moved out of redux store
    const predicatesList = useSelector((state) => state.comparison.configuration.predicatesList);

    // needed when adding a new visualization
    const model = useMemo(() => new SelfVisDataModel(), []);

    // needed when adding a new visualization
    useEffect(() => {
        const integrateData = () => {
            model.integrateInputData({
                contributions,
                properties,
                data,
                contributionsList,
                predicatesList,
            });
            return true;
        };
        if (contributions && contributionsList.length > 0 && data && model) {
            integrateData();
        }
    }, [contributions, contributionsList, data, model, predicatesList, properties]);

    const handleUnlink = async (id: string) => {
        const isConfirmed = await Confirm({
            title: 'Unlink visualization',
            message:
                "Visualizations are published after they are created. This means it is not possible to delete a visualization. You can however unlink a comparison, it won't show up in the list of visualizations on the comparison page anymore.",
            proceedLabel: 'Unlink',
        });
        if (isConfirmed) {
            setIsLoadingUnlink(true);
            unlinkVisualization(id);
            setIsLoadingUnlink(false);
        }
    };

    return (
        <Modal isOpen toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Edit visualizations</ModalHeader>
            <ModalBody>
                {visualizations &&
                    visualizations.map((visualization) => (
                        <div className="border rounded p-2 mb-2 d-flex" key={visualization.id}>
                            <div style={{ width: 200 }} className="border-end d-flex align-items-center justify-content-center flex-shrink-0">
                                <VisualizationPreview id={visualization.id} width="200px" height="100px" className="" />
                            </div>
                            <div className="mx-3 d-flex justify-content-center flex-column border-end flex-grow-1">
                                <span className="fw-bold">{visualization.title}</span>
                                <div
                                    style={{
                                        WebkitLineClamp: 3,
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {visualization.description}
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <ActionButton
                                    title="Unlink visualization"
                                    icon={faLinkSlash}
                                    action={() => handleUnlink(visualization.id)}
                                    isLoading={isLoadingUnlink}
                                />
                            </div>
                        </div>
                    ))}

                <Button
                    color="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                        dispatch(setUseReconstructedDataInVisualization(false));
                        dispatch(setIsOpenVisualizationModal(true));
                    }}
                >
                    <FontAwesomeIcon icon={faAdd} /> Add visualization
                </Button>
            </ModalBody>
            <AddVisualizationModal />
        </Modal>
    );
};

export default VisualizationsModal;
