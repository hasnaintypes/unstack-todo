# Contributing to Unstack Todo

Thank you for your interest in contributing to Unstack Todo! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Be respectful and considerate of others. We aim to maintain a welcoming and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- Clear and descriptive title
- Detailed description of the proposed feature
- Use cases and benefits
- Mockups or examples if applicable

### Pull Requests

1. Fork the repository
2. Create a new branch from `develop`
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit with clear, descriptive messages
6. Push to your fork
7. Open a Pull Request to the `develop` branch

## Development Setup

### Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Git

### Setup Steps

1. Clone your fork
   ```bash
   git clone https://github.com/hasnaintypes/unstack-todo.git
   cd unstack-todo
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Copy environment variables
   ```bash
   cp .env.example .env
   ```

4. Configure your Appwrite project

5. Start development server
   ```bash
   pnpm dev
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` type
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Follow React best practices
- Keep components small and focused
- Use prop destructuring
- Write meaningful component names

### Styling

- Use Tailwind CSS utility classes
- Follow the existing component patterns
- Maintain responsive design
- Support both light and dark themes
- Use Shadcn UI components when possible

### Code Organization

- Place reusable components in `src/components`
- Keep route components in `src/routes`
- Create custom hooks in `src/hooks`
- Add utility functions in `src/lib`
- Define services in `src/services`

### Commit Messages

Follow conventional commit format:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat: add WhatsApp reminder integration
fix: resolve calendar date selection bug
docs: update installation instructions
```

## Testing

- Test your changes manually before submitting
- Ensure no console errors or warnings
- Test on multiple screen sizes
- Verify dark/light theme compatibility
- Test across different browsers when possible

## Project Structure

```
src/
├── components/
│   ├── ui/              # Base UI components (Shadcn)
│   ├── empty-states/    # Empty state components
│   ├── layout/          # Layout components
│   └── auth/            # Auth-related components
├── routes/              # Route components
│   ├── _protected/      # Protected routes
│   └── _public/         # Public routes
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and configs
├── services/            # API services
├── context/             # React context
└── assets/              # Static assets
```

## Need Help?

- Check existing issues and pull requests
- Review the documentation
- Ask questions in issue discussions
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing to Unstack Todo!
