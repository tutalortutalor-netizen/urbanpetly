import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Home, { meta } from './home';

describe('web home route', () => {
  it('renders the customer landing page', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('UrbanPetly');
  });

  // The prerendered home page is an SEO page (ADR-022, docs/06-nfr.md): it needs
  // a unique title and description in the HTML, not injected after hydration.
  it('declares a title and a description for prerendering', () => {
    const tags = meta({} as Parameters<typeof meta>[0]) as Array<Record<string, string>>;

    expect(tags.find((tag) => 'title' in tag)?.title).toMatch(/UrbanPetly/);
    expect(tags.find((tag) => tag.name === 'description')?.content).toBeTruthy();
  });
});
