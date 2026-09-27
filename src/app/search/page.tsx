import { Suspense } from 'react';
import { Search } from '@/components/product/Utilities';
export default function Page(){return <Suspense fallback={<p>Loading…</p>}><Search/></Suspense>;}
