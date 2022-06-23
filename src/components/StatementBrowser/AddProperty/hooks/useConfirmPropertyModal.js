import Confirm from 'components/Confirmation/Confirmation';

const useConfirmPropertyModal = () => {
    const confirmProperty = async () =>
        await Confirm({
            title: 'Are you sure you need a new property?',
            message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
            proceedLabel: 'Create new property',
        });

    return { confirmProperty };
};

export default useConfirmPropertyModal;
