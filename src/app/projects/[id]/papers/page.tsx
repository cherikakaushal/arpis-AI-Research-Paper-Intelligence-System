import { Suspense } from 'react';
import ProjectWorkspace from '@/components/product/ProjectWorkspace';
export default async function Page({params}:{params:Promise<{id:string}>}){const {id}=await params;return <Suspense fallback={<p>Loading...</p>}><ProjectWorkspace id={id} tab="papers"/></Suspense>;}
