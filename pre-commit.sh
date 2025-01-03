#!/bin/sh
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

# Run ESLint
echo "Running ESLint..."
npm run lint || {
    echo "❌ ESLint check failed. Please fix the errors before committing."
    exit 1
}

# Run TypeScript type checking
echo "Running TypeScript type checking..."
npm run typecheck || {
    echo "❌ TypeScript check failed. Please fix the type errors before committing."
    exit 1
}

echo "✅ All pre-commit checks passed!"
exit 0