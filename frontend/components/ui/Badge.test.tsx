import { render, screen } from '@testing-library/react';
import Badge, { statusLabel, statusToVariant } from './Badge';

describe('statusToVariant', () => {
  it.each([
    ['ON_TRACK', 'success'],
    ['DONE', 'success'],
    ['COMPLETED', 'success'],
    ['LOW', 'success'],
    ['AT_RISK', 'warning'],
    ['IN_REVIEW', 'warning'],
    ['MEDIUM', 'warning'],
    ['DELAYED', 'danger'],
    ['HIGH', 'danger'],
    ['IN_PROGRESS', 'info'],
    ['TODO', 'info'],
    ['SOMETHING_UNKNOWN', 'neutral'],
  ])('maps %s to the %s variant', (status, expected) => {
    expect(statusToVariant(status)).toBe(expected);
  });
});

describe('statusLabel', () => {
  it('title-cases snake_case status strings', () => {
    expect(statusLabel('IN_PROGRESS')).toBe('In Progress');
    expect(statusLabel('DONE')).toBe('Done');
    expect(statusLabel('AT_RISK')).toBe('At Risk');
  });
});

describe('Badge', () => {
  it('renders its children with the variant class applied', () => {
    render(<Badge variant="danger">Overdue</Badge>);
    const badge = screen.getByText('Overdue');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-danger-bg');
  });
});
