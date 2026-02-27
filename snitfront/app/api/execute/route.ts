import { NextRequest, NextResponse } from 'next/server';

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mapping from Monaco to Piston
const LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  cpp: 'c++',
  c: 'c',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  scala: 'scala',
  r: 'r',
  perl: 'perl',
  lua: 'lua',
  bash: 'bash',
  sql: 'sql',
};

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    python: 'py',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    go: 'go',
    rust: 'rs',
    php: 'php',
    ruby: 'rb',
    swift: 'swift',
    kotlin: 'kt',
    scala: 'scala',
    r: 'r',
    perl: 'pl',
    lua: 'lua',
    bash: 'sh',
    sql: 'sql',
  };
  return extensions[language.toLowerCase()] || 'txt';
}

export async function POST(req: NextRequest) {
  try {
    const { language, code, stdin } = await req.json();

    if (!language || !code) {
      return NextResponse.json(
        { error: 'Language and code are required' },
        { status: 400 }
      );
    }

    const pistonLanguage = LANGUAGE_MAP[language.toLowerCase()] || language;
    
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: pistonLanguage,
        version: '*', // Use latest version
        files: [
          {
            name: `main.${getFileExtension(language)}`,
            content: code,
          },
        ],
        stdin: stdin || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.statusText}`);
    }

    const result = await response.json();
    
    let output = '';
    if (result.run?.stdout) {
      output += result.run.stdout;
    }
    
    let error = '';
    if (result.run?.stderr) {
      error = result.run.stderr;
    }
    if (result.compile?.stderr) {
      error = result.compile.stderr + '\n' + error;
    }

    return NextResponse.json({
      output: output || (error ? '' : '✅ Code executed successfully (no output)'),
      error: error || undefined,
      exitCode: result.run?.code || 0,
    });
  } catch (error: any) {
    console.error('Code execution error:', error);
    return NextResponse.json(
      {
        output: '',
        error: error.message || 'Failed to execute code',
        exitCode: 1,
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
