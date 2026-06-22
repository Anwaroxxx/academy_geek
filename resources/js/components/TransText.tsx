import { useAppContext } from '../context/appContext';
import React from 'react';

interface TextProps {
    ar: string;
    fr: string;
    en: string;
}

export const TransText: React.FC<TextProps> = (props) => {
    const appContext = useAppContext();
    const selectedLanguage = appContext?.selectedLanguage ?? localStorage.getItem('language') ?? 'en';
    const allowedLanguages = ['ar', 'fr', 'en'];

    if (!allowedLanguages.includes(selectedLanguage as keyof TextProps)) {
        throw new Error(`Invalid language: ${selectedLanguage}. Supported languages are: ${allowedLanguages.join(', ')}`);
    }

    return props[selectedLanguage as keyof TextProps];
};
