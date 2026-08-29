import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTheme } from 'next-themes';
import ThemeToggle from './ThemeToggle';

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));

const mockUseTheme = useTheme as jest.Mock;

describe('ThemeToggle', () => {
  it('shows a moon icon (switch-to-dark) when currently light', async () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme: jest.fn() });
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    });
  });

  it('shows a sun icon (switch-to-light) when currently dark', async () => {
    mockUseTheme.mockReturnValue({ resolvedTheme: 'dark', setTheme: jest.fn() });
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    });
  });

  it('toggles the theme when clicked', async () => {
    const setTheme = jest.fn();
    mockUseTheme.mockReturnValue({ resolvedTheme: 'light', setTheme });
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByLabelText('Switch to dark mode');
    await user.click(button);

    expect(setTheme).toHaveBeenCalledWith('dark');
  });
});
