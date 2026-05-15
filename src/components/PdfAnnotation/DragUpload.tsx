import { faFile } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner, toast } from '@heroui/react';
import { FC, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';

import { uploadPdf } from '@/slices/pdfAnnotationSlice';

const baseClasses = 'mx-auto mt-[20%] w-[300px] text-center border-4 border-dashed rounded-2xl p-10 font-medium outline-none transition-colors';

const DragUpload: FC<{ pdf?: string }> = ({ pdf }) => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const onDrop = (files: File[]) => {
        // @ts-expect-error no types for uploadPdf
        dispatch(uploadPdf(files));
        setIsLoading(true);
    };

    const onDropRejected = () => {
        toast.danger('Error uploading your file, only PDF files are accepted');
        setIsLoading(false);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, onDropRejected, accept: { 'application/pdf': ['.pdf'] } });

    if (isLoading) {
        return (
            <div className={`${baseClasses} border-default-300 text-muted`}>
                <Spinner size="lg" color="current" />
                <div className="mt-3">Parsing your PDF...</div>
            </div>
        );
    }

    if (pdf) {
        return null;
    }

    const interactiveClasses = isDragActive
        ? 'border-default-500 text-foreground'
        : 'border-default-300 text-muted hover:border-default-500 hover:text-foreground focus:border-default-500 focus:text-foreground';

    return (
        <div {...getRootProps()} className={`${baseClasses} cursor-pointer ${interactiveClasses}`}>
            <FontAwesomeIcon icon={faFile} className="mb-4 text-[70px]" />
            <br />
            Drag &apos;n&apos; drop a PDF file here, or click here to upload one
            <input {...getInputProps()} />
        </div>
    );
};

export default DragUpload;
