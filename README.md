# SPS Sustainability Dashboard (Pilot)

This repository provides a shared, zero‑cost sustainability dashboard for all SPS projects.

The dashboard aggregates sustainability analysis results from multiple projects
(GitHub‑hosted or Azure DevOps‑hosted) using Azure DevOps pipelines.

---

## What this dashboard shows

- Overall sustainability score over time
- Category‑level trends:
  - Energy Efficiency
  - Resource Utilisation (Memory)
  - Performance Optimisation
- Separate views per project
- Separate views per scope:
  - internal
  - external
  - scripts

This analysis focuses on **codebase sustainability and maintainability**.
It does **not** measure runtime energy consumption or APIM gateway performance.

---

## Repository Structure

```text
dashboard/        # Shared UI (HTML/JS/CSS)
data/             # Sustainability results (JSON)
pipelines/        # Shared pipeline templates
