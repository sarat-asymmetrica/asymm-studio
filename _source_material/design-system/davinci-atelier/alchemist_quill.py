import re
import os
import json
import sys

class AlchemistEngine:
    def __init__(self, manifest_path="component_manifest.json"):
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        self.manifest_path = os.path.join(self.base_dir, manifest_path)
        self.load_manifest()
        self.css_registry = set()
        self.js_registry = set()

    def load_manifest(self):
        print(f"Loading manifest from: {self.manifest_path}")
        try:
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                self.manifest = json.load(f)
        except FileNotFoundError:
            print(f"Error: Manifest file not found at {self.manifest_path}")
            self.manifest = {}
            return

        # Pre-load templates
        for name, data in self.manifest.items():
            files = data.get("files", {})
            if "html" in files:
                try:
                    with open(os.path.join(self.base_dir, files["html"]), 'r', encoding='utf-8') as f:
                        data["template"] = f.read()
                except FileNotFoundError:
                    print(f"Warning: HTML file for {name} not found.")
            if "css" in files:
                try:
                    with open(os.path.join(self.base_dir, files["css"]), 'r', encoding='utf-8') as f:
                        data["style"] = f.read()
                except FileNotFoundError:
                    print(f"Warning: CSS file for {name} not found.")
            if "js" in files:
                try:
                    with open(os.path.join(self.base_dir, files["js"]), 'r', encoding='utf-8') as f:
                        data["script"] = f.read()
                except FileNotFoundError:
                    print(f"Warning: JS file for {name} not found.")

    def get_component(self, name, **kwargs):
        comp = self.manifest.get(name)
        if not comp:
            print(f"Warning: Component '{name}' not found in manifest.")
            return ""
        
        # Register assets (idempotent due to set)
        if "style" in comp: self.css_registry.add(comp["style"])
        if "script" in comp: self.js_registry.add(comp["script"])

        # Render template
        template = comp.get("template", "")
        for key, value in kwargs.items():
            # Simple replacement for {{key}}
            template = template.replace(f"{{{{{key}}}}}", str(value))
        return template

    def register_assets_only(self, name):
        """For components like TextBloom that don't have a template but have assets."""
        comp = self.manifest.get(name)
        if comp:
            if "style" in comp: self.css_registry.add(comp["style"])
            if "script" in comp: self.js_registry.add(comp["script"])

    def transmute(self, filepath):
        print(f"Transmuting: {filepath}")
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except FileNotFoundError:
            print(f"Error: Target file {filepath} not found.")
            return

        # Reset registries for new file
        self.css_registry = set()
        self.js_registry = set()
        self.modal_html_pending = ""

        # --- Transformations ---

        # 1. Void Terminal (Code Blocks & Diagrams)
        content = re.sub(r'<div class="code-block">\s*(.*?)\s*</div>', 
                         lambda m: self.get_component("void_terminal", content=m.group(1)), 
                         content, flags=re.DOTALL)
        
        content = re.sub(r'<div class="diagram">\s*(.*?)\s*</div>', 
                         lambda m: self.get_component("void_terminal", content=m.group(1)), 
                         content, flags=re.DOTALL)

        # 2. Kintsugi Alert (Breakthrough, Key Discovery, etc.)
        def kintsugi_replacer(match, label):
            return self.get_component("kintsugi_alert", content=match.group(1), type_label=label)

        content = re.sub(r'<div class="breakthrough-box">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "BREAKTHROUGH"), content, flags=re.DOTALL)
        content = re.sub(r'<div class="key-discovery">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "KEY DISCOVERY"), content, flags=re.DOTALL)
        content = re.sub(r'<div class="key-finding">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "KEY FINDING"), content, flags=re.DOTALL)
        content = re.sub(r'<div class="validation-box">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "VALIDATION"), content, flags=re.DOTALL)
        content = re.sub(r'<div class="reader-note">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "READER NOTE"), content, flags=re.DOTALL)
        content = re.sub(r'<div class="methodology-box">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "METHODOLOGY"), content, flags=re.DOTALL)
        content = re.sub(r'<div class="formula-box">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "FORMULA"), content, flags=re.DOTALL)
        content = re.sub(r'<div class="future-directions">\s*(.*?)\s*</div>', 
                         lambda m: kintsugi_replacer(m, "FUTURE DIRECTIONS"), content, flags=re.DOTALL)

        # 3. Gravity Grid (Tables)
        content = re.sub(r'(<table.*?>.*?</table>)', 
                         lambda m: self.get_component("gravity_grid", content=m.group(1)), 
                         content, flags=re.DOTALL)

        # 4. Text Bloom (Headers)
        # We don't replace the tag, we just wrap the content. 
        # But TextBloom component in manifest has no template, only assets.
        # So we need to manually wrap and register assets.
        def bloom_header(match):
            self.register_assets_only("text_bloom")
            tag = match.group(1)
            attrs = match.group(2)
            text = match.group(3)
            return f'<{tag} {attrs}><span class="text-bloom">{text}</span></{tag}>'
        
        content = re.sub(r'<(h[1-3])(.*?)>(.*?)</\1>', bloom_header, content)

        # 5. Shoji Modal (References)
        # Shoji Modal has a template (the modal itself) that needs to be injected ONCE.
        # And triggers that need to be wrapped.
        
        # Inject the modal structure at the end of body if references exist
        if "reference" in content or "reference-item" in content:
            # Register the modal structure as a "footer" component? 
            # Or just append it. Let's append it via the template.
            modal_html = self.get_component("shoji_modal") # Registers assets too
            # We'll append modal_html later with JS injection
            self.modal_html_pending = modal_html
        else:
            self.modal_html_pending = ""

        def make_reference_trigger(match):
            inner = match.group(1)
            return f'<div class="reference-item reference-trigger">{inner}</div>'

        content = re.sub(r'<div class="reference-item">\s*(.*?)\s*</div>', 
                         make_reference_trigger, content, flags=re.DOTALL)
        content = re.sub(r'<div class="reference">\s*(.*?)\s*</div>', 
                         make_reference_trigger, content, flags=re.DOTALL)

        # --- Asset Injection ---
        
        # CSS
        css_block = "<style>\n" + "\n".join(self.css_registry) + "\n</style>"
        if "</head>" in content:
            content = content.replace("</head>", css_block + "\n</head>")
        
        # JS
        js_block = "<script>\n" + "\n".join(self.js_registry) + "\n</script>"
        if "</body>" in content:
            # Inject Modal HTML before script
            injection = self.modal_html_pending + "\n" + js_block
            content = content.replace("</body>", injection + "\n</body>")

        # Output
        output_path = filepath.replace(".html", "_visual.html")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Transmutation complete: {output_path}")

    def forge(self, blueprint, output_filename="generated_app.html"):
        """
        Forges a new application from a JSON blueprint.
        """
        print(f"Forging new app: {output_filename}")
        
        # 1. Extract Config
        app_config = blueprint.get("app_config", {})
        theme = app_config.get("theme", "default")
        layout = app_config.get("layout", "standard")
        
        # 2. Build Base HTML
        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forged Application | {theme.upper()}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Lora:ital,wght@0,400;0,500;1,400&family=Courier+Prime&family=Outfit:wght@300;400;500&display=swap');
        
        :root {{
            --bg-color: #fdfbf7;
            --text-color: #1c1c1c;
        }}
        
        body {{
            background: var(--bg-color);
            color: var(--text-color);
            font-family: 'Outfit', sans-serif;
            margin: 0;
            padding: 20px;
        }}

        /* Theme Overrides */
        body.theme-void_punk {{
            --bg-color: #050505;
            --text-color: #e5e5e5;
            background: #000;
        }}
        
        body.theme-wabi_sabi {{
            --bg-color: #f4f1ea;
            --text-color: #2c241b;
        }}

        .layout-grid_dashboard {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }}
    </style>
</head>
<body class="theme-{theme} layout-{layout}">
    <h1>Forged Application</h1>
    <div id="app-container" class="layout-{layout}">
        <!-- Components Injected Here -->
        {{COMPONENTS}}
    </div>
</body>
</html>"""

        # 3. Assemble Components
        components_html = ""
        self.css_registry = set()
        self.js_registry = set()
        
        for comp_def in blueprint.get("components", []):
            c_type = comp_def.get("type")
            c_props = comp_def.get("props", {})
            
            # Map type to manifest key (simple lowercase for now)
            manifest_key = c_type.lower()
            if manifest_key == "statcard": manifest_key = "void_terminal" # Fallback for demo
            if manifest_key == "voidterminal": manifest_key = "void_terminal"
            if manifest_key == "gravitygrid": manifest_key = "gravity_grid"
            if manifest_key == "textbloom": manifest_key = "text_bloom"
            
            # Special handling for TextBloom (wrapper)
            if manifest_key == "text_bloom":
                self.register_assets_only("text_bloom")
                text = c_props.get("text", "Bloom Text")
                components_html += f'<h2 class="text-bloom">{text}</h2>'
            else:
                # Standard Component
                # Map props to template args
                # For VoidTerminal, content is the main arg
                content = c_props.get("content") or c_props.get("value") or "No Content"
                if c_props.get("label"): content = f"{c_props['label']}: {content}"
                
                comp_html = self.get_component(manifest_key, content=content)
                components_html += comp_html

        # 4. Inject Components into Base HTML
        html_content = html_content.replace("{{COMPONENTS}}", components_html)

        # 5. Inject Assets
        css_block = "<style>\n" + "\n".join(self.css_registry) + "\n</style>"
        html_content = html_content.replace("</head>", css_block + "\n</head>")
        
        js_block = "<script>\n" + "\n".join(self.js_registry) + "\n</script>"
        html_content = html_content.replace("</body>", js_block + "\n</body>")

        # 6. Write File
        with open(output_filename, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"Forge complete: {output_filename}")
        return output_filename

if __name__ == "__main__":
    # Default target
    target = "UNIFIED_INTELLIGENCE_MONITORING_RESEARCH_PAPER.html"
    
    # Allow command line arg
    if len(sys.argv) > 1:
        target = sys.argv[1]

    engine = AlchemistEngine()
    if os.path.exists(target):
        engine.transmute(target)
    else:
        print(f"Target file not found: {target}")
