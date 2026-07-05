const cheerio = require('cheerio');
const cssTree = require('css-tree');

class AnalyzerService {
  constructor(files) {
    this.files = files || [];
    this.bugs = [];
    this.scores = {
      performance: 100,
      accessibility: 100,
      seo: 100,
      security: 100,
      codeQuality: 100,
      maintainability: 100,
      overall: 100
    };
  }

  analyze() {
    this.analyzeHTML();
    this.analyzeCSS();
    this.analyzeJavaScript();
    this.analyzePerformance();
    this.analyzeAccessibility();
    this.analyzeSEO();
    this.analyzeSecurity();
    this.analyzeCodeQuality();
    this.calculateScores();
    return { bugs: this.bugs, scores: this.scores };
  }

  getFilesByType(extensions) {
    return this.files.filter(f => extensions.includes(f.extension));
  }

  addBug(bug) {
    this.bugs.push({
      title: bug.title,
      description: bug.description,
      category: bug.category,
      severity: bug.severity || 'medium',
      priority: bug.priority || 'medium',
      affectedFile: bug.file || '',
      affectedLine: bug.line || 0,
      codeSnippet: bug.snippet || '',
      rootCause: bug.rootCause || '',
      suggestedFix: bug.suggestedFix || '',
      estimatedTime: bug.estimatedTime || '15 min'
    });
  }

  // ─── HTML Analysis ────────────────────────────────────────────────
  analyzeHTML() {
    const htmlFiles = this.getFilesByType(['.html', '.htm', '.jsx', '.tsx', '.vue']);

    htmlFiles.forEach(file => {
      if (!file.content) return;

      // For JSX/TSX files, do lighter analysis
      const isJSX = ['.jsx', '.tsx'].includes(file.extension);

      if (!isJSX) {
        const $ = cheerio.load(file.content);

        // Check for missing alt tags on images
        $('img').each((_, el) => {
          const alt = $(el).attr('alt');
          const src = $(el).attr('src');
          if (!alt && alt !== '') {
            this.addBug({
              title: 'Missing alt attribute on image',
              description: `Image ${src || 'unknown'} is missing an alt attribute, which is required for accessibility.`,
              category: 'missing-alt',
              severity: 'medium',
              file: file.path,
              rootCause: 'Image element lacks alt attribute',
              suggestedFix: `Add alt attribute: <img src="${src}" alt="Descriptive text">`,
              estimatedTime: '5 min'
            });
            this.scores.accessibility -= 3;
          }
        });

        // Check for missing meta tags
        const title = $('title').text();
        const description = $('meta[name="description"]').attr('content');
        const viewport = $('meta[name="viewport"]').attr('content');

        if (!title) {
          this.addBug({
            title: 'Missing page title',
            description: 'The page is missing a <title> tag, which is essential for SEO and browser tabs.',
            category: 'missing-meta',
            severity: 'high',
            file: file.path,
            rootCause: 'No <title> element in <head>',
            suggestedFix: 'Add <title>Your Page Title</title> inside <head>',
            estimatedTime: '5 min'
          });
          this.scores.seo -= 10;
        }

        if (!description) {
          this.addBug({
            title: 'Missing meta description',
            description: 'The page is missing a meta description, which affects SEO ranking and search result appearance.',
            category: 'missing-meta',
            severity: 'medium',
            file: file.path,
            rootCause: 'No meta description tag in <head>',
            suggestedFix: 'Add <meta name="description" content="Your page description">',
            estimatedTime: '5 min'
          });
          this.scores.seo -= 5;
        }

        if (!viewport) {
          this.addBug({
            title: 'Missing viewport meta tag',
            description: 'The page is missing a viewport meta tag, which is essential for responsive design.',
            category: 'responsive',
            severity: 'high',
            file: file.path,
            rootCause: 'No viewport meta tag',
            suggestedFix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            estimatedTime: '5 min'
          });
          this.scores.accessibility -= 5;
        }

        // Check heading structure
        const headings = [];
        $('h1, h2, h3, h4, h5, h6').each((_, el) => {
          headings.push(parseInt(el.tagName.charAt(1)));
        });

        const h1Count = headings.filter(h => h === 1).length;
        if (h1Count === 0) {
          this.addBug({
            title: 'Missing H1 heading',
            description: 'The page is missing an H1 heading, which is important for SEO and document structure.',
            category: 'seo',
            severity: 'medium',
            file: file.path,
            rootCause: 'No <h1> element on the page',
            suggestedFix: 'Add a single <h1> heading that describes the page content',
            estimatedTime: '5 min'
          });
          this.scores.seo -= 5;
        } else if (h1Count > 1) {
          this.addBug({
            title: 'Multiple H1 headings',
            description: `Found ${h1Count} H1 headings. Best practice is to have exactly one H1 per page.`,
            category: 'seo',
            severity: 'low',
            file: file.path,
            rootCause: 'Multiple <h1> elements',
            suggestedFix: 'Keep one H1 and convert others to H2 or lower',
            estimatedTime: '10 min'
          });
          this.scores.seo -= 3;
        }

        // Check for heading hierarchy skips
        for (let i = 1; i < headings.length; i++) {
          if (headings[i] - headings[i - 1] > 1) {
            this.addBug({
              title: 'Skipped heading level',
              description: `Heading level jumps from H${headings[i - 1]} to H${headings[i]}. This breaks document hierarchy.`,
              category: 'accessibility',
              severity: 'low',
              file: file.path,
              rootCause: 'Non-sequential heading levels',
              suggestedFix: 'Use sequential heading levels (H1 → H2 → H3)',
              estimatedTime: '10 min'
            });
            this.scores.accessibility -= 2;
            break; // Only report once
          }
        }

        // Check for missing form labels
        $('input, select, textarea').each((_, el) => {
          const id = $(el).attr('id');
          const ariaLabel = $(el).attr('aria-label');
          const ariaLabelledby = $(el).attr('aria-labelledby');
          const type = $(el).attr('type');

          if (type === 'hidden' || type === 'submit' || type === 'button') return;

          if (!ariaLabel && !ariaLabelledby) {
            if (!id || $(`label[for="${id}"]`).length === 0) {
              if ($(el).closest('label').length === 0) {
                this.addBug({
                  title: 'Missing form label',
                  description: `Form element ${type || el.tagName} is missing an associated label.`,
                  category: 'missing-label',
                  severity: 'medium',
                  file: file.path,
                  rootCause: 'No label element or aria-label for form control',
                  suggestedFix: 'Add a <label for="inputId"> or aria-label attribute',
                  estimatedTime: '5 min'
                });
                this.scores.accessibility -= 3;
              }
            }
          }
        });

        // Check for missing ARIA landmarks
        const hasMain = $('main, [role="main"]').length > 0;
        const hasNav = $('nav, [role="navigation"]').length > 0;

        if (!hasMain && file.name === 'index.html') {
          this.addBug({
            title: 'Missing main landmark',
            description: 'The page is missing a <main> element or role="main" landmark.',
            category: 'missing-aria',
            severity: 'low',
            file: file.path,
            rootCause: 'No main landmark region',
            suggestedFix: 'Wrap main content in <main> element',
            estimatedTime: '10 min'
          });
          this.scores.accessibility -= 2;
        }

        // Check for broken links (empty href)
        $('a').each((_, el) => {
          const href = $(el).attr('href');
          if (href === '' || href === '#' || href === 'javascript:void(0)') {
            this.addBug({
              title: 'Potentially broken link',
              description: `Link "${$(el).text().trim().substring(0, 50) || 'unnamed'}" has href="${href}" which may be a broken or placeholder link.`,
              category: 'broken-link',
              severity: 'low',
              file: file.path,
              rootCause: 'Empty or placeholder href attribute',
              suggestedFix: 'Replace with a valid URL or remove the link',
              estimatedTime: '5 min'
            });
          }
        });

        // Check Open Graph and Twitter Cards
        const ogTitle = $('meta[property="og:title"]').length;
        const ogDescription = $('meta[property="og:description"]').length;
        const ogImage = $('meta[property="og:image"]').length;
        const twitterCard = $('meta[name="twitter:card"]').length;

        if (!ogTitle && file.name === 'index.html') {
          this.addBug({
            title: 'Missing Open Graph tags',
            description: 'Page is missing Open Graph meta tags (og:title, og:description, og:image) which affect social media sharing.',
            category: 'seo',
            severity: 'low',
            file: file.path,
            rootCause: 'No Open Graph meta tags',
            suggestedFix: 'Add og:title, og:description, and og:image meta tags',
            estimatedTime: '15 min'
          });
          this.scores.seo -= 3;
        }

        // Check for canonical URL
        if (!$('link[rel="canonical"]').length && file.name === 'index.html') {
          this.addBug({
            title: 'Missing canonical URL',
            description: 'Page is missing a canonical URL, which can cause duplicate content issues.',
            category: 'seo',
            severity: 'low',
            file: file.path,
            rootCause: 'No canonical link element',
            suggestedFix: 'Add <link rel="canonical" href="https://yoursite.com/page">',
            estimatedTime: '5 min'
          });
          this.scores.seo -= 2;
        }
      }

      // Common checks for all file types
      // Check for inline styles (code quality issue)
      if (file.content.includes('style="') || file.content.includes("style='")) {
        const inlineCount = (file.content.match(/style=["']/g) || []).length;
        if (inlineCount > 5) {
          this.addBug({
            title: 'Excessive inline styles',
            description: `Found ${inlineCount} inline style declarations. Inline styles reduce maintainability.`,
            category: 'duplicate-code',
            severity: 'low',
            file: file.path,
            rootCause: 'Inline styles instead of CSS classes',
            suggestedFix: 'Move styles to CSS classes or styled components',
            estimatedTime: '30 min'
          });
          this.scores.codeQuality -= 3;
        }
      }
    });
  }

  // ─── CSS Analysis ─────────────────────────────────────────────────
  analyzeCSS() {
    const cssFiles = this.getFilesByType(['.css', '.scss', '.less']);

    cssFiles.forEach(file => {
      if (!file.content) return;

      try {
        const ast = cssTree.parse(file.content, { parseCustomProperty: true });

        // Check for !important usage
        let importantCount = 0;
        cssTree.walk(ast, {
          visit: 'Declaration',
          enter: (node) => {
            if (node.important) importantCount++;
          }
        });

        if (importantCount > 5) {
          this.addBug({
            title: 'Excessive !important usage',
            description: `Found ${importantCount} uses of !important in CSS. This makes styles hard to maintain and override.`,
            category: 'unused-css',
            severity: 'medium',
            file: file.path,
            rootCause: 'Overuse of !important declarations',
            suggestedFix: 'Increase selector specificity instead of using !important',
            estimatedTime: '45 min'
          });
          this.scores.codeQuality -= 5;
        }

        // Check for very large CSS files
        if (file.size > 100000) {
          this.addBug({
            title: 'Large CSS file',
            description: `CSS file is ${Math.round(file.size / 1024)}KB. Consider splitting into modules.`,
            category: 'performance',
            severity: 'medium',
            file: file.path,
            rootCause: 'Single CSS file too large',
            suggestedFix: 'Split CSS into modular files and load only what\'s needed',
            estimatedTime: '1 hour'
          });
          this.scores.performance -= 5;
        }

      } catch (e) {
        // CSS parsing error
        this.addBug({
          title: 'CSS syntax error',
          description: `CSS file has syntax errors: ${e.message}`,
          category: 'console-error',
          severity: 'high',
          file: file.path,
          rootCause: 'Invalid CSS syntax',
          suggestedFix: 'Fix the CSS syntax error at the reported location',
          estimatedTime: '15 min'
        });
        this.scores.codeQuality -= 5;
      }

      // Duplicate property detection
      const propertyMap = {};
      const lines = file.content.split('\n');
      let currentSelector = '';

      lines.forEach((line, lineNum) => {
        const selectorMatch = line.match(/^([^{]+)\{/);
        if (selectorMatch) currentSelector = selectorMatch[1].trim();

        const propMatch = line.match(/^\s*([\w-]+)\s*:/);
        if (propMatch) {
          const key = `${currentSelector}|${propMatch[1]}`;
          if (propertyMap[key]) {
            this.addBug({
              title: 'Duplicate CSS property',
              description: `Property "${propMatch[1]}" is declared multiple times in "${currentSelector}".`,
              category: 'duplicate-code',
              severity: 'low',
              file: file.path,
              line: lineNum + 1,
              rootCause: 'Duplicate CSS property declaration',
              suggestedFix: 'Remove the duplicate property declaration',
              estimatedTime: '5 min'
            });
          }
          propertyMap[key] = lineNum + 1;
        }
      });
    });
  }

  // ─── JavaScript Analysis ──────────────────────────────────────────
  analyzeJavaScript() {
    const jsFiles = this.getFilesByType(['.js', '.jsx', '.ts', '.tsx', '.mjs']);

    jsFiles.forEach(file => {
      if (!file.content) return;
      const content = file.content;
      const lines = content.split('\n');

      // Console.log detection
      const consoleMatches = content.match(/console\.(log|warn|error|debug|info|trace)\(/g);
      if (consoleMatches && consoleMatches.length > 3) {
        this.addBug({
          title: 'Console statements in code',
          description: `Found ${consoleMatches.length} console statements. Remove before production.`,
          category: 'console-error',
          severity: 'low',
          file: file.path,
          rootCause: 'Development console statements left in code',
          suggestedFix: 'Remove console statements or use a logger library',
          estimatedTime: '15 min'
        });
        this.scores.codeQuality -= 2;
      }

      // Check for var usage (should use let/const)
      const varMatches = content.match(/\bvar\s+/g);
      if (varMatches && varMatches.length > 0) {
        this.addBug({
          title: 'Usage of var keyword',
          description: `Found ${varMatches.length} uses of "var". Use "let" or "const" for block scoping.`,
          category: 'other',
          severity: 'low',
          file: file.path,
          rootCause: 'Using var instead of let/const',
          suggestedFix: 'Replace var with let or const',
          estimatedTime: '15 min'
        });
        this.scores.codeQuality -= 2;
      }

      // Check for TODO/FIXME/HACK comments
      lines.forEach((line, lineNum) => {
        if (/\/\/\s*(TODO|FIXME|HACK|XXX|BUG):/i.test(line)) {
          const match = line.match(/\/\/\s*(TODO|FIXME|HACK|XXX|BUG):\s*(.*)/i);
          this.addBug({
            title: `${match[1].toUpperCase()} comment found`,
            description: `"${match[2].trim()}" - Unresolved TODO/FIXME in code.`,
            category: 'other',
            severity: match[1].toUpperCase() === 'FIXME' ? 'medium' : 'info',
            file: file.path,
            line: lineNum + 1,
            snippet: line.trim(),
            rootCause: 'Unresolved code comment',
            suggestedFix: 'Address the TODO/FIXME or convert to a tracked issue',
            estimatedTime: '30 min'
          });
        }
      });

      // Check for large functions
      let braceDepth = 0;
      let funcStart = -1;
      let funcName = '';
      lines.forEach((line, lineNum) => {
        const funcMatch = line.match(/(?:function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(?)/);
        if (funcMatch && line.includes('{')) {
          funcStart = lineNum;
          funcName = funcMatch[1] || funcMatch[2] || 'anonymous';
        }
        braceDepth += (line.match(/{/g) || []).length;
        braceDepth -= (line.match(/}/g) || []).length;

        if (funcStart >= 0 && braceDepth === 0 && lineNum > funcStart) {
          const funcLength = lineNum - funcStart;
          if (funcLength > 80) {
            this.addBug({
              title: 'Large function detected',
              description: `Function "${funcName}" is ${funcLength} lines long. Consider breaking it into smaller functions.`,
              category: 'slow-component',
              severity: 'low',
              file: file.path,
              line: funcStart + 1,
              rootCause: 'Function is too long and complex',
              suggestedFix: 'Refactor into smaller, focused helper functions',
              estimatedTime: '1 hour'
            });
            this.scores.maintainability -= 3;
          }
          funcStart = -1;
        }
      });

      // React-specific checks
      if (['.jsx', '.tsx'].includes(file.extension)) {
        // Check for missing key prop in lists
        if (content.includes('.map(') && !content.includes('key=')) {
          this.addBug({
            title: 'Potentially missing key prop in list',
            description: 'A .map() call was found without a "key" prop. React requires unique keys for list items.',
            category: 'react-error',
            severity: 'medium',
            file: file.path,
            rootCause: 'Missing key prop in mapped elements',
            suggestedFix: 'Add a unique key prop to each mapped element: <Component key={item.id} />',
            estimatedTime: '10 min'
          });
          this.scores.codeQuality -= 3;
        }

        // Check for direct state mutation
        if (content.includes('this.state.') && content.includes('this.state.') && content.match(/this\.state\.\w+\s*=/)) {
          this.addBug({
            title: 'Direct state mutation detected',
            description: 'State is being mutated directly instead of using setState.',
            category: 'react-error',
            severity: 'high',
            file: file.path,
            rootCause: 'Direct state mutation',
            suggestedFix: 'Use this.setState() or the useState hook setter function',
            estimatedTime: '15 min'
          });
          this.scores.codeQuality -= 5;
        }

        // Check for missing useEffect cleanup
        if (content.includes('useEffect') && (content.includes('addEventListener') || content.includes('setInterval') || content.includes('setTimeout'))) {
          if (!content.includes('removeEventListener') && !content.includes('clearInterval') && !content.includes('clearTimeout')) {
            this.addBug({
              title: 'Possible memory leak in useEffect',
              description: 'useEffect adds event listeners or timers but may not clean them up.',
              category: 'memory-leak',
              severity: 'high',
              file: file.path,
              rootCause: 'Missing cleanup function in useEffect',
              suggestedFix: 'Return a cleanup function from useEffect that removes listeners/clears timers',
              estimatedTime: '15 min'
            });
            this.scores.performance -= 5;
          }
        }
      }

      // Check for eval usage
      if (content.includes('eval(')) {
        this.addBug({
          title: 'Dangerous eval() usage',
          description: 'eval() is a security risk and performance issue. Never use in production.',
          category: 'security',
          severity: 'critical',
          file: file.path,
          rootCause: 'Use of eval() function',
          suggestedFix: 'Replace eval() with safer alternatives like JSON.parse() or Function constructors',
          estimatedTime: '30 min'
        });
        this.scores.security -= 15;
      }

      // Check for hardcoded secrets
      const secretPatterns = [
        /(?:api[_-]?key|apikey|secret|password|token|auth)\s*[:=]\s*['"`](?!process\.env)[^'"`]{8,}/gi,
        /(?:sk|pk)[-_](?:test|live)[-_]\w{10,}/g,
        /Bearer\s+[A-Za-z0-9+/=]{20,}/g
      ];

      secretPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          this.addBug({
            title: 'Possible hardcoded secret',
            description: 'Found what appears to be a hardcoded API key, token, or secret.',
            category: 'security',
            severity: 'critical',
            file: file.path,
            rootCause: 'Hardcoded sensitive credentials',
            suggestedFix: 'Move secrets to environment variables',
            estimatedTime: '15 min'
          });
          this.scores.security -= 20;
        }
      });

      // Very large file check
      if (lines.length > 500) {
        this.addBug({
          title: 'Very large file',
          description: `File has ${lines.length} lines. Consider splitting into modules.`,
          category: 'slow-component',
          severity: 'info',
          file: file.path,
          rootCause: 'File is too large',
          suggestedFix: 'Split into multiple smaller, focused modules',
          estimatedTime: '2 hours'
        });
        this.scores.maintainability -= 2;
      }
    });
  }

  // ─── Performance Analysis ─────────────────────────────────────────
  analyzePerformance() {
    // Check for large images
    const imageFiles = this.getFilesByType(['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff']);
    imageFiles.forEach(file => {
      if (file.size > 500000) {
        this.addBug({
          title: 'Large image file',
          description: `Image "${file.name}" is ${Math.round(file.size / 1024)}KB. Optimize for web.`,
          category: 'large-image',
          severity: file.size > 2000000 ? 'high' : 'medium',
          file: file.path,
          rootCause: 'Unoptimized image file',
          suggestedFix: 'Compress the image or convert to WebP/AVIF format',
          estimatedTime: '10 min'
        });
        this.scores.performance -= 3;
      }
    });

    // Check for large JavaScript bundles
    const jsFiles = this.getFilesByType(['.js', '.mjs']);
    const totalJSSize = jsFiles.reduce((sum, f) => sum + (f.size || 0), 0);

    if (totalJSSize > 1000000) {
      this.addBug({
        title: 'Large JavaScript bundle',
        description: `Total JS size is ${Math.round(totalJSSize / 1024)}KB. Consider code splitting.`,
        category: 'large-bundle',
        severity: 'high',
        rootCause: 'Too much JavaScript loaded',
        suggestedFix: 'Implement code splitting with dynamic imports and lazy loading',
        estimatedTime: '2 hours'
      });
      this.scores.performance -= 10;
    }

    // Check for render-blocking resources in HTML
    const htmlFiles = this.getFilesByType(['.html', '.htm']);
    htmlFiles.forEach(file => {
      if (!file.content) return;
      const $ = cheerio.load(file.content);

      // Check for render-blocking scripts
      $('script:not([async]):not([defer])[src]').each((_, el) => {
        const src = $(el).attr('src');
        if (src && !src.includes('analytics') && !src.includes('gtag')) {
          this.addBug({
            title: 'Render-blocking script',
            description: `Script "${src}" is render-blocking. Add async or defer attribute.`,
            category: 'render-blocking',
            severity: 'medium',
            file: file.path,
            rootCause: 'Script without async or defer attribute',
            suggestedFix: 'Add "defer" or "async" attribute to the script tag',
            estimatedTime: '5 min'
          });
          this.scores.performance -= 3;
        }
      });

      // Check for missing lazy loading on images
      $('img:not([loading])').each((i, el) => {
        if (i > 2) { // First few images above fold are ok
          this.addBug({
            title: 'Missing lazy loading on image',
            description: `Image "${$(el).attr('src') || 'unnamed'}" should use loading="lazy" for below-fold images.`,
            category: 'performance',
            severity: 'low',
            file: file.path,
            rootCause: 'Image without lazy loading',
            suggestedFix: 'Add loading="lazy" to images below the fold',
            estimatedTime: '5 min'
          });
          this.scores.performance -= 1;
        }
      });
    });

    // Check for unused dependencies in package.json
    const packageJson = this.files.find(f => f.name === 'package.json');
    if (packageJson && packageJson.content) {
      try {
        const pkg = JSON.parse(packageJson.content);
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
        const depNames = Object.keys(allDeps);

        // Check for duplicate-like dependencies
        const categories = {};
        depNames.forEach(dep => {
          if (dep.includes('lodash')) (categories.lodash = categories.lodash || []).push(dep);
          if (dep.includes('moment') || dep.includes('dayjs') || dep.includes('date-fns'))
            (categories.dates = categories.dates || []).push(dep);
          if (dep.includes('axios') || dep.includes('node-fetch') || dep.includes('got'))
            (categories.http = categories.http || []).push(dep);
        });

        Object.entries(categories).forEach(([cat, deps]) => {
          if (deps.length > 1) {
            this.addBug({
              title: 'Duplicate dependency category',
              description: `Multiple ${cat} libraries found: ${deps.join(', ')}. Choose one to reduce bundle size.`,
              category: 'duplicate-dependency',
              severity: 'low',
              file: 'package.json',
              rootCause: 'Multiple libraries serving the same purpose',
              suggestedFix: `Pick one ${cat} library and remove the rest`,
              estimatedTime: '30 min'
            });
          }
        });
      } catch (e) {}
    }
  }

  // ─── Accessibility Analysis ───────────────────────────────────────
  analyzeAccessibility() {
    const htmlFiles = this.getFilesByType(['.html', '.htm']);

    htmlFiles.forEach(file => {
      if (!file.content) return;
      const $ = cheerio.load(file.content);

      // Check document language
      const lang = $('html').attr('lang');
      if (!lang) {
        this.addBug({
          title: 'Missing document language',
          description: 'The <html> element is missing a lang attribute.',
          category: 'accessibility',
          severity: 'medium',
          file: file.path,
          rootCause: 'No lang attribute on html element',
          suggestedFix: 'Add lang="en" (or appropriate language) to the <html> tag',
          estimatedTime: '5 min'
        });
        this.scores.accessibility -= 5;
      }

      // Check color contrast (basic check for common low-contrast patterns)
      const styleContent = [];
      $('style').each((_, el) => { styleContent.push($(el).html()); });

      // Check for skip navigation link
      const hasSkipNav = $('a[href="#main"], a[href="#content"], .skip-nav, .skip-link').length > 0;
      if (!hasSkipNav && file.name === 'index.html') {
        this.addBug({
          title: 'Missing skip navigation link',
          description: 'No skip navigation link found. This helps keyboard users skip repetitive navigation.',
          category: 'accessibility',
          severity: 'low',
          file: file.path,
          rootCause: 'Missing skip navigation link',
          suggestedFix: 'Add a "Skip to main content" link as the first focusable element',
          estimatedTime: '15 min'
        });
        this.scores.accessibility -= 2;
      }

      // Check for tabindex > 0
      $('[tabindex]').each((_, el) => {
        const tabindex = parseInt($(el).attr('tabindex'));
        if (tabindex > 0) {
          this.addBug({
            title: 'Positive tabindex value',
            description: 'Positive tabindex values disrupt the natural tab order.',
            category: 'accessibility',
            severity: 'medium',
            file: file.path,
            rootCause: 'Positive tabindex modifying tab order',
            suggestedFix: 'Use tabindex="0" or tabindex="-1" instead',
            estimatedTime: '10 min'
          });
          this.scores.accessibility -= 3;
        }
      });

      // Check for autoplay media
      $('video[autoplay], audio[autoplay]').each((_, el) => {
        this.addBug({
          title: 'Media autoplay detected',
          description: 'Autoplaying media can be disruptive for screen reader users.',
          category: 'accessibility',
          severity: 'medium',
          file: file.path,
          rootCause: 'Autoplay attribute on media element',
          suggestedFix: 'Remove autoplay or add muted attribute and user controls',
          estimatedTime: '10 min'
        });
        this.scores.accessibility -= 3;
      });
    });
  }

  // ─── SEO Analysis ─────────────────────────────────────────────────
  analyzeSEO() {
    const htmlFiles = this.getFilesByType(['.html', '.htm']);

    htmlFiles.forEach(file => {
      if (!file.content) return;
      const $ = cheerio.load(file.content);

      // Check for robots meta
      const robots = $('meta[name="robots"]').attr('content');

      // Check schema markup
      const hasSchema = $('script[type="application/ld+json"]').length > 0;
      if (!hasSchema && file.name === 'index.html') {
        this.addBug({
          title: 'Missing structured data',
          description: 'No JSON-LD structured data found. This improves search result appearance.',
          category: 'seo',
          severity: 'low',
          file: file.path,
          rootCause: 'No Schema.org structured data',
          suggestedFix: 'Add JSON-LD structured data for your content type',
          estimatedTime: '30 min'
        });
        this.scores.seo -= 3;
      }

      // Check image alt text quality
      $('img[alt]').each((_, el) => {
        const alt = $(el).attr('alt');
        if (alt && (alt === 'image' || alt === 'photo' || alt === 'picture' || alt === 'img' || alt.length < 3)) {
          this.addBug({
            title: 'Poor image alt text',
            description: `Alt text "${alt}" is not descriptive enough for SEO and accessibility.`,
            category: 'seo',
            severity: 'low',
            file: file.path,
            rootCause: 'Generic or too-short alt text',
            suggestedFix: 'Use descriptive alt text that explains the image content',
            estimatedTime: '5 min'
          });
          this.scores.seo -= 1;
        }
      });
    });

    // Check for sitemap.xml
    const hasSitemap = this.files.some(f => f.name === 'sitemap.xml');
    if (!hasSitemap) {
      this.addBug({
        title: 'Missing sitemap.xml',
        description: 'No sitemap.xml file found. Sitemaps help search engines discover and index pages.',
        category: 'seo',
        severity: 'low',
        rootCause: 'No sitemap file in project',
        suggestedFix: 'Create a sitemap.xml with all important page URLs',
        estimatedTime: '30 min'
      });
      this.scores.seo -= 3;
    }

    // Check for robots.txt
    const hasRobots = this.files.some(f => f.name === 'robots.txt');
    if (!hasRobots) {
      this.addBug({
        title: 'Missing robots.txt',
        description: 'No robots.txt file found. This file guides search engine crawlers.',
        category: 'seo',
        severity: 'low',
        rootCause: 'No robots.txt file',
        suggestedFix: 'Create a robots.txt with appropriate crawl directives',
        estimatedTime: '10 min'
      });
      this.scores.seo -= 2;
    }
  }

  // ─── Security Analysis ────────────────────────────────────────────
  analyzeSecurity() {
    const jsFiles = this.getFilesByType(['.js', '.jsx', '.ts', '.tsx']);

    jsFiles.forEach(file => {
      if (!file.content) return;

      // Check for innerHTML usage (XSS risk)
      if (file.content.includes('innerHTML') || file.content.includes('dangerouslySetInnerHTML')) {
        this.addBug({
          title: 'XSS vulnerability risk',
          description: 'innerHTML or dangerouslySetInnerHTML usage detected. This can lead to XSS attacks.',
          category: 'security',
          severity: 'high',
          file: file.path,
          rootCause: 'Using innerHTML with potentially untrusted content',
          suggestedFix: 'Use textContent instead of innerHTML, or sanitize HTML with DOMPurify',
          estimatedTime: '30 min'
        });
        this.scores.security -= 10;
      }

      // Check for SQL injection patterns
      if (file.content.match(/\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|DROP)/i) ||
          file.content.match(/['"`]\s*\+\s*.*\+\s*['"`].*(?:SELECT|INSERT|UPDATE|DELETE)/i)) {
        this.addBug({
          title: 'Potential SQL injection',
          description: 'String concatenation in SQL queries detected. Use parameterized queries.',
          category: 'security',
          severity: 'critical',
          file: file.path,
          rootCause: 'SQL query built with string concatenation',
          suggestedFix: 'Use parameterized queries or an ORM',
          estimatedTime: '30 min'
        });
        this.scores.security -= 20;
      }

      // Check for missing HTTPS
      const httpUrls = file.content.match(/http:\/\/(?!localhost|127\.0\.0\.1)/g);
      if (httpUrls && httpUrls.length > 0) {
        this.addBug({
          title: 'Insecure HTTP URL',
          description: `Found ${httpUrls.length} HTTP URLs. Use HTTPS for security.`,
          category: 'security',
          severity: 'medium',
          file: file.path,
          rootCause: 'Using HTTP instead of HTTPS',
          suggestedFix: 'Replace http:// with https:// for all external URLs',
          estimatedTime: '15 min'
        });
        this.scores.security -= 5;
      }
    });

    // Check for .env file in project (should be gitignored)
    const envFile = this.files.find(f => f.name === '.env');
    if (envFile && envFile.content) {
      this.addBug({
        title: '.env file contains secrets',
        description: 'The .env file is included in the project. Ensure it is in .gitignore.',
        category: 'security',
        severity: 'critical',
        file: '.env',
        rootCause: '.env file with secrets not excluded',
        suggestedFix: 'Add .env to .gitignore and use .env.example for templates',
        estimatedTime: '5 min'
      });
      this.scores.security -= 15;
    }

    // Check for package vulnerabilities indicators
    const packageLock = this.files.find(f => f.name === 'package-lock.json' || f.name === 'yarn.lock');
    const packageJson = this.files.find(f => f.name === 'package.json');
    if (packageJson && packageJson.content) {
      try {
        const pkg = JSON.parse(packageJson.content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        // Known problematic old versions
        const knownVulnerable = {
          'lodash': '4.17.20',
          'minimist': '1.2.5',
          'axios': '0.21.0',
          'express': '4.17.0'
        };

        // This is simplified - in production would check npm audit API
      } catch (e) {}
    }
  }

  // ─── Code Quality Analysis ────────────────────────────────────────
  analyzeCodeQuality() {
    // Check for ESLint config
    const hasEslint = this.files.some(f =>
      f.name === '.eslintrc' || f.name === '.eslintrc.js' || f.name === '.eslintrc.json' || f.name === '.eslintrc.yml'
    );

    if (!hasEslint) {
      this.addBug({
        title: 'Missing ESLint configuration',
        description: 'No ESLint configuration found. Linting helps maintain code quality.',
        category: 'other',
        severity: 'info',
        rootCause: 'No linting setup',
        suggestedFix: 'Add an ESLint configuration file with appropriate rules',
        estimatedTime: '30 min'
      });
      this.scores.codeQuality -= 5;
    }

    // Check for .gitignore
    const hasGitignore = this.files.some(f => f.name === '.gitignore');
    if (!hasGitignore) {
      this.addBug({
        title: 'Missing .gitignore',
        description: 'No .gitignore file found. This can lead to committing unwanted files.',
        category: 'other',
        severity: 'low',
        rootCause: 'No .gitignore file',
        suggestedFix: 'Add a .gitignore file with common exclusions (node_modules, .env, etc.)',
        estimatedTime: '10 min'
      });
      this.scores.codeQuality -= 3;
    }

    // Check for README
    const hasReadme = this.files.some(f => f.name.toLowerCase() === 'readme.md' || f.name.toLowerCase() === 'readme');
    if (!hasReadme) {
      this.addBug({
        title: 'Missing README',
        description: 'No README file found. Projects should have documentation.',
        category: 'other',
        severity: 'info',
        rootCause: 'No README file',
        suggestedFix: 'Add a README.md with project description, setup instructions, and usage guide',
        estimatedTime: '30 min'
      });
      this.scores.maintainability -= 5;
    }
  }

  // ─── Calculate Final Scores ───────────────────────────────────────
  calculateScores() {
    // Clamp all scores to 0-100
    Object.keys(this.scores).forEach(key => {
      this.scores[key] = Math.max(0, Math.min(100, this.scores[key]));
    });

    // Calculate overall score (weighted average)
    this.scores.overall = Math.round(
      (this.scores.performance * 0.25 +
       this.scores.accessibility * 0.20 +
       this.scores.seo * 0.15 +
       this.scores.security * 0.25 +
       this.scores.codeQuality * 0.10 +
       this.scores.maintainability * 0.05)
    );
  }
}

module.exports = AnalyzerService;
