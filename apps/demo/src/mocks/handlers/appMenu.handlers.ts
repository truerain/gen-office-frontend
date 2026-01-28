// apps/demo/src/mocks/handlers/menu.handlers.ts
import { http, HttpResponse } from 'msw';
import { loadAppMenuData } from '@/mocks/data/menu';

export const appMenuHandlers = [
  http.get('/api/app-menus', async () => {
    /*
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const page = Number(url.searchParams.get('page') ?? '');
    const pageSize = Number(url.searchParams.get('pageSize') ?? '');
    */

    let items = await loadAppMenuData();


    return HttpResponse.json(items);
  }),
];
