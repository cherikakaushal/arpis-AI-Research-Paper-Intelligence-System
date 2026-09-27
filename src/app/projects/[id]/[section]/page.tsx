import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProjectWorkspace from '@/components/product/ProjectWorkspace';
export default async function Page({params}:{params:Promise<{id:string;section:string}>}){const {id,section}=await params;if(!['questions','hypotheses','evidence','datasets','experiments','activity'].includes(section))notFound();return <Suspense fallback={<p>Loading…</p>}><ProjectWorkspace id={id} tab={section}/></Suspense>;}
