#!/usr/bin/env python3
"""
Render all PlantUML (.puml) and Mermaid (.mmd) diagrams.

Supports two modes:
1. CLI Mode (Recommended - Offline): Uses plantuml/mmdc command-line tools
2. Kroki Mode (Fallback - Online): Uses Kroki API service

The script auto-detects available tools and uses the best option.
"""

import os
import sys
import subprocess
import json

DIAGRAMS_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(DIAGRAMS_DIR, "img")
SVG_DIR = os.path.join(DIAGRAMS_DIR, "svg")

os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(SVG_DIR, exist_ok=True)


def has_command(cmd):
    """Check if a command is available in PATH."""
    return subprocess.run(
        ["which", cmd],
        capture_output=True,
        timeout=5
    ).returncode == 0


def render_with_cli():
    """Render diagrams using command-line tools (PlantUML, Mermaid CLI)."""
    print("=== Rendering with CLI Tools (Offline) ===\n")
    
    has_plantuml = has_command("plantuml")
    has_mmdc = has_command("mmdc")
    
    if not has_plantuml and not has_mmdc:
        print("ERROR: Neither 'plantuml' nor 'mmdc' found in PATH.")
        print("Install with:")
        print("  - PlantUML: brew install plantuml")
        print("  - Mermaid CLI: npm install -g @mermaid-js/mermaid-cli")
        return False
    
    success_count = 0
    total_count = 0
    
    for filename in sorted(os.listdir(DIAGRAMS_DIR)):
        if filename.endswith(".puml"):
            if not has_plantuml:
                print(f"[SKIP] {filename} (plantuml not installed)")
                continue
            
            path = os.path.join(DIAGRAMS_DIR, filename)
            name = os.path.splitext(filename)[0]
            
            print(f"[PlantUML] {filename}...", end=" ")
            total_count += 1
            
            try:
                # PlantUML renders both PNG and SVG in one command
                result = subprocess.run(
                    ["plantuml", "-png", "-svg", path],
                    cwd=IMG_DIR,
                    capture_output=True,
                    timeout=30,
                    text=True
                )
                
                if result.returncode == 0:
                    print("OK")
                    success_count += 1
                else:
                    print(f"FAIL: {result.stderr[:100]}")
                    
            except subprocess.TimeoutExpired:
                print("FAIL: Timeout (30s)")
            except Exception as e:
                print(f"FAIL: {str(e)[:100]}")
        
        elif filename.endswith(".mmd"):
            if not has_mmdc:
                print(f"[SKIP] {filename} (mmdc not installed)")
                continue
            
            path = os.path.join(DIAGRAMS_DIR, filename)
            name = os.path.splitext(filename)[0]
            
            print(f"[Mermaid] {filename}...", end=" ")
            total_count += 1
            
            try:
                # Mermaid CLI renders PNG
                png_out = os.path.join(IMG_DIR, f"{name}.png")
                result = subprocess.run(
                    ["mmdc", "-i", path, "-o", png_out],
                    capture_output=True,
                    timeout=30,
                    text=True
                )
                
                if result.returncode == 0:
                    print("OK (PNG only)")
                    success_count += 1
                else:
                    print(f"FAIL: {result.stderr[:100]}")
                    
            except subprocess.TimeoutExpired:
                print("FAIL: Timeout (30s)")
            except Exception as e:
                print(f"FAIL: {str(e)[:100]}")
    
    print(f"\n{'='*50}")
    print(f"CLI Render: {success_count}/{total_count} diagrams rendered")
    return success_count == total_count if total_count > 0 else False


def render_with_kroki():
    """Fallback: Render diagrams using Kroki API (Online)."""
    print("\n=== Rendering with Kroki API (Fallback - Online) ===\n")
    
    import urllib.request
    
    results = []
    
    for filename in sorted(os.listdir(DIAGRAMS_DIR)):
        if filename.endswith(".puml"):
            path = os.path.join(DIAGRAMS_DIR, filename)
            name = os.path.splitext(filename)[0]
            print(f"[PlantUML] {filename}...", end=" ")
            results.append(render_kroki(path, "plantuml", name))
            
        elif filename.endswith(".mmd"):
            path = os.path.join(DIAGRAMS_DIR, filename)
            name = os.path.splitext(filename)[0]
            print(f"[Mermaid] {filename}...", end=" ")
            results.append(render_kroki(path, "mermaid", name))
    
    print(f"\n{'='*50}")
    passed = sum(results)
    total = len(results)
    print(f"Kroki Render: {passed}/{total} diagrams rendered")
    return passed == total if total > 0 else False


def render_kroki(source_path, diagram_type, name):
    """Render a single diagram using Kroki POST API."""
    import urllib.request
    
    try:
        with open(source_path, "rb") as f:
            source = f.read()
        
        success = True
        
        for fmt, out_dir in [("png", IMG_DIR), ("svg", SVG_DIR)]:
            url = f"https://kroki.io/{diagram_type}/{fmt}"
            out_path = os.path.join(out_dir, f"{name}.{fmt}")
            
            try:
                req = urllib.request.Request(
                    url,
                    data=source,
                    headers={"Content-Type": "text/plain"},
                    method="POST",
                )
                resp = urllib.request.urlopen(req, timeout=30)
                data = resp.read()
                with open(out_path, "wb") as f:
                    f.write(data)
            except Exception:
                success = False
        
        print("OK" if success else "FAIL")
        return success
        
    except Exception as e:
        print(f"FAIL: {str(e)[:50]}")
        return False


def main():
    print("╔════════════════════════════════════════════════╗")
    print("║  PlantUML & Mermaid Diagram Renderer            ║")
    print("║  Supports: CLI (offline) + Kroki API (online)  ║")
    print("╚════════════════════════════════════════════════╝\n")
    
    # Try CLI first (preferred: offline, no encoding issues)
    if has_command("plantuml") or has_command("mmdc"):
        success = render_with_cli()
        if success:
            print("\n✓ All diagrams rendered successfully (CLI mode)")
            sys.exit(0)
    
    # Fallback to Kroki API
    print("\nCLI tools not found. Falling back to Kroki API...\n")
    success = render_with_kroki()
    
    if success:
        print("\n✓ All diagrams rendered successfully (Kroki mode)")
        sys.exit(0)
    else:
        print("\n✗ Some diagrams failed to render")
        print("\nTo fix, install PlantUML or Mermaid CLI:")
        print("  • macOS: brew install plantuml")
        print("  • Linux: sudo apt install plantuml")
        print("  • Mermaid: npm install -g @mermaid-js/mermaid-cli")
        sys.exit(1)


if __name__ == "__main__":
    main()

