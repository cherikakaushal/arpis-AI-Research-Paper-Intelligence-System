import { Suspense } from 'react';
import Auth from '@/components/product/Auth';
export default function Page(){return <Suspense fallback={<p>Loading…</p>}><Auth mode="login"/></Suspense>;}
