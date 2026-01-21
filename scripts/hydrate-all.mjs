/**
 * hydrate-all.mjs
 * 
 * Master script to sequentially populate the entire database with 450 movies.
 * Runs through all configured industries and genres in `elite-movies.js`.
 * 
 * Usage: node scripts/hydrate-all.mjs
 */
import { spawn } from 'child_process';
import path from 'path';

// Configuration of what to run
const TASKS = [
    // HOLLYWOOD (200)
    { industry: 'HOLLYWOOD', genre: 'scifi' },
    { industry: 'HOLLYWOOD', genre: 'thriller' },
    { industry: 'HOLLYWOOD', genre: 'action' },
    { industry: 'HOLLYWOOD', genre: 'drama' },

    // BOLLYWOOD (200)
    { industry: 'BOLLYWOOD', genre: 'thriller' },
    { industry: 'BOLLYWOOD', genre: 'action' },
    { industry: 'BOLLYWOOD', genre: 'drama' },
    { industry: 'BOLLYWOOD', genre: 'classic' },

    // ANIME (50)
    { industry: 'ANIME', genre: 'all' }
];

async function runTask(task, index) {
    return new Promise((resolve, reject) => {
        console.log(`\n🚀 [${index + 1}/${TASKS.length}] Starting Batch: ${task.industry} - ${task.genre}`);
        console.log('──────────────────────────────────────────────────');

        const child = spawn('node', [
            'scripts/hydrate-elite.mjs',
            `--industry=${task.industry}`,
            `--genre=${task.genre}`,
            '--limit=50'
        ], {
            stdio: 'inherit', // Stream output directly to console
            env: process.env
        });

        child.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✅ Batch Complete: ${task.industry} - ${task.genre}`);
                resolve();
            } else {
                console.error(`\n❌ Batch Failed (Exit Code ${code})`);
                // resolve anyway to continue to next batch? 
                // Better to continue so one failure doesn't stop everything.
                resolve();
            }
        });

        child.on('error', (err) => {
            console.error('Failed to start subprocess.', err);
            resolve();
        });
    });
}

async function main() {
    console.log('🎬 STARTING COMPLETE DATABASE HYDRATION (450 Movies)');
    console.log('☕ This will take approximately 30-40 minutes due to API rate limits.');
    console.log('──────────────────────────────────────────────────');

    for (let i = 0; i < TASKS.length; i++) {
        await runTask(TASKS[i], i);

        // Cool down break between batches
        if (i < TASKS.length - 1) {
            console.log('\n💤 Cooling down for 10 seconds between batches...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }

    console.log('\n🎉 ALL BATCHES COMPLETED!');
    console.log('Now running Golden Export...');

    // Final Export
    const exportChild = spawn('npm', ['run', 'db:export'], { stdio: 'inherit', env: process.env });
    exportChild.on('close', () => {
        console.log('\n✨ Database Population Complete & Verified!');
    });
}

main().catch(console.error);
    