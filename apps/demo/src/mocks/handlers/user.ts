import { http, HttpResponse } from 'msw';
import { mockUsers } from '../data/users';

export const userHandlers = [
  // GET /api/users - 전체 사용자 목록
  http.get('/api/users', () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers,
    });
  }),

  // GET /api/users/:id - 특정 사용자 조회
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: user,
    });
  }),

  // POST /api/users - 사용자 생성
  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json();

    return HttpResponse.json(
      {
        success: true,
        data: {
          id: String(mockUsers.length + 1),
          ...newUser,
        },
      },
      { status: 201 }
    );
  }),

  // PUT /api/users/:id - 사용자 수정
  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json();
    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: { ...user, ...updates },
    });
  }),

  // DELETE /api/users/:id - 사용자 삭제
  http.delete('/api/users/:id', ({ params }) => {
    const { id } = params;
    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  }),
];