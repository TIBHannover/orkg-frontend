'use client';

import { faTable } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert } from '@heroui/react';

const NoRowsOverlay = () => {
    return (
        <div className="flex items-center justify-center h-full w-full p-6">
            <Alert status="default" className="max-w-md">
                <Alert.Indicator>
                    <FontAwesomeIcon icon={faTable} />
                </Alert.Indicator>
                <Alert.Content>
                    <Alert.Title>No rows to show</Alert.Title>
                    <Alert.Description>Start adding properties or use templates by using the buttons below.</Alert.Description>
                </Alert.Content>
            </Alert>
        </div>
    );
};

export default NoRowsOverlay;
