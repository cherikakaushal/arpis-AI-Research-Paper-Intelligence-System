import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',timeout:90000,expect:{timeout:15000},fullyParallel:false,workers:1,reporter:'list',use:{baseURL:process.env.ARPIS_TEST_URL||'http://localhost:3000',channel:'msedge',headless:true,trace:'retain-on-failure',screenshot:'only-on-failure'},outputDir:'test-results'});
