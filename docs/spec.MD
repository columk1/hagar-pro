# Software Requirements Specification (SRS): HAGAR Prep Web App (HG/PG Edition)

## 1. Introduction

### 1.1 Purpose

The purpose of this document is to specify the requirements for a free, open-source web application designed to prepare Canadian paragliding and hang gliding pilots for the Transport Canada HAGAR (Hang Glider Air Regulations) examination.

### 1.2 Scope

The application will provide a comprehensive, self-paced learning curriculum based exactly on the HPAC/ACVL HAGAR Study Guide Version 3.1. It will feature text, interactive visual tools, end-of-lesson quizzes, and a full mock exam utilizing the 64-question sample bank provided by the HPAC/ACVL.

### 1.3 Target Audience

Canadian paragliding and hang-gliding pilots who wish to fly in controlled airspace (Class "E") and are required to pass the Transport Canada HAGAR written exam.

## 2. System Architecture & Technology Stack

- **Framework**: Astro with the Starlight documentation theme. (Excellent for content-heavy, highly performant static sites).
- **Content Format**: MDX (Markdown + JSX). Allows embedding interactive UI components directly into markdown files.
- **Component Library**: React or Preact (Best ecosystem for complex mapping tools and SVG manipulations).
- **Map/VNC Integration**: Leaflet.js or OpenLayers (wrapped in React) to simulate interactive VNC (VFR Navigation Chart) reading.
- **State Management**: Client-side localStorage via Zustand or Nanostores to persist progress.
- **Hosting**: GitHub Pages, Vercel, or Netlify (100% serverless and free).

## 3. Core Features & Functional Requirements

### 3.1 Progress Tracking (No-Account Architecture)

- **Local Storage**: The app will automatically save completed lessons, quiz scores, and the user's current position to the browser's localStorage.
- **Cross-Device Sync**: Progress will be synced using a Sync Link/QR Code.
- **Mechanism**: The user's progress state is compressed and Base64-encoded into a URL parameter (e.g., hagarprep.com/sync?data=eyJjb2...).
- **UX**: Opening the link or scanning the QR code on a new device decodes the parameter and updates localStorage.

### 3.2 Interactive Quizzes & Mock Exam

- **End-of-Lesson Quizzes**: 5-10 multiple-choice questions testing the immediate material. Immediate feedback with explanations.
- **Final Mock Exam**: A randomized 40-question exam simulating the Transport Canada structure (2.5 hours time limit, 60% pass mark). It will draw heavily from the HPAC/ACVL Annex A 64-question bank.

## 4. Lesson Plan (Curriculum)

Mapped directly to the HPAC/ACVL HAGAR Study Guide V3.1.

### Chapter 1: Air Regulations (CARs)

1.1 **Definitions**: Night/Day (civil twilight), Aircraft, Aerodrome.
1.2 **Exemptions from CARs**: What HG/PG pilots don't need (registration, C of A, logbooks, day VFR instruments, ELTs).
1.3 **Operating Rules**: Alcohol and drugs (12 hours, no impairment), overflight of built-up areas, minimum altitudes.
1.4 **Right-of-Way Rules**: Converging, overtaking, head-on rules, and right-of-way hierarchy (gliders vs. balloons vs. powered).
1.5 **HG Specific Operations (CAR 602.29)**: Conditions for flying in Class E, C, and D airspace.

### Chapter 2: VNC Charts

2.1 **Chart Projections**: Lambert Conformal Conic vs. Mercator projections.
2.2 **Chart Symbology**: Reading the legend, identifying aerodromes, radio navigation aids (VORs/NDBs).
2.3 **Airspace Depictions**: Identifying Class C, D, E, and F on the VNC.

### Chapter 3: Canadian Airspace

3.1 **Domestic Airspace**: Southern vs. Northern Domestic Airspace (and why magnetic compasses aren't used in the North).
3.2 **The "Inverted Cake"**: Visualizing Class A, B, C, D, E, and G airspace. Control Zones (CZ) vs. Terminal Control Areas (TCA).
3.3 **Airways**: VHF/UHF vs. LF/MF airway dimensions.
3.4 **Special Use Airspace**: Class F (CYA Advisory vs. CYR Restricted) and their specific codes (A, F, H, M, P, S, T).

### Chapter 4: Map Work

4.1 **Coordinates**: Locating features using Latitude and Longitude (Degrees and Minutes).
4.2 **Magnetic Variation**: True North (TN) vs. Magnetic North (MN), Isogonic lines, Agonic lines. Converting TH to MH and vice versa.
4.3 **Compass Errors**: Acceleration/Deceleration errors and Turning errors (Lead/Lag).

### Chapter 5: Flight Operations

5.1 **Pre-Flight**: NOTAMs and weather.
5.2 **Wake Turbulence**: Causes, effects, and avoidance of wingtip vortices.
5.3 **Communications**: VHF frequencies (121.5, 122.75, 123.2, 126.7), Standard Radio Usage, Phonetic Alphabet, declaring emergencies (MAYDAY vs. PAN PAN).
5.4 **Time & Wildlife**: UTC to Local Time conversions, wildlife protection rules.

### Chapter 6: Human Factors

6.1 **Physiology**: Hypoxia, hyperventilation, decompression sickness (the bends), middle ear/sinus pain.
6.2 **Pilot Psychology & Senses**: Substance abuse (alcohol metabolism), over-the-counter medications, vision/scanning techniques (empty-field myopia), disorientation.

### Final Chapter: Examination

- **Full Mock Exam**: Timed and graded.

## 5. Custom MDX Components Specifications

To make the course highly interactive, the following custom React/Preact components will be embedded directly into the .mdx files.

### 5.1 `<Quiz />` and `<MockExam />`

- **Props**: questions (array), showExplanations (boolean), isTimed (boolean).
- **Functionality**: Displays multiple-choice questions. Tracks selected answers. On submission, displays a results screen with feedback.
- **Data Source**: Seeded with the 64 questions from Annex A of the HPAC guide.

### 5.2 `<VNCViewer />`

- **Description**: An interactive map component replicating a VFR Navigation Chart.
- **Features**:
  - **Pan & Zoom**: Standard map controls using Leaflet.
  - **Virtual Plotter Tool**: Click Point A, then Point B. The tool draws a line and overlays a simulated ruler/protractor, displaying the True Track and distance (in NM) to practice VNC measurements.
  - **Coordinate Finder**: A crosshair that shows the exact Degrees/Minutes of Latitude and Longitude of the user's cursor.

### 5.3 `<AirspaceCake />`

- **Description**: An interactive 3D or 2D layered SVG model of the "Inverted Wedding Cake" airspace structure.
- **Interactive Features**:
  - Users can hover over layers (Control Zone, Terminal Control Area, Control Area Extension) to see the Class (C, D, E) and typical floor/ceiling altitudes (e.g., 1,500' AGL, 12,500' ASL).
  - A toggle switch to show the difference between an airport with a tower (Class C/D) vs. an uncontrolled airport in Class E.

### 5.4 `<MagneticVariationTool />`

- **Description**: A visual tool to teach TH = MH +/- Variation.
- **Interactive Features**:
  - A compass rose with a draggable "True North" and "Magnetic North" arrow.
  - An input slider to set the "West Variation" or "East Variation".
  - As the user slides the variation, the math dynamically updates on the screen (e.g., "Variation is 14°W. To fly a True Heading of 090°, you must steer a Magnetic Heading of 104°").

### 5.5 `<CompassErrorSimulator />`

- **Description**: A visual animation showing how a compass behaves in flight (crucial for exam questions).
- **Interactive Features**:
  - **Turning Errors**: Two buttons ("Turn North" / "Turn South"). Clicking "Turn North" shows the compass needle visually lagging behind the turn.
  - **Acceleration Errors**: A slider for "Speed". Accelerating on an East/West heading visually causes the compass to dip/indicate a false North turn.

### 5.6 `<SyncManager />`

- **Description**: A UI component living in the user settings.
- **Interactive Features**: Stringifies the user's progress, encodes it, and uses qrcode.react to generate a scanable QR code, alongside a "Copy Link" button for seamless cross-device syncing.

## 6. Testing Strategy

### 6.1 Unit Testing (Vitest + React Testing Library)

- **Math Logic**: Test the True/Magnetic heading conversions in the `<MagneticVariationTool />` (e.g., calculateMH(90, '14W') === 104).
- **Quiz Logic**: Ensure the mock exam accurately scores based on the 60% passing requirement.
- **State Management**: Serialization/deserialization tests (ensuring the Sync URL correctly parses back into a valid JSON state without dropping progress).

### 6.2 Component Integration Testing

- **VNC Plotter**: Programmatically simulate clicks at known coordinates on the `<VNCViewer />`. Assert that the calculated distance (NM) and heading match expected mathematical values.

### 6.3 End-to-End (E2E) Testing (Playwright or Cypress)

- **User Flows**: Navigate to a lesson -> Read text -> Take Quiz -> Pass Quiz -> Check if the sidebar navigation updates to show a "Green Checkmark" for that lesson.
- **Sync Flow**: Generate a Sync Link -> Open a new incognito browser -> Paste URL -> Verify the local storage state populates and unlocks completed lessons.

### 6.4 Accessibility (A11y) Testing

- **Screen Readers**: Use axe-core to check ARIA labels. Highly visual tools (like the `<CompassErrorSimulator />` and `<AirspaceCake />`) must include fallback text descriptions explaining the concept (e.g., "An animation showing that as an aircraft accelerates on an East heading, the compass erroneously swings North").
