// Export and Deployment Utilities for bolt.new clone

export interface ExportOptions {
    format: 'zip' | 'github';
    includeGitIgnore?: boolean;
    includeReadme?: boolean;
}

export interface DeploymentConfig {
    platform: 'vercel' | 'netlify' | 'cloudflare';
    projectName: string;
    framework?: string;
    buildCommand?: string;
    outputDirectory?: string;
    installCommand?: string;
    envVars?: Record<string, string>;
}

// Create a ZIP file from project files
export async function createProjectZip(
    files: Record<string, string>,
    options: ExportOptions = { format: 'zip' }
): Promise<Blob> {
    // Dynamic import for JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add files to zip
    for (const [path, content] of Object.entries(files)) {
        if (content) { // Skip empty files like favicon.ico placeholder
            zip.file(path, content);
        }
    }

    // Add .gitignore if requested
    if (options.includeGitIgnore) {
        const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Build
dist/
build/
.next/
out/

# Testing
coverage/

# Misc
.DS_Store
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo
`;
        zip.file('.gitignore', gitignore);
    }

    // Add README if requested
    if (options.includeReadme) {
        const readme = `# Project

Generated with Open Lovable - AI Code Generator

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Features

- Built with modern web technologies
- TypeScript support
- Hot reload development

## License

MIT
`;
        zip.file('README.md', readme);
    }

    // Generate zip blob
    const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
    });

    return blob;
}

// Download ZIP file
export function downloadZip(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// GitHub Repository Creation
export interface GitHubRepoConfig {
    name: string;
    description?: string;
    private?: boolean;
    autoInit?: boolean;
}

export async function createGitHubRepo(
    token: string,
    config: GitHubRepoConfig
): Promise<{ url: string; cloneUrl: string }> {
    const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: config.name,
            description: config.description || 'Created with Open Lovable',
            private: config.private ?? false,
            auto_init: config.autoInit ?? true
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create repository');
    }

    const data = await response.json();
    return {
        url: data.html_url,
        cloneUrl: data.clone_url
    };
}

// Push files to GitHub repository
export async function pushToGitHub(
    token: string,
    repoOwner: string,
    repoName: string,
    files: Record<string, string>,
    commitMessage: string = 'Initial commit from Open Lovable'
): Promise<void> {
    // Get the default branch (usually 'main' or 'master')
    const repoResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    if (!repoResponse.ok) {
        throw new Error('Failed to get repository info');
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch;

    // Get the current commit SHA
    const refResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/ref/heads/${defaultBranch}`,
        {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );

    if (!refResponse.ok) {
        throw new Error('Failed to get branch reference');
    }

    const refData = await refResponse.json();
    const currentCommitSha = refData.object.sha;

    // Get the current tree SHA
    const commitResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits/${currentCommitSha}`,
        {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        }
    );

    if (!commitResponse.ok) {
        throw new Error('Failed to get current commit');
    }

    const commitData = await commitResponse.json();
    const treeSha = commitData.tree.sha;

    // Create blobs for each file
    const blobs: Promise<{ path: string; sha: string }>[] = Object.entries(files).map(
        async ([path, content]) => {
            const blobResponse = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/git/blobs`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: btoa(unescape(encodeURIComponent(content))),
                        encoding: 'base64'
                    })
                }
            );

            if (!blobResponse.ok) {
                throw new Error(`Failed to create blob for ${path}`);
            }

            const blobData = await blobResponse.json();
            return { path, sha: blobData.sha };
        }
    );

    const createdBlobs = await Promise.all(blobs);

    // Create new tree
    const treeResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees`,
        {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                base_tree: treeSha,
                tree: createdBlobs.map(blob => ({
                    path: blob.path,
                    mode: '100644',
                    type: 'blob',
                    sha: blob.sha
                }))
            })
        }
    );

    if (!treeResponse.ok) {
        throw new Error('Failed to create tree');
    }

    const treeData = await treeResponse.json();

    // Create commit
    const newCommitResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/commits`,
        {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: commitMessage,
                tree: treeData.sha,
                parents: [currentCommitSha]
            })
        }
    );

    if (!newCommitResponse.ok) {
        throw new Error('Failed to create commit');
    }

    const newCommitData = await newCommitResponse.json();

    // Update reference
    const updateRefResponse = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/git/ref/heads/${defaultBranch}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sha: newCommitData.sha,
                force: false
            })
        }
    );

    if (!updateRefResponse.ok) {
        throw new Error('Failed to update branch');
    }
}

// Deploy to Vercel
export async function deployToVercel(
    files: Record<string, string>,
    config: DeploymentConfig
): Promise<{ url: string; deploymentId: string }> {
    // Note: This is a simplified version. In production, you'd use the Vercel API
    // For now, we'll just return a mock response
    // In a real implementation, you'd need to:
    // 1. Create a Vercel project
    // 2. Upload the files
    // 3. Trigger a deployment

    console.log('Deploying to Vercel:', config);

    return {
        url: `https://${config.projectName}.vercel.app`,
        deploymentId: `dpl_${Date.now()}`
    };
}

// Deploy to Netlify
export async function deployToNetlify(
    files: Record<string, string>,
    config: DeploymentConfig
): Promise<{ url: string; deploymentId: string }> {
    // Simplified version - would need Netlify API in production
    console.log('Deploying to Netlify:', config);

    return {
        url: `https://${config.projectName}.netlify.app`,
        deploymentId: `netlify_${Date.now()}`
    };
}

// Utility to format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Calculate total project size
export function calculateProjectSize(files: Record<string, string>): number {
    let total = 0;

    for (const content of Object.values(files)) {
        // Estimate size in bytes (UTF-8)
        total += new Blob([content]).size;
    }

    return total;
}
