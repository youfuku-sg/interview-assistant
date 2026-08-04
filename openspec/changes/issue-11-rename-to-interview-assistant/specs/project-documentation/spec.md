## MODIFIED Requirements

### Requirement: README is in Japanese and reflects Interview-Assistant branding
`README.md` SHALL be written in Japanese and SHALL describe the project as Interview-Assistant, a personal-use interview-support desktop application, rather than as the upstream Pluely product. Repository badges and setup links SHALL point to `youfuku-sg/interview-assistant`.

#### Scenario: Reading the README
- **WHEN** a reader opens `README.md`
- **THEN** the title, banner, and body text describe Interview-Assistant (not Interview-Pilot or Pluely), are written in Japanese, and repository links point to `youfuku-sg/interview-assistant`

#### Scenario: Feature descriptions remain accurate
- **WHEN** a reader reads the feature sections of `README.md` (system audio capture, voice input, screenshots, file attachments, dashboard, chats, system prompts, settings, Dev Space)
- **THEN** each described feature corresponds to functionality that actually exists in the application

### Requirement: SECURITY.md is in Japanese and points to this repository
`SECURITY.md` SHALL be written in Japanese and SHALL reference this repository's own vulnerability-reporting channel rather than an old project name, upstream Pluely's repository, or upstream contact address.

#### Scenario: Reading the security policy
- **WHEN** a reader opens `SECURITY.md`
- **THEN** the text is in Japanese, the GitHub security-reporting link points to `youfuku-sg/interview-assistant`, and neither an `Interview-Pilot` repository URL nor an upstream Pluely contact address is present
