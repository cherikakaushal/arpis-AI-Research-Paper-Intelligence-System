import { Suspense } from 'react';
import Records from '@/components/product/Records';
export default async function Page({params}:{params:Promise<{item?:string[]}>}){const {item}=await params;return <Suspense fallback={<p>Loading…</p>}><Records kind="datasets" id={item?.[0]}/></Suspense>;}
