export const validateNoWhitespace = (value: string, field: string): void => {
    if (/\s/.test(value)) {
        throw new Error(`${field} should not contain whitespace.`);
    }
};

export const validateUppercaseCode = (value: string, field: string): void => {
    if (!/^[A-Z0-9_]+$/.test(value)) {
        throw new Error(`${field} should contain only uppercase letters, numbers, or underscores.`);
    }
};

export const validateYesNo = (value: string, field: string = 'useYn'): void => {
    const normalized = value.toUpperCase();
    if (normalized !== 'Y' && normalized !== 'N') {
        throw new Error(`${field} should be either 'Y' or 'N'.`);
    }
};

export const validateNonNegativeNumber = (value: number, field: string): void => {
    if(!Number.isFinite(value) || value < 0) {
        throw new Error(`${field} should be a non-negative number.`);
    }
};

export const validateRequired = (value: string, field: string): void => {
    if(!value || value.trim() === '') {
        throw new Error(`${field} is required.`);
    }
}
