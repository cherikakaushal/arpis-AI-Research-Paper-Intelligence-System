"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/components/projects/ProjectProvider";
export default function NewProjectPage(){const {openCreateProject}=useProjects();const router=useRouter();useEffect(()=>{openCreateProject();router.replace("/")},[openCreateProject,router]);return null}
