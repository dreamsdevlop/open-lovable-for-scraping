// Sandbox Templates - Pre-configured project templates for bolt.new clone

export interface SandboxTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    framework: string;
    buildTool: 'vite' | 'nextjs' | 'cra' | 'webpack';
    language: 'typescript' | 'javascript';
    starterFiles: Record<string, string>;
    dependencies: string[];
    devDependencies: string[];
    commands: {
        install: string;
        dev: string;
        build: string;
    };
}

export const SANDBOX_TEMPLATES: SandboxTemplate[] = [
    {
        id: 'react-ts',
        name: 'React + TypeScript',
        description: 'Modern React app with TypeScript and Vite',
        icon: '⚛️',
        framework: 'react',
        buildTool: 'vite',
        language: 'typescript',
        starterFiles: {
            'package.json': JSON.stringify({
                name: 'react-app',
                private: true,
                version: '0.0.0',
                type: 'module',
                scripts: {
                    dev: 'vite',
                    build: 'tsc && vite build',
                    lint: 'eslint .',
                    preview: 'vite preview'
                },
                dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0'
                },
                devDependencies: {
                    '@types/react': '^18.2.0',
                    '@types/react-dom': '^18.2.0',
                    '@vitejs/plugin-react': '^4.2.0',
                    typescript: '^5.2.0',
                    vite: '^5.0.0'
                }
            }, null, 2),
            'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
            'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
            'src/App.tsx': `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Hello World</h1>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  )
}

export default App`,
            'src/index.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

.app {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}

button {
  background: #0070f3;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #0060df;
}`,
            'tsconfig.json': JSON.stringify({
                compilerOptions: {
                    target: 'ES2020',
                    useDefineForClassFields: true,
                    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                    module: 'ESNext',
                    skipLibCheck: true,
                    moduleResolution: 'bundler',
                    allowImportingTsExtensions: true,
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: 'react-jsx',
                    strict: true,
                    noUnusedLocals: true,
                    noUnusedParameters: true,
                    noFallthroughCasesInSwitch: true
                },
                include: ['src'],
                references: [{ path: './tsconfig.node.json' }]
            }, null, 2),
            'tsconfig.node.json': JSON.stringify({
                compilerOptions: {
                    composite: true,
                    skipLibCheck: true,
                    module: 'ESNext',
                    moduleResolution: 'bundler',
                    allowSyntheticDefaultImports: true
                },
                include: ['vite.config.ts']
            }, null, 2),
            'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
        },
        dependencies: ['react', 'react-dom'],
        devDependencies: ['@vitejs/plugin-react', 'vite', 'typescript'],
        commands: {
            install: 'npm install',
            dev: 'npm run dev',
            build: 'npm run build'
        }
    },
    {
        id: 'nextjs-ts',
        name: 'Next.js + TypeScript',
        description: 'Full-stack Next.js app with App Router',
        icon: '▲',
        framework: 'nextjs',
        buildTool: 'nextjs',
        language: 'typescript',
        starterFiles: {
            'package.json': JSON.stringify({
                name: 'nextjs-app',
                version: '0.1.0',
                private: true,
                scripts: {
                    dev: 'next dev',
                    build: 'next build',
                    start: 'next start',
                    lint: 'next lint'
                },
                dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0',
                    next: '14.0.0'
                },
                devDependencies: {
                    '@types/node': '^20.0.0',
                    '@types/react': '^18.2.0',
                    '@types/react-dom': '^18.2.0',
                    typescript: '^5.2.0',
                    eslint: '^8.0.0',
                    'eslint-config-next': '14.0.0'
                }
            }, null, 2),
            'next.config.js': `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig`,
            'tsconfig.json': JSON.stringify({
                compilerOptions: {
                    target: 'es5',
                    lib: ['dom', 'dom.iterable', 'esnext'],
                    allowJs: true,
                    skipLibCheck: true,
                    strict: true,
                    noEmit: true,
                    esModuleInterop: true,
                    module: 'esnext',
                    moduleResolution: 'bundler',
                    resolveJsonModule: true,
                    isolatedModules: true,
                    jsx: 'preserve',
                    incremental: true,
                    plugins: [
                        {
                            name: 'next'
                        }
                    ],
                    paths: {
                        '@/*': ['./*']
                    }
                },
                include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
                exclude: ['node_modules']
            }, null, 2),
            'app/layout.tsx': `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Next.js App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
            'app/page.tsx': `export default function Home() {
  return (
    <main>
      <h1>Welcome to Next.js</h1>
      <p>Get started by editing app/page.tsx</p>
    </main>
  )
}`,
            'app/globals.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f5f5;
  min-height: 100vh;
}

main {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 1rem;
}`,
            'app/favicon.ico': ''
        },
        dependencies: ['next', 'react', 'react-dom'],
        devDependencies: ['typescript', 'eslint', 'eslint-config-next'],
        commands: {
            install: 'npm install',
            dev: 'npm run dev',
            build: 'npm run build'
        }
    },
    {
        id: 'vue-ts',
        name: 'Vue + TypeScript',
        description: 'Vue 3 app with TypeScript and Vite',
        icon: '💚',
        framework: 'vue',
        buildTool: 'vite',
        language: 'typescript',
        starterFiles: {
            'package.json': JSON.stringify({
                name: 'vue-app',
                private: true,
                version: '0.0.0',
                type: 'module',
                scripts: {
                    dev: 'vite',
                    build: 'vue-tsc && vite build',
                    preview: 'vite preview'
                },
                dependencies: {
                    vue: '^3.4.0'
                },
                devDependencies: {
                    '@vitejs/plugin-vue': '^5.0.0',
                    'vue-tsc': '^2.0.0',
                    typescript: '^5.3.0',
                    vite: '^5.0.0'
                }
            }, null, 2),
            'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vue App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
            'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

createApp(App).mount('#app')`,
            'src/App.vue': `<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="app">
    <h1>Hello Vue</h1>
    <p>Count: {{ count }}</p>
    <button @click="count++">Increment</button>
  </div>
</template>

<style scoped>
.app {
  padding: 2rem;
}
button {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>`,
            'src/style.css': `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}`,
            'tsconfig.json': JSON.stringify({
                compilerOptions: {
                    target: 'ES2020',
                    useDefineForClassFields: true,
                    module: 'ESNext',
                    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                    skipLibCheck: true,
                    moduleResolution: 'bundler',
                    allowImportingTsExtensions: true,
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    vue: true,
                    strict: true
                },
                include: ['src/**/*.ts', 'src/**/*.d.ts', 'src/**/*.tsx', 'src/**/*.vue']
            }, null, 2),
            'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})`
        },
        dependencies: ['vue'],
        devDependencies: ['@vitejs/plugin-vue', 'vue-tsc', 'vite', 'typescript'],
        commands: {
            install: 'npm install',
            dev: 'npm run dev',
            build: 'npm run build'
        }
    },
    {
        id: 'vanilla-ts',
        name: 'Vanilla TypeScript',
        description: 'Simple TypeScript project with Vite',
        icon: '📦',
        framework: 'vanilla',
        buildTool: 'vite',
        language: 'typescript',
        starterFiles: {
            'package.json': JSON.stringify({
                name: 'vanilla-ts-app',
                private: true,
                version: '0.0.0',
                type: 'module',
                scripts: {
                    dev: 'vite',
                    build: 'tsc && vite build',
                    preview: 'vite preview'
                },
                devDependencies: {
                    typescript: '^5.2.0',
                    vite: '^5.0.0'
                }
            }, null, 2),
            'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
  </head>
  <body>
    <h1>Hello World</h1>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
            'src/main.ts': `console.log('Hello TypeScript!');

const app = document.querySelector('h1');
if (app) {
  app.textContent = 'Hello TypeScript!';
}`,
            'tsconfig.json': JSON.stringify({
                compilerOptions: {
                    target: 'ES2020',
                    useDefineForClassFields: true,
                    module: 'ESNext',
                    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                    skipLibCheck: true,
                    moduleResolution: 'bundler',
                    allowImportingTsExtensions: true,
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    strict: true
                },
                include: ['src']
            }, null, 2),
            'vite.config.ts': `import { defineConfig } from 'vite'

export default defineConfig({
})`
        },
        dependencies: [],
        devDependencies: ['typescript', 'vite'],
        commands: {
            install: 'npm install',
            dev: 'npm run dev',
            build: 'npm run build'
        }
    },
    {
        id: 'react-tailwind',
        name: 'React + Tailwind CSS',
        description: 'React with Tailwind CSS styling',
        icon: '💨',
        framework: 'react',
        buildTool: 'vite',
        language: 'typescript',
        starterFiles: {
            'package.json': JSON.stringify({
                name: 'react-tailwind-app',
                private: true,
                version: '0.0.0',
                type: 'module',
                scripts: {
                    dev: 'vite',
                    build: 'tsc && vite build',
                    preview: 'vite preview'
                },
                dependencies: {
                    react: '^18.2.0',
                    'react-dom': '^18.2.0'
                },
                devDependencies: {
                    '@types/react': '^18.2.0',
                    '@types/react-dom': '^18.2.0',
                    '@vitejs/plugin-react': '^4.2.0',
                    autoprefixer: '^10.4.16',
                    postcss: '^8.4.32',
                    tailwindcss: '^3.4.0',
                    typescript: '^5.2.0',
                    vite: '^5.0.0'
                }
            }, null, 2),
            'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React + Tailwind</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
            'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
            'src/App.tsx': `import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Hello Tailwind!
        </h1>
        <p className="text-gray-600 mb-4">
          You clicked {count} times
        </p>
        <button
          onClick={() => setCount(count + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
        >
          Click me
        </button>
      </div>
    </div>
  )
}

export default App`,
            'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;`,
            'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`,
            'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
            'tsconfig.json': JSON.stringify({
                compilerOptions: {
                    target: 'ES2020',
                    useDefineForClassFields: true,
                    lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                    module: 'ESNext',
                    skipLibCheck: true,
                    moduleResolution: 'bundler',
                    allowImportingTsExtensions: true,
                    resolveJsonModule: true,
                    isolatedModules: true,
                    noEmit: true,
                    jsx: 'react-jsx',
                    strict: true
                },
                include: ['src']
            }, null, 2),
            'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
        },
        dependencies: ['react', 'react-dom'],
        devDependencies: ['@vitejs/plugin-react', 'vite', 'typescript', 'tailwindcss', 'autoprefixer', 'postcss'],
        commands: {
            install: 'npm install',
            dev: 'npm run dev',
            build: 'npm run build'
        }
    }
];

// Helper function to get template by ID
export function getTemplateById(id: string): SandboxTemplate | undefined {
    return SANDBOX_TEMPLATES.find(t => t.id === id);
}

// Helper function to get template by framework
export function getTemplatesByFramework(framework: string): SandboxTemplate[] {
    return SANDBOX_TEMPLATES.filter(t => t.framework === framework);
}
