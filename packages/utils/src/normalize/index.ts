/**
 * @file normalize/index.ts
 * @author gen-backoffice developer
 * @description common normalization utility functions for gen-backoffice
 * @module utils/normalize
 * 
 * @remarks
 * This module provides utility functions for normalizing data structures, such as converting objects to arrays, 
 * flattening nested objects, and other common normalization tasks. 
 * These functions are designed to help developers easily manipulate and transform data 
 * in a consistent manner across the gen-backoffice application.
 * 
 */

import { validateNonNegativeNumber } from "../validation/business"; 

export const normalize = (value: unknown): string => {
    return String(value ?? '').trim();
}

export const normalizeNullable = (value: unknown): string | null => {
    const v = normalize(value);
    return v === '' ? null : v;
}

export const normalizeUppercode = (value: unknown): string => {
    return normalize(value)
    .toUpperCase()
    .replace(/\s+/g, '_')
    .replace(/[^A-Z0-9_]/g, '');
}

export const normalizeYesNo = (value: unknown): 'Y' | 'N' => {
    const v = normalize(value).toUpperCase();
    if(v !== 'Y' && v !== 'N') {
        throw new Error(`Value should be either 'Y' or 'N'.`);
    }
    return v === 'Y' ? 'Y' : 'N';
}

export const normalizeSortOrder = (value: unknown): number | null => {
    const v = normalize(value);
    if( !v ) return null;
    
    const num = Number(v);
    validateNonNegativeNumber(num, 'sortOrder');
    return num;
}

export const normalizeWithDefault = (value: unknown, defaultValue: string): string => {
    const v = normalize(value);
    return v === '' ? defaultValue : v;
}

export const normalizeUseYnWithDefault = (value: unknown, defaultValue: 'Y' | 'N' = 'Y'): 'Y' | 'N' => {
    try {
        return normalizeYesNo(value);
    } catch {   
        return defaultValue;
    }
}