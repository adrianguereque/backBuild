const { registerUser } = require('../controllers/userController'); // update path
const bcrypt = require('bcryptjs');
const { connectDB } = require('../config/db');

jest.mock('bcryptjs');
jest.mock('../config/db');

describe('registerUser', () => {
  let req, res, mockQuery;

  beforeEach(() => {
    mockQuery = jest.fn();
    const mockPool = {
      request: jest.fn(() => ({
        input: jest.fn().mockReturnThis(),
        query: mockQuery
      }))
    };
    connectDB.mockResolvedValue(mockPool);

    req = {
      body: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123'
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    bcrypt.hash.mockResolvedValue('hashedpassword');
  });

  it('should return 400 if missing fields', async () => {
    req.body = { email: '', name: '', password: '' };
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'All fields are required' });
  });

  it('should insert user and return 201 on success', async () => {
    mockQuery.mockResolvedValue({});
    await registerUser(req, res);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
  });

  it('should return 500 on database error', async () => {
    mockQuery.mockRejectedValue(new Error('DB Error'));
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
  });
});
