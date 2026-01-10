/**
 * Maps AI-generated language names to Monaco Editor language identifiers
 */
export const normalizeLanguage = (language: string): string => {
  const normalized = language.toLowerCase().trim();
  
  const languageMap: Record<string, string> = {
    'c++': 'cpp',
    'cpp': 'cpp',
    'cplusplus': 'cpp',
    'c': 'c',
    'python': 'python',
    'python3': 'python',
    'py': 'python',
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'java': 'java',
    'go': 'go',
    'golang': 'go',
    'rust': 'rust',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'sql': 'sql',
    'bash': 'shell',
    'sh': 'shell',
    'shell': 'shell',
    'ruby': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'r': 'r',
    'scala': 'scala',
    'dart': 'dart',
  };

  return languageMap[normalized] || 'javascript'; // Default to javascript if unknown
};
