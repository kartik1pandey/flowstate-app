import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import crypto from 'crypto';

const router = express.Router();
const execAsync = promisify(exec);

const TEMP_DIR = path.join(__dirname, '../../temp');
fs.mkdir(TEMP_DIR, { recursive: true }).catch(console.error);

const LANGUAGE_CONFIG: Record<string, { ext: string; command: (file: string) => string }> = {
  javascript: {
    ext: '.js',
    command: (file) => `node "${file}"`,
  },
  python: {
    ext: '.py',
    command: (file) => `python "${file}"`,
  },
};

router.post('/', async (req, res) => {
  const tempId = crypto.randomBytes(16).toString('hex');
  const tempFile = path.join(TEMP_DIR, tempId);
  
  try {
    const { language, code } = req.body;

    if (!language || !code) {
      return res.status(400).json({ error: 'Language and code are required' });
    }

    const lang = language.toLowerCase();
    const config = LANGUAGE_CONFIG[lang];

    if (!config) {
      return res.status(400).json({
        error: `Language '${language}' not supported. Supported: ${Object.keys(LANGUAGE_CONFIG).join(', ')}`,
        output: '',
        status: 'error',
      });
    }

    const filePath = tempFile + config.ext;
    console.log(`🚀 Executing ${lang} code...`);

    await fs.writeFile(filePath, code, 'utf-8');

    const command = config.command(filePath);
    const result = await execAsync(command, {
      timeout: 5000,
      maxBuffer: 1024 * 1024,
    });

    console.log(`✅ Execution completed`);
    await fs.unlink(filePath).catch(() => {});

    res.json({
      output: result.stdout || 'No output',
      error: result.stderr || null,
      exitCode: 0,
      status: 'success',
      language: lang,
    });
  } catch (error: any) {
    console.error('Execute error:', error);

    try {
      const files = await fs.readdir(TEMP_DIR);
      for (const file of files) {
        if (file.startsWith(path.basename(tempFile))) {
          await fs.unlink(path.join(TEMP_DIR, file)).catch(() => {});
        }
      }
    } catch {}

    if (error.killed) {
      return res.json({
        error: 'Execution timed out (5 second limit)',
        output: error.stdout || '',
        exitCode: -1,
        status: 'timeout',
      });
    }

    res.json({
      error: error.stderr || error.message || 'Execution failed',
      output: error.stdout || '',
      exitCode: error.code || 1,
      status: 'error',
    });
  }
});

router.get('/languages', (req, res) => {
  res.json({
    languages: Object.keys(LANGUAGE_CONFIG),
    message: 'Supported languages for code execution',
  });
});

export default router;
