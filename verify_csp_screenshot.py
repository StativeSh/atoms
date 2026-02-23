import subprocess
import time
import sys
import os
from playwright.sync_api import sync_playwright

# Create verification directory
os.makedirs("/home/jules/verification", exist_ok=True)

# Start the server
server = subprocess.Popen([sys.executable, "-m", "http.server", "8000"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("Server started on port 8000")
time.sleep(2)  # Wait for server to start

try:
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch()
        page = browser.new_page()

        # Capture console messages
        console_messages = []
        def handle_console(msg):
            if msg.type in ["error", "warning"]:
                console_messages.append(f"{msg.type}: {msg.text}")
                print(f"Console {msg.type}: {msg.text}")

        page.on("console", handle_console)

        print("Navigating to http://localhost:8000")
        page.goto("http://localhost:8000")
        page.wait_for_timeout(3000) # Wait for 3D scene to init

        # Check for CSP violations
        csp_violation = False
        for msg in console_messages:
            if "Content Security Policy" in msg or "refused" in msg:
                print(f"CSP Violation detected: {msg}")
                csp_violation = True

        if csp_violation:
            print("FAILED: CSP violations found.")
            sys.exit(1)

        # Check molecule controls hidden
        molecule_controls = page.locator("#molecule-controls")
        display = molecule_controls.evaluate("el => getComputedStyle(el).display")
        if display != "none":
            print(f"FAILED: #molecule-controls is visible (display: {display}).")
            sys.exit(1)

        # Screenshot
        screenshot_path = "/home/jules/verification/csp_verification.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

except Exception as e:
    print(f"An error occurred: {e}")
    sys.exit(1)
finally:
    server.terminate()
