import { Provider, useSelector } from 'react-redux';
import configureStore from 'store';
import { useState, useEffect } from 'react';
import Statements from 'components/StatementBrowser/Statements/Statements';
import PropTypes from 'prop-types';

const StatementBrowser = props => {
    const [store, setStore] = useState(null);
    const auth = useSelector(state => state.auth);
    const { newStore } = props;

    useEffect(() => {
        if (newStore) {
            setStore(
                configureStore({
                    auth
                })
            );
        }
    }, [auth, newStore]);

    // no new store is needed, so render the statement browser
    if (!newStore) {
        return <Statements {...props} />;
    }

    // store variable is not yet initialized
    if (!store) {
        return null;
    }

    // render the statement browser with a separate store
    return (
        <Provider store={store}>
            <Statements {...props} />
        </Provider>
    );
};

StatementBrowser.propTypes = {
    newStore: PropTypes.bool
};

StatementBrowser.defaultProps = {
    newStore: false
};

export default StatementBrowser;
