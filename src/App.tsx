/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeroSection } from './components/HeroSection.tsx';

export default function App() {
  return (
    <main className="w-full min-h-screen bg-black overflow-hidden flex flex-col justify-center items-center">
      <HeroSection />
    </main>
  );
}

