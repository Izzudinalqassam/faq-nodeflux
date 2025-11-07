import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  dracula,
  atomDark,
  tomorrow,
  synthwave84,
  nightOwl,
  shadesOfPurple,
  vs,
  darcula,
  oneDark,
  okaidia,
  solarizedlight,
  nord
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Palette, Sun, Moon } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
}

interface CodeTheme {
  name: string;
  style: any;
  icon: React.ReactNode;
  isDark: boolean;
  description: string;
}

const themes: CodeTheme[] = [
  {
    name: 'VS Code Dark+',
    style: vscDarkPlus,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Default VS Code dark theme'
  },
  {
    name: 'One Dark',
    style: oneDark,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Atom One Dark theme'
  },
  {
    name: 'Dracula',
    style: dracula,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Popular dark purple theme'
  },
  {
    name: 'Atom Dark',
    style: atomDark,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Atom editor dark theme'
  },
  {
    name: 'Night Owl',
    style: nightOwl,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Sarah Drasner\'s theme'
  },
  {
    name: 'Shades of Purple',
    style: shadesOfPurple,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Vibrant purple theme'
  },
  {
    name: 'Nord',
    style: nord,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Arctic cold north theme'
  },
  {
    name: 'Okaidia',
    style: okaidia,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Olivetti themed theme'
  },
  {
    name: 'Synthwave \'84',
    style: synthwave84,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'Neon retro synthwave'
  },
  {
    name: 'Darcula',
    style: darcula,
    icon: <Moon className="h-4 w-4" />,
    isDark: true,
    description: 'IntelliJ Darcula theme'
  },
  {
    name: 'Tomorrow',
    style: tomorrow,
    icon: <Sun className="h-4 w-4" />,
    isDark: false,
    description: 'Clean light theme'
  },
  {
    name: 'Solarized Light',
    style: solarizedlight,
    icon: <Sun className="h-4 w-4" />,
    isDark: false,
    description: 'Ethan Schoonover\'s Solarized'
  },
  {
    name: 'VS',
    style: vs,
    icon: <Sun className="h-4 w-4" />,
    isDark: false,
    description: 'VS Code light theme'
  }
];

// Get saved theme from localStorage or default
const getSavedTheme = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('code-theme');
    return saved || 'vscDarkPlus';
  }
  return 'vscDarkPlus';
};

// Save theme to localStorage
const saveTheme = (themeName: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('code-theme', themeName);
  }
};

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  className = '',
  language
}) => {
  const [copied, setCopied] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedName = getSavedTheme();
    return themes.find(t => t.name === savedName) || themes[0];
  });

  // Listen for theme change events
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      const themeName = event.detail;
      const newTheme = themes.find(t => t.name === themeName);
      if (newTheme) {
        setCurrentTheme(newTheme);
      }
    };

    window.addEventListener('code-theme-changed', handleThemeChange as EventListener);
    return () => {
      window.removeEventListener('code-theme-changed', handleThemeChange as EventListener);
    };
  }, []);

  // Extract language from className
  const match = /language-(\w+)/.exec(className || '');
  const lang = language || (match ? match[1] : '') || 'text';

  // Clean code content
  const codeContent = String(children).replace(/\n$/, '');

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const changeTheme = (theme: CodeTheme) => {
    setCurrentTheme(theme);
    saveTheme(theme.name);
    setShowThemeSelector(false);
  };

  return (
    <div className="relative group">
      {/* Header with language, theme selector and copy button */}
      <div
        className="flex items-center justify-between px-4 py-2 text-sm font-mono rounded-t-lg"
        style={{
          backgroundColor: currentTheme.style['pre[class*="language-"]']?.backgroundColor || '#1e1e1e',
          color: currentTheme.style['pre[class*="language-"]']?.color || '#d4d4d4'
        }}
      >
        <div className="flex items-center gap-3">
          {/* Language indicator */}
          <span className="text-xs uppercase tracking-wide opacity-75">
            {lang}
          </span>

          {/* Theme selector */}
          <div className="relative">
            <button
              onClick={() => setShowThemeSelector(!showThemeSelector)}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded opacity-60 hover:opacity-100 transition-opacity"
              title="Change theme"
            >
              <Palette className="h-3 w-3" />
              <span className="hidden sm:inline">{currentTheme.name}</span>
            </button>

            {/* Theme dropdown */}
            {showThemeSelector && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 min-w-[200px]">
                <div className="max-h-60 overflow-y-auto">
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => changeTheme(theme)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                        currentTheme.name === theme.name ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        {theme.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {theme.name}
                        </div>
                        <div className="text-xs opacity-60 truncate">
                          {theme.description}
                        </div>
                      </div>
                      {currentTheme.name === theme.name && (
                        <Check className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copy button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-2 py-1 text-xs rounded opacity-60 hover:opacity-100 transition-opacity"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="hidden sm:inline">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content with syntax highlighting */}
      <div className="rounded-b-lg overflow-hidden">
        <SyntaxHighlighter
          language={lang}
          style={currentTheme.style}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            backgroundColor: currentTheme.style['pre[class*="language-"]']?.backgroundColor || '#1e1e1e',
          }}
          codeTagProps={{
            style: {
              fontFamily: '"Fira Code", "Monaco", "Cascadia Code", "Segoe UI Mono", monospace',
            }
          }}
          showLineNumbers={codeContent.split('\n').length > 3}
          wrapLines={true}
        >
        {codeContent}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;