# Contributing to the Audio Transcription & Translation Platform

Thank you for your interest in contributing to our project! This document provides guidelines and instructions for contributing to both the backend API and frontend application.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## How to Contribute

### Reporting Issues

- Use the GitHub issue tracker to report bugs or suggest features
- Include detailed steps to reproduce any bugs
- Include browser/environment information for frontend issues
- For backend issues, include relevant error messages and logs

### Pull Requests

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Commit your changes with clear, descriptive commit messages
4. Create a pull request against the main branch
5. Reference any related issues in your PR description

## Development Setup

### Prerequisites

- Node.js 16+ and npm
- OpenAI API key for testing
- Git

### Backend Setup

```bash
cd audio-api-backend
npm install
cp .env.example .env  # Then edit .env with your OpenAI API key
npm run dev
```

### Frontend Setup

```bash
cd audio-transcription-frontend
npm install
npm run dev
```

## Coding Standards

### General Guidelines

- Follow modern JavaScript best practices
- Use meaningful variable and function names
- Keep functions small and focused on a single responsibility
- Add JSDoc comments for functions and complex code blocks
- Write clear commit messages following conventional commits format

### Backend Guidelines

- Follow RESTful API design principles
- Use async/await for asynchronous operations
- Include proper error handling with try/catch blocks
- Document API endpoints with OpenAPI annotations
- Follow the established controller/route pattern

### Frontend Guidelines

- Use modular component architecture
- Follow functional programming paradigms where appropriate
- Avoid direct DOM manipulation outside of component initialization
- Ensure responsive design on all components
- Follow accessibility (a11y) best practices

## Testing

### Backend Testing

We use Jest for backend testing:

```bash
cd audio-api-backend
npm test
```

When contributing new features, please include tests that cover the new functionality.

### Frontend Testing

For frontend testing:

```bash
cd audio-transcription-frontend
npm test
```

## Documentation

- Update relevant documentation when changing code
- Document new features thoroughly
- Use JSDoc comments for code documentation
- Update README files as necessary

## Feature Requests

We welcome feature requests! When proposing a new feature:

1. Check if the feature has already been suggested
2. Clearly describe the problem the feature would solve
3. Suggest an approach for implementation if possible
4. Consider the impact on existing functionality

## AI Integration Guidelines

When working with AI features:

1. Ensure prompts are clear and well-structured
2. Consider edge cases in LLM responses
3. Include fallbacks when AI services might fail
4. Be mindful of token usage and API costs
5. Consider privacy implications of data sent to AI services

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.

## Questions?

If you have questions about contributing, please open an issue and we'll be happy to help!

Thank you for contributing to making this project better!
