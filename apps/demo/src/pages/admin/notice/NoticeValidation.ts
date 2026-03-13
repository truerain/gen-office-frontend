export type NoticeDraftValidationInput = {
  title: string;
  content: string;
  dispStartDate: string;
  dispEndDate: string;
};

export type NoticeDraftField =
  | 'title'
  | 'content'
  | 'dispStartDate'
  | 'dispEndDate';

export type NoticeDraftValidationResult = {
  ok: boolean;
  fieldErrors: Partial<Record<NoticeDraftField, string>>;
  summaryMessage: string | null;
};

function normalize(value: unknown): string {
  return String(value ?? '').trim();
}

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateNoticeDraft(
  input: NoticeDraftValidationInput
): NoticeDraftValidationResult {
  const fieldErrors: NoticeDraftValidationResult['fieldErrors'] = {};

  if (!normalize(input.title)) {
    fieldErrors.title = 'Please enter a notice title.';
  }

  if (!stripHtml(input.content)) {
    fieldErrors.content = 'Please enter notice content.';
  }

  if (!normalize(input.dispStartDate)) {
    fieldErrors.dispStartDate = 'Please select a start date.';
  }

  if (!normalize(input.dispEndDate)) {
    fieldErrors.dispEndDate = 'Please select an end date.';
  }

  const messages = Object.values(fieldErrors);
  return {
    ok: messages.length === 0,
    fieldErrors,
    summaryMessage: messages.length > 0 ? messages[0] ?? 'Please check required fields.' : null,
  };
}
