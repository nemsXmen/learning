import type { ReactNode } from 'react';
import { AppFrame } from '../_components/app-frame';

export default function BoostLayout({ children }: { children: ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
