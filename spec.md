# Task: Create a Complete Specification for AI Mystery Room — Spec-Driven Development

Act as a **senior product architect, full-stack engineer, AI engineer, UI/UX designer, and technical documentation specialist**. Create a comprehensive, implementation-ready specification document for a web application called **AI Mystery Room**.

The specification will serve as the **Single Source of Truth (SSOT)** for OpenAI Codex to implement the entire application. It must be detailed, internally consistent, testable, and precise enough that Codex can build the application without making major architectural or product decisions on its own.

## 1. Product Vision

AI Mystery Room is an interactive, AI-powered detective game in which users investigate fictional crimes by examining evidence, analyzing suspects, connecting clues, and identifying the culprit.

Users provide a short scenario, story, or mystery theme. The AI generates a complete fictional investigation, including a crime, suspects, motives, timelines, red herrings, and supporting evidence.

The application presents the investigation as an immersive digital detective room. Players examine evidence such as fictional WhatsApp conversations, photographs, CCTV footage or transcripts, witness statements, forensic reports, and other investigation records.

Players must analyze the available evidence and select the culprit. The system evaluates their decision against the underlying solution and provides a logical explanation of the case.

**Core principle:** Every mystery must have a coherent, predetermined solution. Evidence must be consistent with the solution, and the culprit must be identifiable through reasoning rather than arbitrary guessing.

## 2. Technology Stack

Use the following technologies:

- **Frontend:** React.js
- **Backend:** Node.js and Express.js
- **Database:** MongoDB
- **AI provider:** Google Gemini API
- **Language:** JavaScript by default; use TypeScript only if the specification explicitly justifies and standardizes it.
- **Styling:** Select a maintainable styling approach appropriate for an immersive, responsive interface.
- **Authentication:** Define an appropriate authentication strategy if user accounts are included.
- **Testing:** Define suitable unit, integration, and end-to-end testing tools.
- **Deployment:** Specify a practical deployment architecture, environment configuration, and production build process.

Use supported, stable libraries and clearly identify the chosen versions or version-selection policy. Keep all API keys and AI credentials on the server.

Do not introduce additional infrastructure or paid services unless justified.

## 3. Functional Requirements

Specify the following features in implementation-ready detail.

### A. Landing Page
- Explain the concept and gameplay.
- Provide a prominent “Create a Mystery” action.
- Include sample mysteries or a demonstration.
- Establish a cinematic detective-themed visual identity.

### B. Mystery Creation
- Accept a user-provided story, scenario, theme, or crime premise.
- Allow configurable difficulty and case length.
- Validate user input and enforce length limits.
- Provide loading, generation progress, retry, and error states.
- Handle malformed, incomplete, or unsafe AI outputs.
- Allow users to start a case only after successful validation.

### C. AI Mystery Generation
Use Gemini to generate a structured investigation containing:
- Case title, summary, location, date, and crime type.
- Victim or affected person, where applicable.
- A configurable number of suspects.
- Each suspect's profile, motive, opportunity, alibi, and relevant relationships.
- A chronological event timeline.
- Physical, digital, testimonial, and forensic evidence.
- Fictional WhatsApp conversations and other digital records.
- CCTV scene descriptions, timestamps, and video transcripts or generated fictional footage where supported.
- Witness interviews and investigation reports.
- Misleading clues and red herrings.
- A hidden, authoritative solution with the culprit's identity.
- A complete explanation connecting the evidence to the solution.
- Optional hints and a final case report.

Define a structured JSON schema for the generated case. Include validation rules, required fields, relationships, and recovery behavior for invalid responses.

Use a multi-stage generation and validation pipeline if needed. Ensure that the culprit, timeline, suspect details, and evidence remain consistent across all generated artifacts.

### D. Investigation Workspace
Create an immersive detective dashboard with:
- Case overview.
- Suspect profiles.
- Evidence library.
- Timeline view.
- Clue details and cross-references.
- Notes or investigation journal.
- Interactive evidence board for connecting clues.
- Hint system.
- Investigation progress indicator.

Evidence must be inspectable, searchable, and easy to navigate. Users should be able to revisit previously discovered clues.

### E. Evidence Generation and Presentation
Define how the application creates and displays:
- Chat messages and call logs.
- Photographs and scene images.
- CCTV footage or clearly labeled simulations, transcripts, and scene reconstructions.
- Documents, forensic reports, and witness statements.

Use generated images only when an image-generation service is explicitly selected and configured. Otherwise, provide convincing text-based evidence and optional visual placeholders.

Do not claim to generate actual surveillance footage or audio unless the required capability is implemented.

All evidence must be clearly fictional and must not be presented as authentic records from real people or organizations.

### F. Culprit Selection and Case Resolution
- Display the suspects as selectable candidates.
- Allow the player to submit a final accusation.
- Optionally require a supporting explanation or selected clues.
- Evaluate the accusation against the hidden solution.
- Provide feedback, the correct answer, and a step-by-step reasoning explanation.
- Track hints used, attempts, completion time, and score where applicable.
- Prevent client-side access to the hidden solution before the case is completed.
- Define whether accusations are final or whether retries are allowed.

### G. User Experience
Specify:
- Responsive desktop, tablet, and mobile layouts.
- Accessible controls, keyboard navigation, and readable contrast.
- Loading skeletons, empty states, error messages, and confirmation dialogs.
- Animations and transitions that improve immersion without harming usability.
- Autosaving and recovery from accidental navigation where appropriate.

## 4. UI/UX Design Direction

Create a premium, cinematic detective-investigation experience.

The interface should feel like a combination of a detective's case file, an evidence board, and a modern investigation command center.

Use:
- A dark, restrained visual theme.
- Clear typography and visual hierarchy.
- Evidence cards, suspect dossiers, timelines, and interconnected clue panels.
- Subtle motion and interactive transitions.
- Distinct visual treatments for verified evidence, unverified leads, and red herrings.
- A responsive layout with intuitive navigation.

Avoid clutter, excessive glow effects, generic AI-dashboard aesthetics, and unnecessary animations.

Define the design tokens, typography, color palette, spacing system, component library, reusable UI components, and page layouts.

## 5. Technical Architecture

Document:
- System architecture and component responsibilities.
- Frontend and backend directory structure.
- API routes, request and response formats.
- MongoDB collections and data relationships.
- Data models and validation rules.
- Gemini service integration and prompt-management strategy.
- Error handling, logging, rate limiting, and request timeouts.
- Authentication and authorization, if implemented.
- Environment variables and configuration.
- Data persistence and case lifecycle.
- AI response validation and retry policies.

Define a clear separation between the public case data and the confidential solution. Never send the hidden culprit, solution rationale, or secret answer key to the browser before resolution.

## 6. API Specification

Provide an API contract for every major operation, including:
- Create a mystery.
- Retrieve a case.
- List and inspect evidence.
- Retrieve suspect profiles.
- Save investigation notes.
- Request a hint.
- Submit an accusation.
- Retrieve the final case report.
- Track user progress, if accounts are implemented.

For each endpoint, specify the HTTP method, route, authentication requirements, request schema, response schema, validation, error codes, and example payloads.

Use consistent response structures and appropriate HTTP status codes.

## 7. Database Specification

Define the MongoDB schemas and indexes for relevant entities, such as:
- Users, if authentication is included.
- Mystery cases.
- Suspects.
- Evidence items.
- Timelines.
- Hints.
- Accusations and results.
- User progress and notes.

Specify which information is stored, which is generated dynamically, and how confidential solution data is protected.

Avoid unnecessary duplication and explain data retention and cleanup policies.

## 8. AI Engineering Requirements

Design a reliable Gemini integration that:
- Uses structured output wherever supported.
- Validates every generated case against a defined schema.
- Detects contradictions in timelines, alibis, relationships, and evidence.
- Ensures exactly one intended culprit unless a different game mode is explicitly specified.
- Ensures the evidence provides a defensible path to the solution.
- Distinguishes essential clues from red herrings.
- Prevents AI-generated hints from accidentally revealing the culprit.
- Keeps the answer key private until the case is resolved.
- Handles API quotas, timeouts, invalid outputs, and temporary failures.
- Avoids unnecessary repeated AI calls by persisting completed cases.
- Uses server-side authorization and rate limits to control abuse and costs.

Do not rely solely on another unrestricted AI call to decide whether the player's accusation is correct. The backend must evaluate the accusation against the stored authoritative solution and a defined scoring policy.

## 9. Security and Privacy

Include:
- Server-side secret management.
- Input sanitization and validation.
- Protection against prompt injection and malicious user-provided stories.
- API rate limiting and abuse prevention.
- Secure database access.
- Authorization checks for every case-related operation.
- Protection against answer-key leakage through API responses, logs, and errors.
- Safe rendering of AI-generated content.
- Fictional-data labeling and safeguards against impersonation.
- Privacy-conscious logging and retention.

Treat user-provided story text and AI-generated content as untrusted data.

## 10. Testing and Acceptance Criteria

Define measurable acceptance criteria for:
- Case creation and validation.
- AI generation failures and retries.
- Uniqueness and consistency of the culprit.
- Evidence accessibility and cross-references.
- Correct and incorrect accusations.
- Hint behavior.
- Database persistence.
- Security and confidential solution handling.
- Responsive behavior and accessibility.
- API reliability and error handling.

Provide unit, integration, and end-to-end test scenarios, including edge cases and failure conditions.

Every requirement must have a unique identifier, priority, and verification method.

## 11. Development Plan for Codex

Organize implementation into clearly defined phases:

1. Repository setup and project configuration.
2. Design system and frontend foundations.
3. Backend API and database models.
4. Gemini integration and mystery-generation pipeline.
5. Investigation workspace and evidence system.
6. Accusation, scoring, and case resolution.
7. Testing, security hardening, and performance.
8. Deployment and documentation.

For each phase, specify deliverables, dependencies, completion criteria, and tests.

Codex must inspect the existing repository before modifying anything, preserve useful existing code, and follow the documented architecture. If the repository is empty, initialize the project according to the specification.

## 12. Required Deliverables

Produce a complete specification document containing:

1. Executive summary and product goals.
2. Scope, assumptions, and non-goals.
3. Personas and user stories.
4. Functional requirements with unique IDs.
5. Non-functional requirements.
6. User journeys and navigation structure.
7. Page-by-page UI specifications.
8. Design system and component inventory.
9. System architecture and data-flow diagrams.
10. Frontend and backend folder structures.
11. API contract with sample requests and responses.
12. MongoDB schemas and indexes.
13. Gemini integration design and prompts.
14. Canonical mystery JSON schema and sample case.
15. Confidentiality and security model.
16. Error handling and recovery strategy.
17. Testing strategy and acceptance criteria.
18. Development phases and task breakdown.
19. Environment variables and deployment instructions.
20. Definition of Done and final verification checklist.

## 13. Rules for the Specification

- Make concrete technical decisions instead of presenting multiple unresolved alternatives.
- Clearly label assumptions where requirements are not specified.
- Distinguish MVP requirements from future enhancements.
- Ensure every major feature is implementable and testable.
- Keep API contracts, database schemas, and frontend requirements consistent.
- Do not invent unsupported capabilities.
- Do not expose secrets or confidential solutions.
- Avoid vague statements such as “make it user-friendly” without measurable criteria.
- Use diagrams, tables, code examples, JSON schemas, and explicit acceptance tests where useful.
- Do not generate the entire application code while writing the specification.

## Final Output

Generate a polished, comprehensive document titled:

**AI Mystery Room — Product Requirements, Software Architecture & Implementation Specification**

Structure it as a Markdown document suitable for saving as `SPEC.md` in the project root.

This file will be the authoritative reference for Codex during spec-driven development. Codex must follow it, identify any contradictions before implementation, and use its acceptance criteria to verify the completed application.