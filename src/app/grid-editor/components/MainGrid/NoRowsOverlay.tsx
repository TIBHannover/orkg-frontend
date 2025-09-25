'use client';

import { faTable } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NoRowsOverlay = () => {
    return (
        <div className="tw:flex tw:items-center tw:justify-center tw:h-full tw:w-full">
            <div className="tw:text-center tw:py-8 tw:px-12">
                <div className="tw:mb-4">
                    <FontAwesomeIcon icon={faTable} className="tw:text-4xl tw:text-gray-400 tw:mb-3" />
                </div>
                <h5 className="tw:text-gray-600 tw:font-semibold tw:mb-3">No rows to show</h5>
                <p className="tw:text-gray-500 tw:mb-4 tw:leading-relaxed">Start adding properties or use templates by using the buttons below</p>
            </div>
        </div>
    );
};

export default NoRowsOverlay;
