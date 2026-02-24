import { useCookies } from 'next-client-cookies';

import Alert from '@/components/Ui/Alert/Alert';

const NewComparisonsAlert = () => {
    const cookies = useCookies();
    const COOKIE_NAME = 'isNewComparisonAlertDismissed';

    const onDismissNewComparisonsAlert = () => {
        cookies.set(COOKIE_NAME, 'true', { expires: 30 });
    };

    const isNewComparisonsAlertDismissed = cookies.get(COOKIE_NAME);

    return (
        <Alert color="info" isOpen={!isNewComparisonsAlertDismissed} toggle={onDismissNewComparisonsAlert} className="container box-shadow">
            <strong>Comparison update:</strong> ORKG Comparisons have changed. We have added new features and improved the user interface. Comparisons
            might look slightly different, but the comparison data itself remains unchanged.{' '}
            <a href="https://orkg.org/page/comparison-update" target="_blank" rel="noopener noreferrer">
                Read more about the update here.
            </a>
        </Alert>
    );
};

export default NewComparisonsAlert;
