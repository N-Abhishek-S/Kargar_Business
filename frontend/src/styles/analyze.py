import re

def analyze_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    targets = [
        ".k-container", ".k-nav", ".k-hero", ".k-btn", ".k-section", 
        "typography", "font-size", ".k-service-card", ".k-review-card", 
        ".k-contact", "footer", "padding", ".section-padding", ".kargar-site"
    ]
    
    found = {t: [] for t in targets}
    
    for i, line in enumerate(lines):
        for t in targets:
            if t in line:
                if len(found[t]) < 10:  # keep first 10 matches
                    found[t].append((i+1, line.strip()))
                    
    for t, matches in found.items():
        print(f"\n--- {t} ---")
        for num, text in matches:
            print(f"L{num}: {text}")

if __name__ == '__main__':
    analyze_css('c:/Users/nagar/OneDrive/Desktop/KargarWeb/frontend/src/styles/index.css')
