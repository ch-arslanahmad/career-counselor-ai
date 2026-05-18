# Diagrams — Career Counselor AI

**Diagram Strategy:** PlantUML is the canonical format. Mermaid versions exist for specific diagrams only when PlantUML syntax is insufficient.

---

## Source Files (PlantUML - Primary)

| Diagram | File | Description | Uses |
|---------|------|-------------|------|
| Use Case | `use-case.puml` | Student actors and 8 use cases | instructor review |
| Sequence | `sequence.puml` | 8-step assessment → render flow | system understanding |
| Activity | `activity.puml` | Decision tree (form → validation → AI) | workflow documentation |
| Component | `component.puml` | 3 packages (Frontend, Backend, External) | architecture reference |
| Context | `context.puml` | System context with AI providers | stakeholder view |
| Deployment | `deployment.puml` | Student machine, dev machine, cloud | ops/deployment planning |
| ER Diagram | `er.puml` | 6 entities with relationships | database design |
| Class | `class.puml` | 8 classes (User, AssessmentHistory, etc.) | implementation guide |
| Gantt | `gantt.puml` | 5 sprints, 40+ tasks, timeline | project tracking |

---

## Source Files (Mermaid - Alternate Format)

Only created when PlantUML rendering was problematic. Prefer PlantUML versions above.

| Diagram | File | Status |
|---------|------|--------|
| Class | `class.mmd` | **Deprecated** — use `class.puml` instead |
| Sequence | `sequence.mmd` | **Deprecated** — use `sequence.puml` instead |

---

## Rendered Output

**PNG files** (raster, for presentations):
- `img/` directory contains all 9 diagram PNG renders (suitable for slides, PDFs)

**SVG files** (vector, for web/scaling):
- `svg/` directory contains all 9 diagram SVG renders (suitable for web, responsive layouts)

---

## How to Regenerate Diagrams

### Option 1: Use Kroki (Online)

```bash
python3 render_all.py
```

This script:
1. Reads all `.puml` and `.mmd` files
2. Sends them to https://kroki.io API (POST)
3. Saves PNG to `img/` and SVG to `svg/`
4. Requires internet connection

**Limitation:** Kroki timeout or network issues may prevent re-rendering. Existing files are never deleted.

### Option 2: Use PlantUML CLI (Offline - Recommended for CI/CD)

```bash
# Install PlantUML (requires Java)
brew install plantuml  # macOS
# or
sudo apt install plantuml  # Linux

# Generate all diagrams
plantuml diagrams/*.puml -png -svg
```

This is faster, offline, and deterministic. Recommended for CI/CD pipelines.

### Option 3: VS Code Extension

Install "PlantUML" extension, right-click on `.puml` file → "Export Diagram".

---

## Diagram Quality Notes

### Strengths
- All 9 diagrams are properly rendered with correct syntax
- Relationships, cardinality, and component hierarchies are accurate
- Diagrams match current implementation (code/DB schema)
- Both PNG (presentation) and SVG (web) versions available

### Areas for Improvement (Phase 2)
- Convert all diagrams to PlantUML-only (remove `.mmd` duplicates)
- Add PlantUML CLI as a dev dependency (for offline rendering)
- Add diagram rendering to CI pipeline (auto-update on commits)
- Consider dark mode CSS for HTML diagram display

---

## File Organization

```
diagrams/
├── README.md                      ← You are here
├── render_all.py                  ← Kroki-based rendering script
│
├── *.puml                         ← PlantUML source files (canonical)
│   ├── use-case.puml
│   ├── sequence.puml
│   ├── activity.puml
│   ├── component.puml
│   ├── context.puml
│   ├── deployment.puml
│   ├── er.puml
│   ├── class.puml                 ← NEW: PlantUML version of class diagram
│   └── gantt.puml
│
├── *.mmd                          ← Mermaid source files (alternate, deprecated)
│   ├── class.mmd                  ← Use class.puml instead
│   └── sequence.mmd               ← Use sequence.puml instead
│
├── img/                           ← PNG renders (presentation-ready)
│   ├── use-case.png
│   ├── sequence.png
│   ├── activity.png
│   ├── component.png
│   ├── context.png
│   ├── deployment.png
│   ├── er.png
│   ├── class.png
│   └── gantt.png
│
└── svg/                           ← SVG renders (web-ready, scalable)
    ├── use-case.svg
    ├── sequence.svg
    ├── activity.svg
    ├── component.svg
    ├── context.svg
    ├── deployment.svg
    ├── er.svg
    ├── class.svg
    └── gantt.svg
```

---

## Maintenance Checklist

- [x] All PlantUML source files syntactically valid
- [x] All PNG renders exist and are not corrupted
- [x] All SVG renders exist and are not corrupted
- [x] Diagrams match current code/architecture
- [x] Diagrams referenced correctly in deliverables docs
- [ ] *Phase 2*: Remove `.mmd` files (consolidate to PlantUML only)
- [ ] *Phase 2*: Add PlantUML CLI for local rendering
- [ ] *Phase 2*: Add diagram rendering to CI pipeline

---

## References

- **PlantUML Guide**: https://plantuml.com
- **Kroki API**: https://kroki.io (supports PlantUML, Mermaid, Graphviz, C4, etc.)
- **Mermaid Guide**: https://mermaid.js.org

---

**Last Updated:** May 18, 2026  
**Status:** Ready for delivery, Phase 2 improvements documented


Search for "PlantUML" or "Mermaid Markdown Syntax Support" in VS Code extensions. Open a `.puml` or `.mmd` file and press `Alt+D` to preview/export.

### Online Editor (Mermaid)

1. Open https://mermaid.live
2. Paste content from the `.mmd` file
3. Export as PNG or SVG

---

## Files Overview

| Source | Format | Renders In |
|--------|--------|------------|
| `use-case.puml` | PlantUML | `img/use-case.png`, `svg/use-case.svg` |
| `sequence.puml` | PlantUML | `img/sequence.png`, `svg/sequence.svg` |
| `class.mmd` | Mermaid | `img/class.png`, `svg/class.svg` |
| `sequence.mmd` | Mermaid | `img/sequence.png`, `svg/sequence.svg` |
| `activity.puml` | PlantUML | `img/activity.png`, `svg/activity.svg` |
| `component.puml` | PlantUML | `img/component.png`, `svg/component.svg` |
| `deployment.puml` | PlantUML | `img/deployment.png`, `svg/deployment.svg` |
| `context.puml` | PlantUML | `img/context.png`, `svg/context.svg` |
| `er.puml` | PlantUML | `img/er.png`, `svg/er.svg` |
| `gantt.puml` | PlantUML | `img/gantt.png`, `svg/gantt.svg` |

---

## Render All at Once

Run the conversion script to render all diagrams:

```bash
python docs/deliverables/diagrams/render_all.py
```

This reads every `.puml` and `.mmd` file, encodes it, fetches PNG + SVG from Kroki, and saves to `img/` and `svg/`.
