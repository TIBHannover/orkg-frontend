import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
// we have to keep the version of html-to-image below 1.11.13 because of a bug in the library
// see https://github.com/bubkoo/html-to-image/issues/516
import { toPng } from 'html-to-image';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { RootStore } from '@/slices/types';

function downloadImage(dataUrl: string, imageName: string) {
    const a = document.createElement('a');

    a.setAttribute('download', imageName);
    a.setAttribute('href', dataUrl);
    a.click();
}

function DownloadButton() {
    const { getNodes } = useReactFlow();
    const [isConvertingToImage, setIsConvertingToImage] = useState(false);
    const templateID = useSelector((state: RootStore) => state.templateEditor.id);

    const convertFlowToImage = () => {
        // we calculate a transform for the nodes so that all nodes are visible
        // we then overwrite the transform of the `.react-flow__viewport` element
        // with the style option of the html-to-image library
        const nodesBounds = getNodesBounds(getNodes());
        const imageWidth = nodesBounds.width ?? 1024;
        const imageHeight = nodesBounds.height ?? 768;
        const viewport = getViewportForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2, 0);

        return toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
            backgroundColor: 'transparent',
            width: imageWidth,
            height: nodesBounds.height,
            style: {
                width: imageWidth.toString(),
                height: imageHeight.toString(),
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
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
        <ButtonWithLoading className="me-1" color="light" isLoading={isConvertingToImage} onClick={onClick}>
            Download image
        </ButtonWithLoading>
    );
}

export default DownloadButton;
