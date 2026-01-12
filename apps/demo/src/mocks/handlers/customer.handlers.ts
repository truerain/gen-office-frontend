// apps/demo/src/mocks/handlers/customer.handlers.ts
import { http, HttpResponse } from 'msw';
import type { Customer } from '@/entities/customer/model/types';
import { mockCustomers } from '@/mocks/data/customer';
import type { CreateCustomerInput, UpdateCustomerInput } from '@/entities/customer/model/types';

function uid() {
  return `c_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export const customerHandlers = [
  // LIST
  http.get('/api/customers', ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const status = url.searchParams.get('status'); // ACTIVE / INACTIVE

    let items = mockCustomers.slice();

    if (q) items = items.filter((c) => (c.name ?? '').toLowerCase().includes(q));
    if (status) items = items.filter((c) => c.status === status);

    return HttpResponse.json({ items, total: items.length });
  }),

  // CREATE
  http.post('/api/customers', async ({ request }) => {
    const body = (await request.json()) as CreateCustomerInput;

    if (!body?.name?.trim()) {
      return new HttpResponse('name is required', { status: 400 });
    }

    const newCustomer : Customer = {
      id: uid(),
      name: body.name.trim(),
      phone: body.phone ?? '',
      company: '(주)테크코리아',
      email: body.email ?? '',
      status: body.status ?? 'ACTIVE',
      registeredAt: '',
      lastContactAt: '',
      totalOrders: 0,
      totalSpent: 0,
      grade: 'platinum',

      //createdAt: new Date().toISOString().slice(0, 10),
    } ;

    mockCustomers.unshift(newCustomer);
    return HttpResponse.json(newCustomer, { status: 201 });
  }),

  // UPDATE
  http.patch('/api/customers/:id', async ({ params, request }) => {
    const id = String(params.id);
    const body = (await request.json()) as UpdateCustomerInput;

    const idx = mockCustomers.findIndex((c) => c.id === id);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    mockCustomers[idx] = {
      ...mockCustomers[idx],
      ...body,
      name: body.name?.trim() ?? mockCustomers[idx].name,
    };

    return HttpResponse.json(mockCustomers[idx]);
  }),

  // DELETE
  http.delete('/api/customers/:id', ({ params }) => {
    const id = String(params.id);
    const idx = mockCustomers.findIndex((c) => c.id === id);
    if (idx === -1) return new HttpResponse('not found', { status: 404 });

    mockCustomers.splice(idx, 1);
    return HttpResponse.json({ ok: true });
  }),
];
