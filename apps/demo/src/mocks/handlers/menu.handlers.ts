// apps/demo/src/mocks/handlers/menu.handlers.ts
import { http, HttpResponse } from 'msw';
import { loadMenuData } from '@/mocks/data/menu';

export const menuHandlers = [
  http.get('/api/menus', async ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '');

    let items = await loadMenuData();

    if (q) {
      items = items.filter((menu) => {
        const name = (menu.menu_name ?? '').toLowerCase();
        const nameEng = (menu.menu_name_eng ?? '').toLowerCase();
        const desc = (menu.menu_desc ?? '').toLowerCase();
        return name.includes(q) || nameEng.includes(q) || desc.includes(q);
      });
    }

    if (Number.isFinite(page) && Number.isFinite(pageSize) && page > 0 && pageSize > 0) {
      const start = (page - 1) * pageSize;
      items = items.slice(start, start + pageSize);
    }

    return HttpResponse.json(items);
  }),
];
