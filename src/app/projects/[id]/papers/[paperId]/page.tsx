import { Suspense } from 'react';
import Papers from '@/components/product/Papers';
export default async function Page({params}:{params:Promise<{id:string;paperId:string}>}){const {id,paperId}=await params;return <Suspense fallback={<p>Loading...</p>}><Papers id={paperId} projectId={id}/></Suspense>;}
