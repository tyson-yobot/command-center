import os
import json
import datetime as dt
import requests
from dotenv import load_dotenv
import schedule
import time

load_dotenv()

FB_PAGES = {
    "yobot":     {"id": "61574791587157", "token": os.getenv("FB_TOKEN_YOBOT")},
    "yobot_inc": {"id": "641943812335201", "token": os.getenv("FB_TOKEN_YOBOT_INC")},
    "dan":       {"id": os.getenv("FB_PAGE_ID_DAN"), "token": os.getenv("FB_TOKEN_DAN")},
}
IG_BUSINESS_ID = os.getenv("IG_BUSINESS_ID_YOBOT")
LINKEDIN = {
    "yobot": {"token": os.getenv("LINKEDIN_TOKEN"),     "urn": os.getenv("LINKEDIN_URN_YOBOT")},
    "dan":   {"token": os.getenv("LINKEDIN_TOKEN_DAN"), "urn": os.getenv("LINKEDIN_URN_DAN")},
}
SLACK = os.getenv("SLACK_WEBHOOK")
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
AIRTABLE_TABLE_NAME = os.getenv("AIRTABLE_TABLE_NAME")

POSTS_FILE = "posts.json"

# ── helpers ───────────────────────────────────────────────────────────────

def _fb_upload(page_id, token, path, caption):
    if not token:
        return
    with open(path, "rb") as img:
        requests.post(
            f"https://graph.facebook.com/{page_id}/photos",
            files={"source": img},
            data={"caption": caption, "access_token": token}
        )

def _ig_upload(img_path, caption):
    token = FB_PAGES["yobot_inc"]["token"]
    if not (token and IG_BUSINESS_ID):
        return
    with open(img_path, "rb") as f_img:
        create = requests.post(
            f"https://graph.facebook.com/v19.0/{IG_BUSINESS_ID}/media",
            files={"source": f_img},
            data={"caption": caption, "access_token": token}
        ).json()
    cid = create.get("id")
    if cid:
        requests.post(
            f"https://graph.facebook.com/v19.0/{IG_BUSINESS_ID}/media_publish",
            data={"creation_id": cid, "access_token": token}
        )

def _li_upload(img_path, caption, token, owner_urn):
    if not token:
        return
    hdr = {"Authorization": token, "X-Restli-Protocol-Version": "2.0.0"}
    with open(img_path, "rb") as f_img:
        reg = requests.post(
            "https://api.linkedin.com/v2/assets?action=registerUpload",
            json={"registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": owner_urn,
                "serviceRelationships": [{"relationshipType":"OWNER","identifier":"urn:li:userGeneratedContent"}]
            }}, headers=hdr).json()
        up_url = reg["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]
        asset  = reg["value"]["asset"]
        requests.put(up_url, data=f_img, headers={"Authorization": token, "Content-Type": "image/png"})
    requests.post(
        "https://api.linkedin.com/v2/ugcPosts", headers=hdr,
        json={
            "author": owner_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": caption},
                    "shareMediaCategory": "IMAGE",
                    "media": [{"status": "READY", "media": asset}]
                }},
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
        })

def _log_to_airtable(caption, platforms, schedule_time):
    if not AIRTABLE_API_KEY or not AIRTABLE_BASE_ID or not AIRTABLE_TABLE_NAME:
        return
    headers = {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "fields": {
            "📅 Scheduled Time": schedule_time,
            "✍️ Caption": caption,
            "📲 Platforms": ", ".join(platforms),
            "✅ Status": "Posted"
        }
    }
    url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"
    requests.post(url, json=data, headers=headers)

def main():
    if not os.path.exists(POSTS_FILE):
        print("No posts.json found.")
        return

    with open(POSTS_FILE) as fp:
        posts = json.load(fp)

    now = dt.datetime.utcnow()
    nxt = next((p for p in posts if p["status"] == "ready" and (not p.get("schedule") or dt.datetime.fromisoformat(p["schedule"]) <= now)), None)
    if not nxt:
        print("No ready posts to publish.")
        return

    cap  = nxt["caption"]
    img  = nxt["image_url"]
    platforms = nxt["platforms"]
    schedule_time = nxt.get("schedule", now.isoformat())
    done = []

    if "facebook" in platforms:
        for name, cfg in FB_PAGES.items():
            if cfg["token"] and cfg["id"]:
                _fb_upload(cfg["id"], cfg["token"], img, cap)
                done.append(f"FB:{name}")

    if "instagram" in platforms:
        _ig_upload(img, cap)
        done.append("IG:yobot")

    if "linkedin" in platforms:
        for who, cfg in LINKEDIN.items():
            if cfg["token"] and cfg["urn"]:
                _li_upload(img, cap, cfg["token"], cfg["urn"])
                done.append(f"LI:{who}")

    nxt["status"] = "posted"
    with open(POSTS_FILE, "w") as fp:
        json.dump(posts, fp, indent=2)

    if SLACK and done:
        requests.post(SLACK, json={"text": f"✅ Posted → {', '.join(done)}"})

    _log_to_airtable(cap, platforms, schedule_time)

    print("✅ Posted →", ", ".join(done))


if __name__ == "__main__":
    schedule.every().day.at("10:00").do(main)
    schedule.every().day.at("15:00").do(main)

    print("📅 Scheduler started: YoBot® social posts at 10:00 AM and 3:00 PM daily.")
    while True:
        schedule.run_pending()
        time.sleep(60)
