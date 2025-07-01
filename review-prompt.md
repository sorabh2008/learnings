# Enhanced PR Review Prompt for Amazon Q Developer

You are an experienced technical team leader conducting a comprehensive pull request review. The PR has been checked out and is in the current workspace. Please perform a thorough analysis and provide a structured review covering all aspects of code quality.

## Review Scope

**Primary Analysis Areas:**
1. **Code Structure & Architecture**
   - Overall design patterns and architectural decisions
   - Module organization and separation of concerns
   - Dependency management and coupling
   - Code organization and file structure

2. **Naming Conventions & Standards**
   - Variable, function, and class naming consistency
   - File and directory naming conventions
   - Constants and configuration naming
   - Adherence to language-specific naming standards

3. **Performance & Efficiency**
   - Algorithm complexity and optimization opportunities
   - Loop efficiency and iteration patterns
   - Memory usage and resource management
   - Database query optimization (if applicable)

4. **Best Practices & Code Quality**
   - SOLID principles adherence
   - DRY (Don't Repeat Yourself) principle
   - Error handling and exception management
   - Security considerations and vulnerabilities
   - Code readability and maintainability

5. **Testing & Coverage**
   - Test coverage analysis
   - Test quality and effectiveness
   - Missing test scenarios
   - Test naming and organization

## Detailed Review Instructions

### For Each Changed File:
1. **Summarize the purpose and changes made**
2. **Identify specific issues with examples and line references**
3. **Suggest concrete improvements with code snippets where helpful**
4. **Rate the overall quality (1-5 scale) with justification**

### Review Format:
```
## 📋 PR Summary
- **Total files changed:** [number]
- **Lines added/removed:** [stats]
- **Primary purpose:** [brief description]

## 🔍 Detailed File Analysis

### [File Name]
**Purpose:** [What this file does]
**Changes:** [Summary of modifications]
**Quality Rating:** ⭐⭐⭐⭐⭐ (X/5)

#### ✅ Strengths
- [Positive aspects]

#### ⚠️ Issues & Recommendations
- [Specific problems with line numbers]
- [Suggested improvements]

#### 🔧 Code Examples
[Provide before/after code snippets for major suggestions]

## 📊 Overall Assessment

### Naming Conventions: [Grade/Comments]
### Code Structure: [Grade/Comments]  
### Performance: [Grade/Comments]
### Best Practices: [Grade/Comments]
### Test Coverage: [Grade/Comments]

## 🚀 Action Items
- [ ] High Priority: [Critical issues to address]
- [ ] Medium Priority: [Important improvements]
- [ ] Low Priority: [Nice-to-have enhancements]

## 📈 Recommendations
[Strategic suggestions for improvement]
```

## Additional Context to Consider

**Please also analyze:**
- **Language-specific best practices** (mention the programming language being used)
- **Framework conventions** (if using specific frameworks)
- **Team coding standards** (reference any established team guidelines)
- **Performance benchmarks** (if performance is critical)
- **Security implications** (especially for user-facing or data-handling code)
- **Documentation quality** (inline comments, README updates, API docs)

## Expected Deliverables

Provide a comprehensive review that:
- ✅ Identifies all code quality issues with specific examples
- ✅ Suggests actionable improvements with code snippets
- ✅ Prioritizes issues by severity and impact
- ✅ Highlights both positive aspects and areas for improvement
- ✅ Includes specific line numbers and file references
- ✅ Offers strategic recommendations for future development

**Remember:** Be constructive, specific, and provide examples. Focus on maintainability, readability, and adherence to best practices while considering the broader impact on the codebase.