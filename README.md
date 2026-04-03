# Schedula OS

Schedula OS is an interactive CPU scheduling simulator built to visualize, compare, and analyze classical and hybrid scheduling algorithms in a modern web interface.

It combines operating systems concepts with an interactive dashboard, live timeline playback, energy and fairness analysis, scenario-based workloads, and AI-inspired recommendation features. The project is designed to be useful for learning, demos, academic presentations, and interview discussions.

## Overview

This project helps users:

- add and manage processes manually or by importing workloads
- simulate multiple CPU scheduling algorithms
- compare algorithm performance on the same workload
- study waiting time, turnaround time, fairness, context switching, and energy usage
- visualize schedules with Gantt timelines and charts
- experiment with custom hybrid scheduling strategies
- explore scenario-driven workloads such as hospital, gaming, server, and factory systems

## Features

### Core Scheduling Features

- First-Come, First-Served (`FCFS`)
- Shortest Job First (`SJF`)
- Shortest Remaining Time First (`SRTF`)
- Priority Scheduling, Non-Preemptive (`PriorityNP`)
- Priority Scheduling, Preemptive (`PriorityP`)
- Round Robin (`RR`)
- Multilevel Queue Scheduling (`MLQ`)
- Custom Hybrid Scheduler (`CUSTOM`)

### Input and Workload Tools

- manual task entry
- CSV import and export
- preset real-world workloads
- real-time workload generation
- saved browser sessions using `localStorage`

### Visualization and Analysis

- live Gantt chart playback
- process state visualizer
- waiting time and turnaround time metrics
- fairness score and context-switch counter
- energy consumption analysis
- energy distribution charts
- performance vs energy comparison chart

### Innovative Features

- plain-English scheduler recommendation
- scenario storytelling mode
- workload fingerprint analysis
- head-to-head algorithm comparison
- dual timeline comparison view
- guided scheduling coach
- project scorecard with auto-generated observations
- challenge mode for learning and testing intuition

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Chart.js
- Browser `localStorage`

## Project Structure

```text
.
|-- index.html
|-- style.css
|-- script.js
|-- README.md
```

## How To Run

### Option 1: Open Directly

Open [index.html](./index.html) in your browser.

### Option 2: Run With a Local Server

Using VS Code Live Server or any static server:

1. Start a local server in the project folder.
2. Open `http://localhost:<port>/`

Because the main file is named `index.html`, it will open directly from the local root.

## How To Use

### Basic Simulation

1. Add tasks manually or load a preset workload.
2. Select a scheduling algorithm.
3. Choose an execution mode.
4. Enter time quantum if required.
5. Click `Start Simulation`.

### Compare Algorithms

1. Add or load a workload.
2. Click `Compare All`.
3. Review the recommendation, comparison table, charts, and best-fit result.

### Use The AI Recommendation

1. Describe the workload in plain English.
2. Click `Suggest Scheduler`.
3. Review the recommended algorithm and explanation.

### Use Head-To-Head Comparison

1. Select Algorithm A and Algorithm B.
2. Click `Run Head-To-Head`.
3. Review the metric comparison and dual timeline view.

## Metrics Calculated

The simulator calculates:

- Average Waiting Time
- Average Turnaround Time
- Context Switches
- Fairness Score
- Total Energy Consumption
- Energy Efficiency

These metrics are updated after each simulation and comparison run.

## Scenario Presets

The project includes built-in workload presets such as:

- Student Multitasking
- Gaming Session
- API Server Rush
- Mobile Battery Saver
- Emergency Hospital Monitor
- Video Streaming Edge Node
- Online Exam Portal
- Smart Factory Controller

These scenarios make it easier to demonstrate how different schedulers behave under realistic operating system conditions.

## Custom Hybrid Scheduler

The Custom Hybrid Scheduler allows users to define different policies for:

- system queue
- interactive queue
- background queue

It also supports:

- configurable aging interval
- custom Round Robin quantum

This makes the project more flexible than a basic simulator and allows experimentation with adaptive scheduling strategies.

## Save and Export

### Save Session

`Save Session` stores the current workload and last simulation in browser `localStorage`.

### Export Options

The project supports:

- CSV export of tasks
- JSON export of session report
- full HTML solution report export
- summary copying for quick sharing

## Interview Value

This project is useful for interviews because it demonstrates:

- operating systems knowledge
- frontend design and responsiveness
- data visualization
- algorithm implementation
- analytical thinking
- feature design beyond a basic academic project

## Possible Future Improvements

- multi-core scheduling simulation
- drag-and-drop process editing
- backend persistence with database storage
- user authentication and cloud save
- downloadable PDF reports
- step-by-step teaching overlay

## Author

Built as an operating systems scheduling project with an interactive web interface and advanced analysis features.
