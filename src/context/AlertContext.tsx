import React, { createContext, useContext, useState, useCallback } from 'react';
import CustomAlert, { AlertType } from '../components/common/CustomAlert';

interface AlertOptions {
    title: string;
    message: string;
    type?: AlertType;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

interface AlertContextType {
    showAlert: (options: AlertOptions) => void;
    hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<AlertOptions>({
        title: '',
        message: '',
        type: 'info',
    });

    const showAlert = useCallback((options: AlertOptions) => {
        setConfig(options);
        setVisible(true);
    }, []);

    const hideAlert = useCallback(() => {
        setVisible(false);
        if (config.onCancel) {
            config.onCancel();
        }
    }, [config]);

    const handleConfirm = useCallback(() => {
        if (config.onConfirm) {
            config.onConfirm();
        }
        setVisible(false);
    }, [config]);

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <CustomAlert
                visible={visible}
                title={config.title}
                message={config.message}
                type={config.type}
                confirmText={config.confirmText}
                cancelText={config.cancelText}
                showCancel={config.showCancel}
                onClose={hideAlert}
                onConfirm={handleConfirm}
            />
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
