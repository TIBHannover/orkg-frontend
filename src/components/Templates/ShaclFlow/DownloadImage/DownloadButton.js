import ButtonWithLoading from 'components/ButtonWithLoading/ButtonWithLoading';
import { toPng } from 'html-to-image';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { getRectOfNodes, getTransformForBounds, useReactFlow } from 'reactflow';

function downloadImage(dataUrl, imageName) {
    const a = document.createElement('a');

    a.setAttribute('download', imageName);
    a.setAttribute('href', dataUrl);
    a.click();
}

function DownloadButton() {
    const { getNodes } = useReactFlow();
    const [isConvertingToImage, setIsConvertingToImage] = useState(false);
    const templateID = useSelector(state => state.templateEditor.templateID);

    const convertFlowToImage = () => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const nodesBounds = getRectOfNodes(getNodes());
        const imageWidth = nodesBounds.width ?? 1024;
        const imageHeight = nodesBounds.height ?? 768;
        const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);

        return toPng(document.querySelector('.react-flow__viewport'), {
            backgroundColor: 'transparent',
            width: imageWidth,
            height: nodesBounds.height,
            style: {
                width: imageWidth,
                height: imageHeight,
                transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
            },
        });
    };
    const onClick = async () => {
        setIsConvertingToImage(true);
        const dataUrl = await convertFlowToImage();
        setIsConvertingToImage(false);
        downloadImage(dataUrl, `template-${templateID}.png`);
    };

    return (
        <ButtonWithLoading color="light" isLoading={isConvertingToImage} onClick={onClick}>
            Download image
        </ButtonWithLoading>
    );
}

export default DownloadButton;
