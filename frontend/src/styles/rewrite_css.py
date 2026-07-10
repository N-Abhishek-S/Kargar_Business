import re

css_path = 'c:/Users/nagar/OneDrive/Desktop/KargarWeb/frontend/src/styles/index.css'

with open(css_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject CSS Variables into .kargar-site
variables_to_inject = """
  /* --- ENTERPRISE SIZING SYSTEM --- */
  --k-container-max: 1320px;
  
  /* Spacing */
  --space-1: 24px;
  --space-2: 32px;
  --space-3: 40px;
  --space-section-y: 64px;
  
  /* Typography Scale */
  --text-hero: 54px;
  --text-section: 40px;
  --text-card: 24px;
  --text-body: 16px;
  --text-small: 14px;
  
  /* Line Heights */
  --lh-heading: 1.15;
  --lh-body: 1.6;
  
  /* Components */
  --nav-height: 80px;
  --hero-height: 680px;
  --btn-height: 48px;
  --btn-radius: 12px;
  --card-radius: 20px;
  --card-padding: 20px;
  --icon-size: 44px;
  --icon-small: 24px;
  --input-height: 52px;
  
  /* Shadows */
  --shadow-main: 0 12px 40px rgba(15,23,42,.08);
"""

# Find .kargar-site definition and inject
if ".kargar-site {" in content:
    content = re.sub(
        r'(\.kargar-site \{[^}]*?font-family:[^;]+;)',
        r'\1\n' + variables_to_inject,
        content,
        count=1
    )

# 2. Update .k-container
content = re.sub(
    r'(\.k-container\s*\{[^}]*?width:\s*)min\(calc\(100%\s*-\s*48px\),\s*1440px\)',
    r'\1min(calc(100% - 48px), var(--k-container-max))',
    content
)

# 3. Update global headings and paragraphs line-height if possible, or add them
content = re.sub(
    r'(\.kargar-site h1,.*?\.kargar-site h6\s*\{[^}]*?)',
    r'\1\n  line-height: var(--lh-heading);',
    content
)

# 4. Update section padding
content = re.sub(
    r'(\.k-section\s*\{[^}]*?padding-block:\s*)56px',
    r'\1var(--space-section-y)',
    content
)

content = re.sub(
    r'(\.section-padding\s*\{\s*padding-top:\s*)\d+rem(;\s*padding-bottom:\s*)\d+rem',
    r'\1var(--space-section-y)\2var(--space-section-y)',
    content
)

# 5. Navbar Height
content = re.sub(
    r'(\.k-nav__inner\s*\{[^}]*?min-height:\s*)88px',
    r'\1var(--nav-height)',
    content
)
# Reduce logo size (assuming it was large)
content = re.sub(
    r'(\.k-nav__logo img\s*\{[^}]*?height:\s*)\d+px',
    r'\g<1>40px',
    content
)

# 6. Hero sizing
content = re.sub(
    r'(\.k-hero\s*\{[^}]*?)(min-height:\s*)100vh',
    r'\1min-height: var(--hero-height)',
    content
)
content = re.sub(
    r'(\.k-hero h1\s*\{[^}]*?font-size:\s*)54px',
    r'\1var(--text-hero)',
    content
)
# Hero image reduction
content = re.sub(
    r'(\.k-hero__visual img\s*\{[^}]*?max-height:\s*)\d+px',
    r'\g<1>500px', # Reduced from whatever it was to ~500px to fit 680px hero
    content
)
content = re.sub(
    r'(\.k-hero__visual\s*\{[^}]*?padding:\s*)\d+px',
    r'\g<1>24px',
    content
)

# 7. Button sizing
content = re.sub(
    r'(\.k-btn\s*\{[^}]*?min-height:\s*)48px',
    r'\1var(--btn-height)',
    content
)
content = re.sub(
    r'(\.k-btn\s*\{[^}]*?padding:\s*)0 24px',
    r'\1 0 28px',
    content
)
content = re.sub(
    r'(\.k-btn\s*\{[^}]*?border-radius:\s*)\d+px',
    r'\1var(--btn-radius)',
    content
)

# 8. Typography generic
content = re.sub(
    r'font-size:\s*40px', r'font-size: var(--text-section)', content
)
content = re.sub(
    r'font-size:\s*25px', r'font-size: var(--text-card)', content
)

# 9. Cards padding and image sizing
content = re.sub(
    r'(\.k-service-card\s*\{[^}]*?border-radius:\s*)\d+px',
    r'\1var(--card-radius)',
    content
)
content = re.sub(
    r'(\.k-service-card__body\s*\{[^}]*?padding:\s*)\d+px',
    r'\1var(--card-padding)',
    content
)
content = re.sub(
    r'(\.k-service-card__image\s*\{[^}]*?height:\s*)\d+px',
    r'\1 230px', # From user: height: 220-240px
    content
)

# Feature icons
content = re.sub(
    r'(\.k-icon-badge\s*\{[^}]*?width:\s*)64px([^}]*?height:\s*)64px',
    r'\1var(--icon-size)\2var(--icon-size)',
    content
)
content = re.sub(
    r'(\.k-icon-badge svg\s*\{[^}]*?width:\s*)32px([^}]*?height:\s*)32px',
    r'\1var(--icon-small)\2var(--icon-small)',
    content
)

# Client logos (reduce height)
content = re.sub(
    r'(\.k-client-logo\s*\{[^}]*?height:\s*)\d+px',
    r'\g<1>60px', # Assuming reduction
    content
)

# Inputs
content = re.sub(
    r'(\.k-input\s*\{[^}]*?min-height:\s*)\d+px',
    r'\1var(--input-height)',
    content
)
content = re.sub(
    r'(\.k-textarea\s*\{[^}]*?min-height:\s*)\d+px',
    r'\1 140px',
    content
)

# Apply global line-height to p
content = re.sub(
    r'(p\s*\{[^}]*?)line-height:\s*[0-9.]+',
    r'\1line-height: var(--lh-body)',
    content
)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("CSS rewritten successfully!")
