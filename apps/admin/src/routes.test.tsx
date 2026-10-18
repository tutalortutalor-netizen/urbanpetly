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

describe('admin routes', () => {
  it('renders the back office at /', () => {
    renderAt('/');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('UrbanPetly admin');
  });

  it('renders a not found page for an unknown path', () => {
    renderAt('/does-not-exist');

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
  });
});
