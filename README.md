# HAGAR Pro

An interactive course to help pilots prepare for the Transport Canada HAGAR exam.

## Overview

HAGAR Pro is a comprehensive study platform for hang glider and paraglider pilots preparing for the Transport Canada Hang Glider Air Regulations (HAGAR) examination. The course covers all required topics including air regulations, VNC charts, Canadian airspace, flight operations, and human factors.

## Features

- **Structured Curriculum**: 7-section syllabus aligned with HPAC/ACVL standards
- **Interactive Components**: Includes airspace diagrams and map work tools
- **Progress Tracking**: Monitor study progress across all sections
- **Practice Quizzes**: Section-specific quizzes to test knowledge
- **Mobile-Friendly**: Responsive design for studying on any device

## Course Structure

1. **Air Regulations** - Canadian Aviation Regulations, operating rules, and procedures
2. **VNC Charts** - Chart reading, symbology, and navigation
3. **Canadian Airspace** - Airspace classes, regulations, and special use areas
4. **Flight Operations** - NOTAMs, communications, and operational procedures
5. **Human Factors** - Medical fitness, altitude effects, and safety considerations
6. **Practice Exam** - Exam preparation using a random sample of questions

## Project Structure

```
src/
├── components/          # React/Astro components
│   ├── progress/        # Progress tracking UI
│   ├── quiz/           # Quiz components
│   └── tools/          # Interactive learning tools
├── content/docs/        # Course content (MDX)
│   └── curriculum/      # Main curriculum sections
├── lib/                # Utilities and data
│   ├── data/           # Question banks and reference data
│   └── stores/         # State management
└── assets/             # Static assets
```

## Contributing

This course is maintained for the HPAC/ACVL community. You can help improve it by:

- Opening an [issue](https://github.com/columk1/hagar-pro/issues) on GitHub.
- Emailing info@hagarpro.ca with suggestions, feedback, or corrections.

Feedback after taking the exam is especially valuable.

You can also support development by making a donation at https://ko-fi.com/columkelly

## Copyright Notice

Portions of this course reproduce material from the "HPAC/ACVL Study Guide for the HAGAR Examination Version 3.1" (Andre Nadeau, 2016).

This material is used with permission from HPAC/ACVL and remains their property.
