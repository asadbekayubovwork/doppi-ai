# GitHub Labels Organization for Vue 3 FSD Project

This document outlines the standardized labeling system for GitHub issues and pull requests in this Vue 3 FSD (Feature-Sliced Design) project. The labels are designed to provide clear categorization, workflow management, and easy filtering for better project organization.

## Issue Types

| Label | Description | Color | Usage |
|-------|-------------|-------|-------|
| `type: bug` | Something isn't working | `#d73a4a` | For reporting bugs and issues |
| `type: enhancement` | New feature or request | `#a2eeef` | For feature requests and improvements |
| `type: documentation` | Improvements or additions to documentation | `#0075ca` | For documentation-related tasks |
| `type: question` | Further information is requested | `#d876e3` | For questions and clarifications |
| `type: refactor` | Code improvement without adding features | `#fef2c0` | For code refactoring tasks |
| `type: chore` | Maintenance tasks (dependencies, configs, etc.) | `#f9d0c4` | For maintenance and setup tasks |

## Workflow Status

| Label | Description | Color | Usage |
|-------|-------------|-------|-------|
| `status: pending review` | Waiting for review/approval | `#fbca04` | Initial status for new issues |
| `status: approved` | Issue has been approved for implementation | `#0e8a16` | Ready to start work |
| `status: in progress` | Work is actively being done | `#1d76db` | Currently being worked on |
| `status: blocked` | Blocked by external factors | `#d93f0b` | Cannot proceed without resolution |
| `status: ready for test` | Implementation complete, needs testing | `#006b75` | Ready for QA/testing |
| `status: needs info` | More information needed from reporter | `#e99695` | Waiting for additional details |
| `status: wontfix` | This will not be worked on | `#ffffff` | Issue will not be addressed |

## Priority Levels

| Label | Description | Color | Usage |
|-------|-------------|-------|-------|
| `priority: critical` | Must be fixed ASAP | `#b60205` | Production-breaking issues |
| `priority: high` | High priority | `#ff9800` | Important features/fixes |
| `priority: medium` | Medium priority | `#fbca04` | Standard priority |
| `priority: low` | Low priority | `#0e8a16` | Nice-to-have features |

## FSD Architecture Layers

| Label | Description | Color | Usage |
|-------|-------------|-------|-------|
| `layer: app` | App layer related | `#84b6eb` | App initialization, providers, layouts |
| `layer: processes` | Processes layer related | `#7057ff` | Complex business processes |
| `layer: pages` | Pages layer related | `#008672` | Page components and routing |
| `layer: widgets` | Widgets layer related | `#e4e669` | Reusable widget components |
| `layer: features` | Features layer related | `#d4c5f9` | Feature-specific functionality |
| `layer: entities` | Entities layer related | `#c5def5` | Business entities and models |
| `layer: shared` | Shared layer related | `#bfd4f2` | Shared utilities and components |

## Vue/Frontend Specific

| Label | Description | Color | Usage |
|-------|-------------|-------|-------|
| `area: components` | Vue components related | `#5319e7` | Component-specific issues |
| `area: routing` | Vue Router related | `#0052cc` | Navigation and routing |
| `area: state` | State management (Pinia/Vuex) | `#006b75` | Store and state management |
| `area: styling` | CSS/SCSS related | `#cc317c` | Styling and CSS issues |
| `area: testing` | Testing related | `#bfdadc` | Unit, integration, e2e tests |
| `area: build` | Build tools/Vite configuration | `#215cea` | Build process and tooling |
| `area: typescript` | TypeScript related | `#2b7489` | Type definitions and TS issues |
| `area: performance` | Performance optimization | `#f9c513` | Performance improvements |

## Additional Helpful Labels

| Label | Description | Color | Usage |
|-------|-------------|-------|-------|
| `good first issue` | Good for newcomers | `#7057ff` | Beginner-friendly tasks |
| `help wanted` | Extra attention is needed | `#008672` | Community assistance needed |
| `duplicate` | This issue or pull request already exists | `#cfd3d7` | Duplicate issues |
| `invalid` | This doesn't seem right | `#e4e669` | Invalid or incorrectly reported |
| `breaking change` | Introduces breaking changes | `#d93f0b` | Changes that break existing API |
| `dependencies` | Pull requests that update dependencies | `#0366d6` | Dependency updates |

## Suggested Workflow Example

### For Enhancement Requests:

1. Issue created with `type: enhancement`
2. Add `status: pending review`
3. After discussion/approval → Add `status: approved` + priority label
4. When work begins → Change to `status: in progress`
5. When PR is ready → Change to `status: ready for test`
6. Close issue when merged

### For Bug Reports:

1. Issue created with `type: bug`
2. Add priority label based on severity
3. Add relevant layer/area labels
4. Follow similar status workflow as enhancements

## Label Creation Script

You can use the provided script `create-labels.sh` with GitHub CLI to create all labels:

```bash
# Make the script executable
chmod +x create-labels.sh

# Run the script (requires GitHub CLI to be installed and authenticated)
./create-labels.sh
```

The script will:
1. Delete default GitHub labels (optional)
2. Create all the organized labels with proper colors and descriptions

## Best Practices

### Labeling Guidelines

- **Always use at least 2 labels**: Type + Status
- **Add priority labels** for bugs and approved enhancements
- **Use FSD layer labels** to quickly identify which part of the architecture is affected
- **Update status labels** as issues progress through the workflow
- **Use area labels** for technical categorization
- **Combine labels** for better filtering (e.g., `type: bug` + `layer: features` + `priority: high`)

### Workflow Management

1. **New Issues**: Start with `type:` + `status: pending review`
2. **Approved Issues**: Add `status: approved` + `priority:` + relevant `layer:`/`area:` labels
3. **Work in Progress**: Update to `status: in progress`
4. **Ready for Review**: Change to `status: ready for test`
5. **Blocked Issues**: Use `status: blocked` with clear explanation
6. **Closed Issues**: Remove status labels or use `status: wontfix` if applicable

### Filtering Examples

- All bugs in features layer: `type: bug layer: features`
- High priority approved tasks: `status: approved priority: high`
- Work in progress on components: `status: in progress area: components`
- All testing-related issues: `area: testing`

## GitHub Issue Templates

Consider creating issue templates that automatically apply certain labels:

### `.github/ISSUE_TEMPLATE/bug_report.yml`

```yaml
name: Bug Report
description: Report a bug
labels: ["type: bug", "status: pending review"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: input
    id: contact
    attributes:
      label: Contact Details
      description: How can we get in touch with you if we need more info?
      placeholder: ex. email@example.com
    validations:
      required: false
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
      value: "A bug happened!"
    validations:
      required: true
```

### `.github/ISSUE_TEMPLATE/feature_request.yml`

```yaml
name: Feature Request
description: Suggest an enhancement
labels: ["type: enhancement", "status: pending review"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for suggesting a new feature!
  - type: textarea
    id: feature-description
    attributes:
      label: Feature Description
      description: What feature would you like to see added?
      placeholder: Describe the feature...
    validations:
      required: true
  - type: textarea
    id: use-case
    attributes:
      label: Use Case
      description: What is your use case for this feature?
      placeholder: Describe your use case...
    validations:
      required: true
```

## Maintenance

- **Regular Review**: Periodically review and update labels based on project evolution
- **Team Training**: Ensure all team members understand the labeling system
- **Automation**: Consider using GitHub Actions for automatic label assignment
- **Feedback**: Collect feedback from team members to improve the labeling system

---

For questions about this labeling system or suggestions for improvements, please create an issue with the `type: question` label.
