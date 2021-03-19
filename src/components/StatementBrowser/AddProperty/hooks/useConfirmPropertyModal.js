import Confirm from 'reactstrap-confirm';

const useConfirmPropertyModal = () => {
    const confirmProperty = async () =>
        await Confirm({
            title: 'Are you sure you need a new property?',
            message: 'Often there are existing properties that you can use as well. It is better to use existing properties than new ones.',
            cancelColor: 'light',
            confirmText: 'Create new property'
        });

    return { confirmProperty };
};

export default useConfirmPropertyModal;
