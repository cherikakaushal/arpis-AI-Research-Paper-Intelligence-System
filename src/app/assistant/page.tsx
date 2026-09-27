import { Suspense } from 'react';
import Assistant from '@/components/product/Assistant';
export default function Page(){return <Suspense fallback={<p>Loading…</p>}><Assistant/></Suspense>;}
