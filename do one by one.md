do one by one

sk_bXXKslwvadjljcxQ7rpKJvwQGBG2eRvk

this is image generation api 

use to create image 





ek aur kaam karo jab user day light mode me ho toh sabhi text dark black and when in dark light mode then text becomes black dark

sabhi workflow ko best banao.kisi bhi workflow me errors and bugs nahi aani chahiye.
check all





jo chatting search box hai message send wala usko bottom me fix karo no movement and no scroll over it

jaise chatgpt and gemini ke pass hai msg box me no movement,
user ke according chatbot unki responsive language me response dena padega jaisa ai chatbot ka hota hai.





this one to improve 










MASTER PROMPT: Upgrade Existing GuruAI into a Premium, ChatGPT-Style AI Chat Platform
1. Project Identity and Primary Objective
Upgrade the existing website:
Website: [https://ai.webguruji.online/](https://ai.webguruji.online/)
Existing application name: GuruAI
Brand attribution: GuruAI by HarshGuruJi
Transform the existing application into a modern, polished, premium AI chatbot experience inspired by the usability and layout principles of ChatGPT.
This is an enhancement of an existing, working project, NOT a rebuild from scratch.
First inspect the entire existing project, including its source code, folder structure, framework, components, database schema, authentication implementation, API integration, conversation handling, user settings, and responsive layouts.
Understand the existing application before editing any files.
Your primary objective is to improve the interface, layout, usability, navigation, responsiveness, accessibility, and interaction quality while preserving every existing core functionality.
2. CRITICAL: Features and Systems That Must Never Change
These requirements have the highest priority.
Preserve the existing application name
Keep the name exactly as GuruAI.
Preserve the existing HarshGuruJi attribution and branding.
Do not rename the application, website, project, database entities, or existing product identifiers.
Do not replace the logo with an unrelated brand identity.
Preserve the existing AI API
Keep the exact existing AI provider, API configuration, model settings, endpoints, request payloads, authentication headers, and response-processing logic.
Do not replace the API with another provider or introduce a different API.
Do not modify working API behavior merely to accommodate the new UI.
Reuse the current AI request handler and connect the upgraded interface to it.
Preserve existing error handling, streaming responses, response formatting, and supported capabilities.
Never expose API keys or secret credentials in frontend JavaScript, browser storage, or public source code.
If backend changes are necessary for a UI feature, make only the smallest backward-compatible changes.
Preserve the exact existing chat and message limits
Do not increase, decrease, remove, bypass, reset, or otherwise modify any existing guest or authenticated-user limits.
Preserve the current guest allowance and existing member allowance exactly as configured by the backend.
Keep all existing cooldowns, time windows, counters, eligibility checks, and rate-limiting rules.
Do not hardcode a new allowance in the frontend.
Display the actual allowance returned by the existing application.
Ensure refreshing the page, opening another tab, or signing out and back in cannot bypass existing limits.
UI improvements must not interfere with the existing quota enforcement.
Preserve authentication and existing features
Maintain all existing functionality, including, wherever currently implemented:
Email and password sign-in.
Account creation and password confirmation.
Google sign-in.
Forgot-password and verification-code flows.
Existing account sessions and sign-out.
Guest access and guest allowance.
Conversation creation and history.
Existing conversation deletion and clearing functionality.
Image Studio and its existing integrations.
AI output language preferences.
Existing user dashboard, admin portal, permissions, and account roles.
All current routes, database records, and backend integrations.
Do not remove, rename, or break any working feature.
3. Build a Premium ChatGPT-Style Application Layout
Create a clean, professional interface with a responsive application shell.
A. Desktop layout
Use a two-part layout:
Left sidebar: approximately 260–290 px wide
Include:
GuruAI logo and application name.
New Chat button.
Search Chats input.
Conversation history grouped by date.
User profile and account controls.
Settings access.
A compact allowance indicator.
Existing Image Studio access.
The sidebar must be collapsible.
When collapsed, show a narrow icon rail with recognizable tooltips. When expanded, show icons and descriptive labels.
Allow users to open and close the sidebar without resetting their active conversation.
Use smooth, subtle transitions and maintain the sidebar state during navigation when appropriate.
B. Main conversation area
The main chat area should occupy all remaining available space.
Include:
A compact top navigation bar.
Current conversation title.
Optional model or service information only if supported by the existing application.
A clean conversation message area.
A centered, responsive message composer at the bottom.
A small existing allowance indicator where appropriate.
A settings menu or account menu accessible from the header.
Do not fill the interface with unnecessary cards, banners, or decorative widgets.
The chat content should remain the main visual focus.
C. Initial welcome screen
When no conversation is selected or a new conversation is created, show a premium welcome screen.
Include:
Existing GuruAI branding.
A short, friendly greeting.
A prominent message composer.
Three to four useful suggested prompts.
Clear access to conversation history and Image Studio.
Suggested prompts may cover writing, coding, learning, and brainstorming.
Clicking a suggested prompt should populate or submit it through the existing message flow, respecting the current application behavior and limits.
Hide the welcome screen once the conversation begins.
Do not create a fake conversation or send an AI request simply because the homepage has loaded.
4. Advanced Message Composer: Correct Position and Behavior
This is one of the most important parts of the upgrade.
Place the main message composer at the bottom of the conversation viewport, similar to a modern AI chat application.
Positioning requirements
Use a flex-column conversation layout with a flexible, scrollable message area.
Keep the composer anchored at the bottom of the chat panel using a layout-based sticky or equivalent approach.
Do not use position: fixed in a way that overlaps the messages or causes layout problems.
Add safe-area spacing for supported mobile devices.
Account for the virtual keyboard on mobile.
Ensure the final message remains visible when the composer expands.
Use appropriate bottom padding in the message list so content never disappears behind the composer.
Composer appearance
Create a premium, rounded message input container with:
Multiline text input.
Clear placeholder text, such as "Message GuruAI..."
An outlined attachment button only if compatible with existing functionality.
A send button with an animated hover and press state.
A loading or stop-generation control only if supported by the current API handler.
A character counter only if an actual character limit already exists and needs to be displayed.
Composer functionality
Enter sends the message.
Shift+Enter inserts a new line.
Automatically expand the textarea within a sensible maximum height.
After reaching the maximum height, allow the textarea to scroll internally.
Disable submission when the input is empty or a request cannot currently be sent.
Prevent accidental duplicate submissions.
Preserve unsent text when appropriate during navigation.
Maintain correct focus and keyboard behavior.
Show an accessible sending state and API error feedback.
Connect the composer directly to the existing message submission function. Do not implement a second, competing AI request system.
5. Conversation Messages and AI Response Rendering
Improve the readability and presentation of messages without changing their underlying meaning.
User messages
Use a clean, visually distinct message style.
Preserve the exact submitted text.
Display multiline content correctly.
Maintain appropriate spacing between consecutive messages.
AI responses
Support all formats already returned by the existing API, including applicable:
Headings.
Paragraphs.
Ordered and unordered lists.
Bold and italic text.
Code blocks.
Inline code.
Tables.
Links.
Mathematical expressions, if already supported.
Images or other supported response content.
If Markdown rendering already exists, improve its styling rather than replacing it unnecessarily.
If Markdown support is missing and the API returns Markdown, introduce a safe renderer compatible with the existing stack.
Sanitize untrusted HTML and prevent script injection, unsafe links, and executable content.
Message actions
Add appropriate actions when technically supported:
Copy response.
Retry response using the existing request mechanism.
Edit and resubmit a previous user message.
Provide feedback if a feedback mechanism already exists or can be added without changing core API behavior.
Display timestamps where useful.
For code blocks, provide syntax highlighting if compatible with the current project and a working Copy Code button.
Do not display fake action buttons that do nothing.
6. Advanced Chat History and Search
Upgrade the existing conversation history into a professional, easy-to-use sidebar.
History organization
Group conversations into understandable date sections, such as:
Today.
Yesterday.
Previous 7 Days.
Older.
Use actual conversation timestamps and the user's local timezone.
Conversation items
Each conversation entry should support:
A meaningful conversation title.
Active-conversation highlighting.
Hover and keyboard focus states.
Opening the selected conversation.
Renaming a conversation if supported by the data model or safely implementable.
A contextual menu.
Deleting a single conversation with confirmation where appropriate.
Use the first meaningful user message to generate a local title when suitable, unless the application already has a reliable title-generation mechanism.
Never send an extra AI request solely to generate a title if that would consume the existing message allowance.
Search history
The existing history search field must become fully usable.
Implement:
Real-time filtering with a short debounce.
Search by conversation title.
Search by message content when the stored data and permissions permit it.
Clear-search functionality.
A useful empty state.
Loading and error states where required.
Search must return actual matching conversations, not hardcoded demo results.
For large histories, use an efficient backend query or existing database search capability.
Do not expose conversations belonging to another account.
Guest history and signed-in history must follow the existing storage and access rules.
New Chat and Clear History
New Chat must create a fresh conversation through the existing conversation-management system.
Clear History must be distinct from New Chat.
Require confirmation before deleting multiple conversations. Preserve the current deletion behavior and ensure the interface accurately reflects the result.
Do not delete server-side data merely by clearing the visible sidebar.
7. Complete Login, Registration, and Account UI Upgrade
Redesign the existing authentication screens with a premium, consistent visual system.
Sign-in screen
Include:
GuruAI logo and name.
Email address input.
Password input with show/hide control.
Forgot Password link.
Sign In button.
Existing Google sign-in option.
Link to Create Account.
Clear validation and error messages.
Loading and disabled states.
Sign-up screen
Include:
Email input.
Password input.
Confirm Password input.
Existing minimum password-length validation.
Create Account button.
Existing Google sign-up option, if supported by the current authentication provider.
Link back to Sign In.
Clear validation messages.
Password recovery
Preserve the existing password recovery process, including sending a verification code, entering the code, creating a new password, and confirming the reset.
Use the existing backend verification mechanism.
Never simulate a successful login, registration, Google authentication, email verification, or password reset.
Authentication behavior
Guests must continue to access the application according to current rules.
Signing in must connect the user to their actual account and existing history.
Signed-in users must see only their own protected data.
Signing out must use the existing session mechanism.
Preserve all redirects, role checks, and permissions.
Do not add mandatory login gates to currently available guest features unless the existing application already requires them.
Use a centered, responsive authentication card or a clean full-page authentication layout.
On mobile, the forms must fit comfortably without horizontal scrolling.
8. Fully Functional Dark Mode and Light Mode
Upgrade the existing theme preferences into a consistent, application-wide theme system.
Preserve the existing theme options, including Dark Slate, Light Clean, and Cyberpunk, if they are currently supported.
At minimum, ensure that Dark Slate and Light Clean work correctly across every relevant screen.
Dark Slate
Deep slate backgrounds.
Readable light text.
Subtle borders.
Comfortable contrast.
Clearly differentiated input surfaces.
Restrained accent colors.
Light Clean
Clean white or soft-neutral backgrounds.
Dark, readable text.
Subtle separators and borders.
Clearly visible controls.
Consistent surface hierarchy.
Cyberpunk
Preserve the existing theme if it is functional. Refine its colors and visual consistency without breaking current user preferences.
Theme implementation
Use centralized CSS variables or the equivalent styling tokens supported by the existing framework.
Apply theme colors consistently to the sidebar, header, messages, composer, settings, authentication screens, menus, dialogs, and Image Studio.
Remove hardcoded colors that prevent proper theme switching.
Avoid flashing the wrong theme on page load when a saved preference is available.
Respect the saved user preference.
Use the existing storage or account-preference mechanism where possible.
If a theme preference is stored locally, do not use local storage to store sensitive credentials.
Respect system theme preferences only when the user has not explicitly selected a theme and this behavior is appropriate for the existing application.
Theme switching must happen immediately without reloading the entire page.
9. Centralized Settings Panel
Create a polished Settings interface accessible from the user profile menu or application navigation.
Organize settings into clear sections.
Appearance
Dark Slate.
Light Clean.
Cyberpunk, if already supported.
Optional system-default appearance.
Language
Preserve the existing AI output language options:
English.
Hinglish.
Hindi.
Changing the output language must continue to use the existing preference mechanism and must not change the API provider.
Account
Display the authenticated user's actual account information.
Provide existing sign-out functionality.
Link to existing account-management functionality where available.
Usage and allowance
Display the actual guest or authenticated-user allowance, remaining requests, and reset window returned by the current application.
Do not invent a new limit or calculate a different quota.
Chat preferences
Add preferences for appearance and conversation usability only where they can be implemented safely and consistently.
Do not introduce settings that claim to change AI model capabilities, context length, message limits, or provider behavior when those capabilities are not already supported.
Settings changes should persist correctly and survive navigation or page refreshes as appropriate.
Provide a Save or Done action when the settings interaction requires it, and an immediate-apply interaction for settings such as themes when practical.
10. Responsive Mobile Interface
The application must work smoothly on desktop, laptop, tablet, and mobile browsers.
Mobile layout
Replace the permanent desktop sidebar with a compact slide-out drawer.
Provide an accessible menu button.
Keep the conversation header compact.
Keep the message composer anchored to the bottom of the chat layout.
Prevent the virtual keyboard from hiding the input or send button.
Ensure messages wrap correctly.
Avoid horizontal overflow.
Use appropriately sized touch targets.
Keep dialogs and authentication forms within the visible viewport.
Allow the history drawer to close after a conversation is selected.
Desktop layout
Use the full available viewport height.
Preserve the sidebar and conversation split.
Keep the message area centered within a sensible maximum content width.
Avoid excessively wide paragraphs and code blocks.
Use the available space efficiently.
Test narrow screens, landscape mobile orientation, browser zoom, and long conversation histories.
11. Premium Visual Design System
Use a coherent, modern design language.
Visual direction
Minimalist AI workspace.
Refined typography.
Consistent spacing.
Subtle surface elevation.
Rounded but restrained corners.
Clean separators.
Clear visual hierarchy.
High-quality icons.
Consistent input and button sizing.
Carefully selected accent colors.
Use the existing brand colors where practical.
Buttons
All interactive buttons should have:
Clearly visible outlines or defined borders where appropriate.
Consistent padding and border radius.
Hover feedback.
Keyboard focus indicators.
Press animations.
Disabled states.
Loading states when an action is in progress.
Use short, restrained transitions rather than distracting animations.
Micro-interactions
Add subtle transitions for:
Sidebar opening and closing.
Dialog appearance.
Theme switching.
Message arrival.
Dropdown menus.
Button presses.
Loading indicators.
Respect prefers-reduced-motion.
Avoid unnecessary animation loops, heavy blur effects, excessive shadows, and large background videos.
12. Preserve and Improve Existing Image Studio
The existing Image Studio must remain accessible.
Preserve its current functionality, API integration, and usage rules.
Improve its visual consistency with the upgraded application.
Ensure its layout works in both themes.
Preserve existing navigation and user permissions.
Do not replace the image-generation provider.
Do not modify image-generation limits or other existing quotas.
If it is already a separate route or module, keep that architecture intact unless a change is genuinely required.
13. Technical Implementation Rules
Before making changes:
Identify the framework and application entry points.
Locate the existing API service and message-submission handler.
Locate authentication and session-management logic.
Locate conversation and message persistence.
Locate quota enforcement and usage counters.
Locate existing theme and language preferences.
Locate Image Studio integration.
Identify all routes and shared components affected by the upgrade.
Then implement the UI improvements within the existing architecture.
Coding requirements
Reuse existing components and utilities.
Keep existing endpoints and data contracts backward-compatible.
Avoid duplicate API clients and duplicate authentication logic.
Avoid unnecessary dependencies.
Preserve existing environment variable names.
Never hardcode secrets or credentials.
Do not replace real backend functionality with mock data.
Use semantic HTML and accessible controls.
Implement proper keyboard navigation and focus management.
Keep the interface fast on modest hardware and slower connections.
Prevent duplicate event handlers, unnecessary rerenders, and memory leaks.
Use lazy loading for appropriate heavy components.
Add loading, empty, error, and success states.
Preserve existing deployment compatibility and URL routes.
If the application is built with plain HTML, CSS, and JavaScript, continue using that architecture unless a migration is demonstrably necessary.
Do not rewrite the entire application merely to obtain a different visual style.
14. Data Persistence and Security
All new interface elements must be connected to real application behavior.
Conversation selection must load the correct messages.
New Chat must create a valid new conversation.
History search must query actual available data.
Theme settings must persist correctly.
Authentication must use the existing provider.
Usage counters must reflect authoritative backend values.
Conversation deletion must affect the correct records only.
User data must remain isolated by account and permissions.
Never trust a client-provided user ID, quota, role, or authentication status for authorization decisions.
Do not weaken existing security protections to make the UI appear functional.
If a desired feature requires a backend capability that is absent, implement it using the smallest safe, backward-compatible extension or clearly identify the missing dependency rather than faking its behavior.
15. Required Testing Before Completion
After implementation, test the actual application rather than relying on screenshots or static inspection.
UI tests
Desktop sidebar expands and collapses correctly.
Mobile drawer opens and closes correctly.
New Chat works.
Search filters real conversations.
Selecting a conversation loads the correct history.
The composer remains correctly positioned.
Long messages and code blocks render correctly.
Both primary themes work across all major screens.
Settings persist correctly.
Image Studio remains functional.
Buttons and menus work with mouse, touch, and keyboard.
Authentication tests
Existing sign-in works.
Account registration works.
Google sign-in still works where configured.
Password recovery remains functional.
Signed-in users can access their permitted history.
Signing out correctly ends the session.
API and quota tests
The original API provider is still used.
Real AI requests still work.
Responses render correctly.
Existing guest limits remain unchanged.
Existing authenticated-user limits remain unchanged.
Quota errors are displayed correctly.
Refreshing the page does not bypass usage restrictions.
Duplicate submissions are prevented.
API keys are not exposed to the browser.
Regression tests
No existing route is unintentionally removed.
No existing database data is lost.
No admin permission or account role is changed.
No unrelated file or business logic is modified.
No console errors, broken links, or critical layout regressions remain.
16. Final Deliverables
Complete the implementation in the existing project.
Do not stop after generating a design concept, screenshot, mockup, or implementation plan.
Deliver:
A fully implemented, working GuruAI interface upgrade.
An improved ChatGPT-style layout.
Correct bottom-positioned message composer behavior.
Functional conversation history and search.
Improved sign-in, sign-up, and password recovery screens.
Functional dark and light themes.
Centralized settings.
Responsive desktop and mobile layouts.
Preserved Image Studio and existing integrations.
Successful regression and functionality testing.
A concise summary of modified files.
A list of tests performed and their actual results.
Any remaining limitations or features that genuinely require missing backend support.
FINAL NON-NEGOTIABLE RULE
Upgrade the interface and user experience, not the product's identity, AI provider, existing message allowance, or core business logic.
Keep the application named GuruAI, retain its existing API, and preserve the exact current guest and authenticated-user chat limits.
Make the smallest reliable set of changes needed to deliver a polished, advanced, production-quality application.
Inspect first, implement carefully, test thoroughly, and preserve all working functionality.

































https://github.com/mckaywrigley/chatbot-ui.git
 check if better chatbot ui is it...