import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppRoutes } from './routes';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe('provider routes', () => {
  it('renders the dashboard at /', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('UrbanPetly for providers');
  });

  it('renders a not found page for an unknown path', () => {
    renderAt('/does-not-exist');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
  });
});
