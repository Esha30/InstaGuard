import instaloader
from playwright.sync_api import sync_playwright
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import subprocess
import requests
import time
import os
from requests_html import HTMLSession
from instaloader.exceptions import ProfileNotExistsException, BadResponseException
from dotenv import load_dotenv

load_dotenv()

def count_numbers_ratio(text):
    numbers = sum(char.isdigit() for char in text)
    return round(numbers / len(text), 2) if len(text) > 0 else 0

def login_instaloader():
    accounts = [
        os.getenv("IG_USERNAME1"),
        os.getenv("IG_USERNAME2"),
        os.getenv("IG_USERNAME3"),
        os.getenv("IG_USERNAME4"),
    ]

    # Load from correct session directory
    session_dir = os.path.join(os.path.dirname(__file__), "sessions")
    os.makedirs(session_dir, exist_ok=True)

    for username in accounts:
        if not username:
            continue

        # Correct: Look for session-*username* instead of *username*.session
        session_path = os.path.join(session_dir, f"session-{username}")

        L = instaloader.Instaloader()

        try:
            if os.path.exists(session_path):
                print(f"[Session] Loading saved session for {username}")
                L.load_session_from_file(username, session_path)
                instaloader.Profile.from_username(L.context, username)
                print(f"[Login Success] Using session for {username}")
                return L
            else:
                print(f"[Session Missing] No session file for {username}")
        except Exception as e:
            print(f"[Login Failed] {username}: {e}")

    print("[Login Error] All session attempts failed.")
    return None


def get_instaloader_data(username):
    L = login_instaloader()
    if not L:
        return None
    try:
        profile = instaloader.Profile.from_username(L.context, username)
        fullname = profile.full_name or ""
        fullname_words = len(fullname.strip().split())
        name_equals_username = int(fullname.strip().lower() == username.lower())
        nums_len_username = count_numbers_ratio(username)
        nums_len_fullname = count_numbers_ratio(fullname)
        return {
            "followers": profile.followers,
            "followees": profile.followees,
            "posts": profile.mediacount,
            "is_business": int(profile.is_business_account),
            "bio_length": len(profile.biography or ""),
            "external_url": int(bool(profile.external_url)),
            "has_profile_pic": int("blank" not in profile.profile_pic_url),
            "fullname_words": fullname_words,
            "name==username": name_equals_username,
            "nums/length_username": nums_len_username,
            "nums/length_fullname": nums_len_fullname
        }
    except Exception as e:
        if "does not exist" in str(e):
            print(f"[User Not Found] The username '{username}' does not exist.")
            return "USER_NOT_FOUND"
        print(f"[Instaloader Error] {e}")
        return None

# ----------- Fallback Methods -----------

def get_playwright_fallback(username):
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(f"https://www.instagram.com/{username}/", timeout=60000)
            page.wait_for_selector("img", timeout=10000)
            bio_text = ""
            try:
                bio_text = page.inner_text("section [role='presentation']")
            except:
                pass
            browser.close()
            return {"bio_length": len(bio_text)}
    except Exception as e:
        print(f"[Playwright Error] {e}")
        return {"bio_length": 0}

def get_html_scraper_fallback(username):
    try:
        headers = {"User-Agent": "Mozilla/5.0"}
        url = f"https://www.instagram.com/{username}/"
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print("[HTML Fallback] Failed to access profile.")
            return {"bio_length": 0}
        soup = BeautifulSoup(response.text, "html.parser")
        desc = soup.find("meta", attrs={"name": "description"})
        bio_length = 0
        if desc:
            text = desc.get("content", "")
            bio_length = len(text.split("-")[0].strip())
        return {"bio_length": bio_length}
    except Exception as e:
        print(f"[HTML Scraper Error] {e}")
        return {"bio_length": 0}

def get_selenium_fallback(username):
    try:
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        driver.get(f"https://www.instagram.com/{username}/")
        time.sleep(5)
        desc = driver.find_element("xpath", "//meta[@name='description']")
        content = desc.get_attribute("content")
        bio_length = len(content.split("-")[0].strip()) if content else 0
        driver.quit()
        return {"bio_length": bio_length}
    except Exception as e:
        print(f"[Selenium Fallback Error] {e}")
        return {"bio_length": 0}

def get_requests_html_fallback(username):
    try:
        session = HTMLSession()
        url = f"https://www.instagram.com/{username}/"
        headers = {"User-Agent": "Mozilla/5.0"}
        response = session.get(url, headers=headers)
        response.html.render(timeout=20)
        desc = response.html.find("meta[name='description']", first=True)
        bio_length = 0
        if desc:
            content = desc.attrs.get("content", "")
            bio_length = len(content.split("-")[0].strip())
        return {"bio_length": bio_length}
    except Exception as e:
        print(f"[Requests-HTML Fallback Error] {e}")
        return {"bio_length": 0}

def get_curl_fallback(username):
    try:
        url = f"https://www.instagram.com/{username}/"
        cmd = ["curl", "-sL", url, "-A", "Mozilla/5.0"]
        result = subprocess.run(cmd, stdout=subprocess.PIPE)
        soup = BeautifulSoup(result.stdout.decode(), "html.parser")
        desc = soup.find("meta", attrs={"name": "description"})
        bio_length = len(desc.get("content", "").split("-")[0].strip()) if desc else 0
        return {"bio_length": bio_length}
    except Exception as e:
        print(f"[Curl Fallback Error] {e}")
        return {"bio_length": 0}

# ----------- Final Feature Extraction -----------

def extract_features(username):
    print(f"\n[Start] Extracting features for: {username}")
    data = get_instaloader_data(username)

    if data == "USER_NOT_FOUND":
        print("[Error] Username does not exist.")
        return {"error": "Username does not exist.", "status": "failed"}

    if data:
        print("[Instaloader] Success:", data)
        return data

    print("[Fallback] Instaloader failed. Trying alternate methods...")

    fallback_methods = [
        get_playwright_fallback,
        get_html_scraper_fallback,
        get_selenium_fallback,
        get_requests_html_fallback,
        get_curl_fallback,
    ]

    fallback_bio = 0
    for method in fallback_methods:
        print(f"[Fallback] Trying {method.__name__}...")
        result = method(username)
        print(f"[{method.__name__}] Result:", result)
        if result.get("bio_length", 0) > 0:
            fallback_bio = result["bio_length"]
            break

    final_data = {
        "followers": 0,
        "followees": 0,
        "posts": 0,
        "is_business": 0,
        "bio_length": fallback_bio,
        "external_url": 0,
        "has_profile_pic": 0,
        "fullname_words": 0,
        "name==username": 0,
        "nums/length_username": count_numbers_ratio(username),
        "nums/length_fullname": 0
    }

    print("[Final Fallback Data]", final_data)

    non_existence_check_keys = [
        "followers", "followees", "posts", "is_business", "bio_length",
        "external_url", "has_profile_pic", "fullname_words", "name==username"
    ]
    if all(final_data.get(key, 0) == 0 for key in non_existence_check_keys):
        print("[Error] Username does not exist (based on fallback zero-data).")
        return {"error": "Username does not exist.", "status": "failed"}

    return final_data
