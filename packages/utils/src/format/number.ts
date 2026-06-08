/**
 * Number formatting utilities
 */

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('ko-KR', options).format(value);
};

export const formatCurrency = (value: number, currency: string = 'KRW'): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
  }).format(value);
};

export const formatPercent = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};

// Formats a number with commas as thousand separators
export const formatNegativeNumber = (value: number, options?: { decimals?: number }): string => {
  const { decimals = 0 } = options || {};
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);

  return value < 0 ? `△${formatted}` : formatted;
}

// Formats a number with an arrow indicating increase or decrease, and optional percentage sign
export const formatDeltaFlag = (value: number, options?: { decimals?: number, isPercent?: boolean }): string => {
  const { decimals = 0, isPercent = false } = options || {};
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat('ko-KR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(abs);
  const suffix = isPercent ? '%' : '';
  
  return value > 0 ? `${formatted}${suffix}↑` : value < 0 ? `${formatted}${suffix}↓` : `-${formatted}${suffix}`;
}

/*
 * 차트에서 다음 단위로 넘어가는 숫자
 * 예: 1234 -> 2000,  9500 -> 10000, 0.56 -> 0.6
 * options.decimals: 소수점 자릿수 (기본값: 0)
 */
export const cellToNextUnit = (value: number): number => {
  if(value <= 0) return 0;
  const exponent = Math.floor(Math.log10(value));
  const unit = Math.pow(10, exponent);
  return Math.ceil(value / unit) * unit;
}

/*
 * 차트에서 yAxis tick 레이블 축소를 위한 divisor 계산
 * 1000 이상인 값은 자릿수-3 만큼 10의 제곱을 나눔
 */
export const calcAxisDivisor = (max: number): number => {
  if(max <= 1000) return 1;
  const exponent = Math.floor(Math.log10(max) - 2);
  return Math.pow(10, exponent);
}


