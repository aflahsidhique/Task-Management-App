import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import { useAuth } from '../../context/AuthContext';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('LoginPage', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('pre-fills the demo credentials', () => {
    mockUseAuth.mockReturnValue({ login: jest.fn() });
    render(<LoginPage />);

    expect(screen.getByLabelText('Email')).toHaveValue('aflahgraphy@gmail.com');
    expect(screen.getByLabelText('Password')).toHaveValue('Demo@12345');
  });

  it('calls login with the current field values on submit', async () => {
    const login = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({ login });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.clear(screen.getByLabelText('Email'));
    await user.type(screen.getByLabelText('Email'), 'someone@example.com');
    await user.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('someone@example.com', 'Demo@12345');
    });
  });

  it('shows a generic error message when login fails', async () => {
    const login = jest.fn().mockRejectedValue(new Error('401'));
    mockUseAuth.mockReturnValue({ login });
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByText('Sign in'));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });
});
