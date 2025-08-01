import { StoryFn } from '@storybook/react';
import { useState } from 'react';

import ModalWithLoading from '@/components/ModalWithLoading/ModalWithLoading';
import ModalBody from '@/components/Ui/Modal/ModalBody';
import ModalHeader from '@/components/Ui/Modal/ModalHeader';

export default {
    title: 'ModalWithLoading',
    component: ModalWithLoading,
};

const Template: StoryFn<typeof ModalWithLoading> = (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setIsOpen((v) => !v)}>
                Trigger confirm
            </button>

            <ModalWithLoading {...args} isOpen={isOpen} toggle={() => setIsOpen((v) => !v)}>
                <ModalHeader toggle={() => setIsOpen((v) => !v)}>Test</ModalHeader>
                <ModalBody>Content</ModalBody>
            </ModalWithLoading>
        </>
    );
};

export const Default = Template.bind({});
Default.args = {
    isLoading: false,
};

export const Loading = Template.bind({});
Loading.args = {
    isLoading: true,
};
