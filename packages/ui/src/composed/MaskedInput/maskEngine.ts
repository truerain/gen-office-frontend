// packages/ui/src/composed/MaskedInput/maskEngine.ts
// Provides lightweight fixed-pattern mask formatting utilities.

export type MaskTokenDefinitions = Record<string, RegExp>;

export type MaskFormatResult = {
  value: string;
  unmaskedValue: string;
  completed: boolean;
};

export const defaultMaskDefinitions: MaskTokenDefinitions = {
  '0': /\d/,
  A: /[A-Za-z]/,
  '*': /[A-Za-z0-9]/,
};

function testDefinition(definition: RegExp, value: string) {
  definition.lastIndex = 0;
  return definition.test(value);
}

function resolveDefinitions(definitions?: MaskTokenDefinitions) {
  return {
    ...defaultMaskDefinitions,
    ...definitions,
  };
}

function isMaskToken(value: string, definitions: MaskTokenDefinitions) {
  return Object.prototype.hasOwnProperty.call(definitions, value);
}

export function getMaskTokenCount(mask: string, definitions?: MaskTokenDefinitions) {
  const resolvedDefinitions = resolveDefinitions(definitions);

  return Array.from(mask).filter((maskChar) => isMaskToken(maskChar, resolvedDefinitions)).length;
}

export function extractUnmaskedValue(
  input: string,
  mask: string,
  definitions?: MaskTokenDefinitions
) {
  const resolvedDefinitions = resolveDefinitions(definitions);
  const acceptedValues: string[] = [];
  const maskTokens = Array.from(mask).filter((maskChar) => isMaskToken(maskChar, resolvedDefinitions));
  let tokenIndex = 0;

  for (const inputChar of Array.from(input)) {
    if (tokenIndex >= maskTokens.length) {
      break;
    }

    const token = maskTokens[tokenIndex];
    const definition = resolvedDefinitions[token];

    if (definition && testDefinition(definition, inputChar)) {
      acceptedValues.push(inputChar);
      tokenIndex += 1;
    }
  }

  return acceptedValues.join('');
}

export function formatMaskedValue(
  input: string,
  mask: string,
  definitions?: MaskTokenDefinitions
): MaskFormatResult {
  const resolvedDefinitions = resolveDefinitions(definitions);
  const sourceChars = Array.from(input);
  const outputChars: string[] = [];
  const unmaskedChars: string[] = [];
  let sourceIndex = 0;
  let completedTokenCount = 0;

  for (const maskChar of Array.from(mask)) {
    const definition = resolvedDefinitions[maskChar];

    if (!definition) {
      if (unmaskedChars.length > 0 && sourceIndex < sourceChars.length) {
        outputChars.push(maskChar);
      }
      continue;
    }

    let matchedChar: string | undefined;

    while (sourceIndex < sourceChars.length) {
      const sourceChar = sourceChars[sourceIndex];
      sourceIndex += 1;

      if (testDefinition(definition, sourceChar)) {
        matchedChar = sourceChar;
        break;
      }
    }

    if (!matchedChar) {
      break;
    }

    outputChars.push(matchedChar);
    unmaskedChars.push(matchedChar);
    completedTokenCount += 1;
  }

  return {
    value: outputChars.join(''),
    unmaskedValue: unmaskedChars.join(''),
    completed: completedTokenCount === getMaskTokenCount(mask, resolvedDefinitions),
  };
}

export function getDefaultInputMode(mask: string, definitions?: MaskTokenDefinitions) {
  const resolvedDefinitions = resolveDefinitions(definitions);
  const tokenChars = Array.from(mask).filter((maskChar) => isMaskToken(maskChar, resolvedDefinitions));

  if (tokenChars.length > 0 && tokenChars.every((tokenChar) => tokenChar === '0')) {
    return 'numeric';
  }

  return undefined;
}

export function getCaretPositionForUnmaskedIndex(
  maskedValue: string,
  mask: string,
  unmaskedIndex: number,
  definitions?: MaskTokenDefinitions
) {
  if (unmaskedIndex <= 0) {
    return 0;
  }

  const resolvedDefinitions = resolveDefinitions(definitions);
  let seenTokens = 0;

  for (let index = 0; index < maskedValue.length; index += 1) {
    const maskChar = mask[index];

    if (maskChar && isMaskToken(maskChar, resolvedDefinitions)) {
      seenTokens += 1;
    }

    if (seenTokens >= unmaskedIndex) {
      return index + 1;
    }
  }

  return maskedValue.length;
}
