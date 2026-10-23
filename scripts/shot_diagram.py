"""Screenshot do diagrama de arquitetura @2x (pipeline sancionado p/ diagramas embutidos)."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 980, 'height': 700}, device_scale_factor=2)
    page.goto('file:///home/z/my-project/scripts/audit_diagram.html')
    page.wait_for_timeout(400)
    page.screenshot(path='/home/z/my-project/scripts/audit_diagram.png')
    browser.close()
print('OK audit_diagram.png')
