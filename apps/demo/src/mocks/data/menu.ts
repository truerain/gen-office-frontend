// apps/demo/src/mocks/data/menu.ts
import type { Menu } from '@/entities/system/menu/model/types';

let menuCache: Promise<Menu[]> | null = null;

export function loadMenuData() {
  if (!menuCache) {
    menuCache = fetch('/menu.csv')
      .then((res) => {
        if (!res.ok) throw new Error(`menu.csv fetch failed: ${res.status}`);
        return res.text();
      })
      .then(parseMenuCsv);
  }
  return menuCache;
}

function parseMenuCsv(csvText: string): Menu[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const menus: Menu[] = [];

  for (const line of lines) {
    if (!line.toUpperCase().startsWith('INSERT INTO')) continue;
    const values = extractSqlValues(line);
    if (!values || values.length < 10) continue;

    const menuId = toNumber(values[0]);
    const menuName = values[1];
    const menuNameEng = values[2];
    const menuDesc = values[3];
    const menuLevel = toNumber(values[4]);
    const parentMenuId = toNumber(values[5]);
    const displayFlag = values[6];
    const useFlag = values[7];
    const sortOrder = toNumber(values[8]);
    const url = values[9];

    menus.push({
      menuId,
      menuName: menuName ?? '',
      menuNameEng: menuNameEng ?? '',
      menuDesc: menuDesc ?? '',
      menuLevel,
      prntMenuId: parentMenuId,
      dsplFlag: displayFlag ?? '',
      useFlag: useFlag ?? '',
      sortOrder,
      url: url ?? '',
    });
  }

  return menus;
}

function extractSqlValues(line: string): Array<string | null> | null {
  const match = line.match(/VALUES\s*\((.*)\)\s*;/i);
  if (!match) return null;
  return splitSqlValues(match[1]);
}

function splitSqlValues(input: string): Array<string | null> {
  const values: Array<string | null> = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];

    if (inString) {
      if (ch === "'") {
        if (input[i + 1] === "'") {
          current += "'";
          i += 1;
        } else {
          inString = false;
        }
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === "'") {
      inString = true;
      continue;
    }

    if (ch === ',') {
      values.push(normalizeToken(current));
      current = '';
      continue;
    }

    current += ch;
  }

  values.push(normalizeToken(current));
  return values;
}

function normalizeToken(token: string): string | null {
  const trimmed = token.trim();
  if (!trimmed) return '';
  if (trimmed.toUpperCase() === 'NULL') return null;
  return trimmed;
}

function toNumber(value: string | null): number {
  if (!value) return 0;
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}
