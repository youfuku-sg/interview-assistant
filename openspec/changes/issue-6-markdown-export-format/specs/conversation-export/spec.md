## ADDED Requirements

### Requirement: Conversation download format choice
The chat detail view SHALL let the user choose between Markdown and JSON when downloading the currently viewed conversation, instead of only ever producing one fixed format.

#### Scenario: User downloads as Markdown
- **WHEN** the user opens the download control on a conversation's detail view and selects "Markdown (.md)"
- **THEN** the system generates and downloads a `.md` file whose content matches the existing Markdown export format (title heading, created/updated/message-count metadata, one `## ROLE: content` section per message)

#### Scenario: User downloads as JSON
- **WHEN** the user opens the download control on a conversation's detail view and selects "JSON (.json)"
- **THEN** the system generates and downloads a `.json` file containing the conversation's id, title, createdAt, updatedAt, and messages (each with id, role, content, timestamp)

### Requirement: Export filename derivation shared across formats
The system SHALL derive the downloaded file's base name from the conversation title using the existing sanitization logic, and SHALL apply only the extension appropriate to the chosen format (`.md` or `.json`).

#### Scenario: Filename matches chosen format's extension
- **WHEN** a conversation titled "Interview prep notes" is downloaded as JSON
- **THEN** the downloaded filename ends in `.json` and its base name is derived the same way the existing Markdown download derives its base name

### Requirement: Download success feedback is format-agnostic
The chat detail view SHALL show the same "downloaded" success indicator regardless of which format was chosen.

#### Scenario: Success indicator shown after JSON download
- **WHEN** a conversation is downloaded as JSON
- **THEN** the download control shows the same temporary "ダウンロード済み" success state that the Markdown download already shows, for the same duration
