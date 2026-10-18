import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './Button.js';

describe('Button', () => {
  it('renders an accessible button with its label', () => {
    render(<Button>Send enquiry</Button>);

    expect(screen.getByRole('button', { name: 'Send enquiry' })).toBeInTheDocument();
  });

  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Filter</Button>);

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('calls onClick when activated with the keyboard', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Book</Button>);

    await userEvent.tab();
    expect(screen.getByRole('button')).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled and marked busy while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Saving
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps caller class names alongside the variant classes', () => {
    render(
      <Button variant="ghost" className="w-full">
        Clear
      </Button>,
    );

    expect(screen.getByRole('button').className).toContain('w-full');
  });
});
