import { Suspense } from 'react';
import Papers from '@/components/product/Papers';
export default async function Page({params}:{params:Promise<{item?:string[]}>}){const {item}=await params;return <Suspense fallback={<p>Loading…</p>}><Papers id={item?.[0]}/></Suspense>;}
