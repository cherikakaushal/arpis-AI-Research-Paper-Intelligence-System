"use client";
import Link from 'next/link';
import { useWorkspace } from '@/store/WorkspaceProvider';
export default function Navbar(){const {workspace,mutate}=useWorkspace();return <header className="arpis-navbar"><Link href="/dashboard">ARPIS</Link><Link href="/search">Search research</Link><Link href="/profile">Profile</Link><button onClick={()=>mutate(w=>{w.settings.theme=workspace.settings.theme==='light'?'dark':'light';})}>Toggle theme</button></header>;}
