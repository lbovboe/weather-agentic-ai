# Contributing to WeatherBot AI

<div align="center">

![Contributing Banner](https://img.shields.io/badge/Contributors-Welcome-brightgreen?style=for-the-badge&logo=github&logoColor=white)

**Thank you for your interest in contributing to WeatherBot AI!** 🎉

This guide will help you get started with contributing to our intelligent weather assistant powered by OpenAI GPT-4o Mini.

</div>

---

## 📖 Table of Contents

- [🤝 Welcome Contributors](#-welcome-contributors)
- [🎯 Types of Contributions](#-types-of-contributions)
- [🚀 Quick Start for Contributors](#-quick-start-for-contributors)
- [💻 Development Environment Setup](#-development-environment-setup)
- [📋 Code Standards & Guidelines](#-code-standards--guidelines)
- [🧪 Testing Requirements](#-testing-requirements)
- [🔄 Pull Request Process](#-pull-request-process)
- [🐛 Reporting Issues](#-reporting-issues)
- [💡 Feature Requests](#-feature-requests)
- [📚 Documentation Contributions](#-documentation-contributions)
- [🏆 Recognition](#-recognition)
- [📞 Getting Help](#-getting-help)

---

## 🤝 Welcome Contributors

WeatherBot AI is an open-source project that welcomes contributions from developers of all skill levels! Whether you're:

- 🆕 **New to open source** - We have good first issues labeled for beginners
- 🎯 **Experienced developer** - Help us build advanced features
- 🎨 **UI/UX enthusiast** - Improve our design and user experience
- 📝 **Documentation lover** - Help make our docs even better
- 🧪 **Testing expert** - Enhance our test coverage
- 🌍 **Accessibility advocate** - Make our app more inclusive

**Your contributions make this project better for everyone!**

---

## 🎯 Types of Contributions

We welcome various types of contributions:

### 🔧 **Code Contributions**

- **Bug fixes** - Help us squash those pesky bugs
- **New features** - Add exciting functionality
- **Performance improvements** - Make the app faster
- **Accessibility enhancements** - Improve inclusivity
- **UI/UX improvements** - Polish the user experience

### 📚 **Documentation**

- **README improvements** - Make setup clearer
- **Code comments** - Help others understand the code
- **API documentation** - Document endpoints and responses
- **Tutorials** - Help users get started
- **Translation** - Multi-language support

### 🧪 **Testing**

- **Unit tests** - Test individual components
- **Integration tests** - Test API endpoints
- **E2E tests** - Test complete user workflows
- **Performance tests** - Ensure app remains fast
- **Accessibility tests** - Verify WCAG compliance

### 🐛 **Quality Assurance**

- **Bug reports** - Help us identify issues
- **Feature testing** - Test new functionality
- **Cross-browser testing** - Ensure compatibility
- **Mobile testing** - Verify responsive design

---

## 🚀 Quick Start for Contributors

### **1. Fork & Clone**

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/weather-agentic-ai.git
cd weather-agentic-ai

# Add upstream remote
git remote add upstream https://github.com/lbovboe/weather-agentic-ai.git
```

### **2. Install Dependencies**

```bash
# Install all dependencies
npm install

# Verify installation
npm run type-check
```

### **3. Environment Setup**

```bash
# Copy environment template
cp .env.example .env.local

# Add your API keys (see README for details)
# OPENAI_API_KEY=your-key-here
# WEATHER_API_KEY=your-key-here
```

### **4. Start Development**

```bash
# Start development server
npm run dev

# Open http://localhost:3000
# Start coding! 🚀
```

---

## 💻 Development Environment Setup

### **Prerequisites**

- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** 2.30.0 or higher
- **VSCode** (recommended) with suggested extensions

### **Recommended VSCode Extensions**

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "streetsidesoftware.code-spell-checker",
    "ms-vscode.vscode-json"
  ]
}
```

### **Development Scripts**

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier

# Testing
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

---

## 📋 Code Standards & Guidelines

### **🎯 General Principles**

- **Clarity over cleverness** - Write code that's easy to understand
- **Consistent formatting** - Use Prettier and ESLint
- **Type safety** - Leverage TypeScript's full potential
- **Performance first** - Consider impact on user experience
- **Accessibility always** - Follow WCAG 2.1 AA guidelines

### **🔷 TypeScript Standards**

```typescript
// ✅ Good: Explicit types, clear naming
interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  timestamp: Date;
}

const fetchWeatherData = async (location: string): Promise<WeatherData> => {
  // Implementation
};

// ❌ Bad: Any types, unclear names
const getData = (loc: any): any => {
  // Implementation
};
```

### **🎨 Component Standards**

```typescript
// ✅ Good: Functional component with types
interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ content, role, timestamp }) => {
  return <div className="flex flex-col space-y-2">{/* Component implementation */}</div>;
};

// ❌ Bad: No types, unclear structure
export const Message = ({ content, role }) => {
  return <div>{content}</div>;
};
```

### **🎭 Styling Guidelines**

```typescript
// ✅ Good: Tailwind utility classes, semantic structure
<button
  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  aria-label="Send message"
>
  Send
</button>

// ❌ Bad: Inline styles, no accessibility
<button style={{backgroundColor: 'blue'}} onClick={handleClick}>
  Send
</button>
```

### **📝 Naming Conventions**

```typescript
// Files
ChatMessage.tsx; // Components: PascalCase
weatherService.ts; // Services: camelCase
index.ts; // Barrel exports

// Variables & Functions
const userName = "John"; // camelCase
const API_BASE_URL = "https://"; // Constants: SNAKE_CASE
const fetchUserData = () => {}; // Functions: camelCase

// Types & Interfaces
interface User {} // Interfaces: PascalCase
type WeatherCondition = string; // Types: PascalCase
enum MessageRole {} // Enums: PascalCase
```

---

## 🧪 Testing Requirements

### **Test Coverage Goals**

- **Minimum 80% code coverage**
- **All new features must include tests**
- **Bug fixes must include regression tests**
- **Critical paths require E2E tests**

### **Testing Structure**

```bash
__tests__/
├── components/          # Component tests
├── api/                # API route tests
├── utils/              # Utility function tests
├── e2e/                # End-to-end tests
└── __mocks__/          # Test mocks
```

### **Example Test**

```typescript
// components/__tests__/ChatMessage.test.tsx
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "../ChatMessage";

describe("ChatMessage", () => {
  it("renders user message correctly", () => {
    render(
      <ChatMessage
        content="What's the weather?"
        role="user"
        timestamp={new Date()}
      />
    );

    expect(screen.getByText("What's the weather?")).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("data-role", "user");
  });

  it("handles empty content gracefully", () => {
    render(
      <ChatMessage
        content=""
        role="user"
        timestamp={new Date()}
      />
    );

    expect(screen.getByRole("article")).toBeInTheDocument();
  });
});
```

### **Running Tests**

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test ChatMessage.test.tsx

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 🔄 Pull Request Process

### **Before Creating a PR**

1. **🔍 Check existing issues** - Make sure your work isn't duplicated
2. **🌿 Create feature branch** - `git checkout -b feature/amazing-feature`
3. **✅ Run tests** - Ensure all tests pass
4. **🔧 Lint code** - Fix any linting errors
5. **📝 Update docs** - Document new features

### **PR Checklist**

- [ ] **Branch is up to date** with main branch
- [ ] **All tests pass** (`npm run test`)
- [ ] **No linting errors** (`npm run lint`)
- [ ] **TypeScript compiles** (`npm run type-check`)
- [ ] **Code coverage maintained** (minimum 80%)
- [ ] **Documentation updated** (if applicable)
- [ ] **Accessibility tested** (screen reader, keyboard navigation)
- [ ] **Mobile responsive** (tested on different screen sizes)

### **PR Template**

```markdown
## 📋 Description

Brief description of changes and motivation.

## 🎯 Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## 🧪 Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## 📱 Screenshots (if applicable)

| Before         | After         |
| -------------- | ------------- |
| ![before](url) | ![after](url) |

## ✅ Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No new warnings or errors
```

### **Review Process**

1. **🤖 Automated checks** - GitHub Actions run tests and linting
2. **👥 Code review** - At least one maintainer reviews
3. **🔄 Address feedback** - Make requested changes
4. **✅ Final approval** - Maintainer approves and merges

---

## 🐛 Reporting Issues

### **Before Reporting**

1. **🔍 Search existing issues** - Check if already reported
2. **🧪 Test with latest version** - Ensure bug still exists
3. **🌐 Try different browsers** - Check if browser-specific
4. **📱 Test mobile/desktop** - Verify across devices

### **Bug Report Template**

```markdown
## 🐛 Bug Description

Clear description of the bug.

## 🔄 Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. See error

## ✅ Expected Behavior

What should happen.

## ❌ Actual Behavior

What actually happens.

## 🖼️ Screenshots

Add screenshots if applicable.

## 🌐 Environment

- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 95.0]
- Node.js: [e.g. 18.0.0]
- Version: [e.g. 1.0.0]

## 📝 Additional Context

Any other context about the problem.
```

---

## 💡 Feature Requests

### **Feature Request Template**

```markdown
## 💡 Feature Description

Clear description of the proposed feature.

## 🎯 Problem Statement

What problem does this feature solve?

## ✨ Proposed Solution

How would you like this feature to work?

## 🔄 Alternatives Considered

What other solutions did you consider?

## 📊 Additional Context

- User research
- Mockups/designs
- Technical considerations
```

### **Feature Evaluation Criteria**

- **🎯 User value** - Does it solve a real problem?
- **🔧 Technical feasibility** - Can we build it efficiently?
- **🎨 Design consistency** - Does it fit our UI/UX?
- **📈 Maintenance cost** - Long-term sustainability
- **♿ Accessibility** - Works for all users

---

## 📚 Documentation Contributions

### **Documentation Standards**

- **📝 Clear language** - Write for developers of all levels
- **🖼️ Visual examples** - Include code snippets and screenshots
- **🔗 Link references** - Connect related topics
- **✅ Test instructions** - Verify all steps work
- **📱 Mobile considerations** - Consider mobile users

### **Documentation Types**

- **API docs** - Endpoint specifications
- **Component docs** - Usage examples
- **Setup guides** - Installation instructions
- **Tutorials** - Step-by-step walkthroughs
- **Troubleshooting** - Common issues and solutions

---

## 🏆 Recognition

### **Contributors Hall of Fame**

We recognize contributors in multiple ways:

- **📛 GitHub profile** - Listed in repository contributors
- **🏷️ Release notes** - Mentioned in release announcements
- **💌 Thank you issues** - Personal appreciation
- **🎯 Good first issue** - Labeled issues for new contributors
- **🌟 Contributor of the month** - Special recognition

### **Contribution Types Recognized**

- 💻 **Code** - Features, bug fixes, improvements
- 📚 **Documentation** - Guides, tutorials, API docs
- 🎨 **Design** - UI/UX improvements, graphics
- 🧪 **Testing** - Test coverage, quality assurance
- 🐛 **Bug Reports** - High-quality issue reports
- 💡 **Ideas** - Feature requests and suggestions
- 🤝 **Community** - Helping other contributors

---

## 📞 Getting Help

### **Ways to Get Support**

- **💬 GitHub Discussions** - General questions and ideas
- **🐛 GitHub Issues** - Bug reports and feature requests
- **📧 Email** - Direct contact for sensitive matters
- **📝 Documentation** - Comprehensive guides and examples

### **Response Times**

- **🐛 Critical bugs** - Within 24 hours
- **💡 Feature requests** - Within 1 week
- **❓ General questions** - Within 3 days
- **📝 Documentation** - Within 1 week

### **Community Guidelines**

- **🤝 Be respectful** - Treat everyone with kindness
- **🎯 Stay on topic** - Keep discussions relevant
- **🔍 Search first** - Check existing conversations
- **📝 Be clear** - Provide context and details
- **💡 Help others** - Share your knowledge

---

## 🎉 Thank You!

**Your contributions make WeatherBot AI better for everyone!**

Whether you're fixing a typo, adding a feature, or helping other contributors, every contribution is valuable and appreciated.

### **Ready to contribute?**

1. **🍴 Fork the repository**
2. **🌿 Create your feature branch**
3. **💻 Make your changes**
4. **🧪 Test thoroughly**
5. **📝 Submit a pull request**

**Happy coding! 🚀**

---

<div align="center">

**Questions? Found this guide helpful? Let us know!**

[🔝 Back to Top](#contributing-to-weatherbot-ai)

</div>
