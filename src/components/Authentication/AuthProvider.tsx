import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initKeycloak, keycloak } from 'services/keycloak';
import { firstLoad, updateAuth } from 'slices/authSlice';
import { AppDispatch } from 'slices/types';

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            initKeycloak()
                .then((authenticated: boolean) => {
                    dispatch(updateAuth({ authenticated }));
                    if (keycloak && keycloak.token) {
                        dispatch(firstLoad());
                    }
                    dispatch(updateAuth({ initialized: true }));
                })
                .catch((err: Error) => console.error('Failed to initialize Keycloak', err));
        }
    }, [dispatch]);

    return children;
};

export default AuthProvider;
