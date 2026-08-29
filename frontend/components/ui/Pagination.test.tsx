import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Pagination from './Pagination';

describe('Pagination', () => {
  it('disables Previous on the first page and Next on the last page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={jest.fn()} />);
    expect(screen.getByText('Previous')).toBeDisabled();
    expect(screen.getByText('Next')).not.toBeDisabled();
  });

  it('calls onPageChange with the next page number', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByText('Previous'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with the clicked page number', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={1} totalPages={4} onPageChange={onPageChange} />);

    await user.click(screen.getByText('3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('does not call onPageChange when Next is clicked on the last page', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();
    render(<Pagination currentPage={3} totalPages={3} onPageChange={onPageChange} />);

    await user.click(screen.getByText('Next'));
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
