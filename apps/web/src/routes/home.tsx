import type { MetaFunction } from 'react-router';

import { App } from '../App';

export const meta: MetaFunction = () => [
  { title: 'UrbanPetly - pet services in Delhi NCR' },
  {
    name: 'description',
    content: 'Find, compare and contact trusted pet services across Delhi NCR.',
  },
];

export default function Home() {
  return <App />;
}
