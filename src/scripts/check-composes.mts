import fs from 'fs';
import path from 'node:path';
import glob from 'fast-glob';
import ts from 'typescript';

const projectRoot = process.cwd();
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');

/**
 * Checks whether a given CSS class exists in a TypeScript `.d.ts` file generated from a CSS Module.
 *
 * The function parses the `.d.ts` file using the TypeScript compiler API, so it works
 * regardless of whether the keys are quoted or unquoted, and handles any formatting.
 */
function hasClassInDts(dtsPath: string, className: string): boolean {
  const content = fs.readFileSync(dtsPath, 'utf8');
  const sourceFile = ts.createSourceFile(
    dtsPath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let found = false;

  const visit = (node: ts.Node) => {
    if (ts.isTypeLiteralNode(node)) {
      for (const member of node.members) {
        if (ts.isPropertySignature(member)) {
          const name = member.name.getText(sourceFile).replace(/['"]/g, '');
          if (name === className) {
            found = true;
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };

  ts.forEachChild(sourceFile, visit);
  return found;
}

/**
 * Load and parse tsconfig.json properly (supports comments, extends, etc.)
 */
function loadTsConfig(tsconfigPath: string) {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (configFile.error) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext([configFile.error], {
        getCanonicalFileName: (f: string) => f,
        getCurrentDirectory: ts.sys.getCurrentDirectory,
        getNewLine: () => '\n',
      })
    );
  }

  const parsed = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );

  return parsed.options;
}

const compilerOptions = loadTsConfig(tsconfigPath);
const baseUrl: string = compilerOptions.baseUrl || '.';
const paths: Record<string, string[]> = compilerOptions.paths || {};

/**
 * Resolve an alias like @components/foo/bar.module.css
 */
function resolveAlias(importPath: string): string {
  for (const [alias, replacements] of Object.entries(paths)) {
    const aliasPrefix = alias.replace(/\*$/, '');
    if (importPath.startsWith(aliasPrefix)) {
      if (!replacements || !replacements[0]) continue;
      const relative = importPath.replace(
        aliasPrefix,
        replacements[0].replace(/\*$/, '')
      );
      return path.resolve(projectRoot, baseUrl, relative);
    }
  }
  return path.resolve(projectRoot, baseUrl, importPath);
}

/**
 * Validate any composes imports in *.module.css to prevent silent import fails
 */
async function validateComposes() {
  const cssFiles = await glob('src/**/*.module.css', { cwd: projectRoot });

  let hasErrors = false;

  for (const file of cssFiles) {
    const content = await fs.promises.readFile(
      path.join(projectRoot, file),
      'utf8'
    );

    const regex = /composes:\s+([\w-]+)\s+from\s+['"]([^'"]+)['"]/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const [, rawClassName, importPath] = match;
      const className = rawClassName?.trim();
      if (!importPath || !className) continue;
      const resolvedPath = resolveAlias(importPath);
      const dtsPath = `${resolvedPath}.d.ts`;

      try {
        if (!hasClassInDts(dtsPath, className)) {
          console.error(
            `❌ Missing class "${className}" in ${dtsPath} (referenced from ${file})`
          );
          hasErrors = true;
        }
      } catch {
        console.error(
          `❌ Missing declaration file for ${importPath} (referenced from ${file})`
        );
        hasErrors = true;
      }
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('✅ All composes imports are valid!');
  }
}

validateComposes().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});

// To run this script execute it with Node.js:
// node --experimental-transform-types ./src/scripts/check-composes.mts
