import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('provider App', () => {
  it('renders a single top level heading', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('UrbanPetly for providers');
  });

  it('renders the shared Button', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: 'Go to my listing' })).toBeInTheDocument();
  });

  it('shows the configured API URL', () => {
    render(<App />);

    expect(screen.getByText(/localhost:3000\/api\/v1/)).toBeInTheDocument();
  });
});
