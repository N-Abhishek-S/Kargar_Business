import re

css_path = 'c:/Users/nagar/OneDrive/Desktop/KargarWeb/frontend/src/styles/index.css'

def extract_block(lines, class_name):
    in_block = False
    block = []
    for line in lines:
        if class_name in line and "{" in line:
            in_block = True
        if in_block:
            block.append(line.strip())
            if "}" in line:
                break
    return "\n".join(block)

with open(css_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

blocks_to_check = [
    ".k-container",
    ".k-nav__inner",
    ".k-hero",
    ".k-section",
    ".k-btn",
    ".k-service-card",
    ".k-review-card", # Maybe .k-testimonial? Let's check review
    ".k-contact",
    ".k-footer"
]

for b in blocks_to_check:
    print(f"\n--- {b} ---")
    print(extract_block(lines, b))

