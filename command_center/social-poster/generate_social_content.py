# === generate_social_content.py ===
import os
import json
import datetime as dt
from io import BytesIO

from dotenv import load_dotenv
load_dotenv()  # ⬅ ensures .env / Render vars are loaded before use

import requests
from PIL import Image
from pyairtable import Table
from openai import OpenAI

from table_map import BASE_PROMPTS, TABLE_PROMPTS

# ── env vars ──────────────────────────────────────────────────────────────
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
OPENAI_API_KEY   = os.getenv("OPENAI_API_KEY")
LOGO_PATH        = os.getenv("LOGO_PATH", "yobot_logo.png")  # local fallback
POSTS_FILE       = "posts.json"

client = OpenAI(api_key=OPENAI_API_KEY)

def _get_next_prompt():
    """Return the first Airtable record with Post Status == 'ready'."""
    tbl = Table(AIRTABLE_API_KEY, BASE_PROMPTS, TABLE_PROMPTS)
    records = tbl.all(formula="{Post Status}='ready'", max_records=1)
    return (records[0], tbl) if records else (None, tbl)


def _mk_caption(rec):
    fld  = rec["fields"]
    desc = fld.get("Prompt Description", "")
    brand = fld.get("Brand Palette", "")
    cats  = fld.get("Category", "")
    chans = ", ".join(fld.get("Channels", []))

    sys = (
        "You are an engaging social‑media copywriter who writes clear, concise captions with 1‑2 appropriate emojis."
    )
    user = (
        f"Create a captivating caption for {chans}.\n"
        f"Description: {desc}.\n"
        f"Category: {cats}. Brand palette: {brand}."
    )

    rsp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "system", "content": sys}, {"role": "user", "content": user}],
        temperature=0.8,
        max_tokens=120,
    )
    return rsp.choices[0].message.content.strip()


def _mk_image(prompt_txt):
    rsp = client.images.generate(prompt=prompt_txt, n=1, size="1024x1024")
    url = rsp.data[0].url
    img = Image.open(BytesIO(requests.get(url).content)).convert("RGBA")
    return img


def _overlay_logo(img):
    if not os.path.exists(LOGO_PATH):
        return img.convert("RGB")
    logo = Image.open(LOGO_PATH).convert("RGBA")
    scale = 0.18
    logo = logo.resize((int(img.width * scale), int(img.height * scale)))
    pos = (img.width - logo.width - 24, img.height - logo.height - 24)
    img.alpha_composite(logo, pos)
    return img.convert("RGB")


def _save(img):
    fname = f"post_{dt.datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}.jpg"
    img.save(fname, "JPEG", quality=92)
    return fname


def _queue_post(caption, img_path, channels, schedule):
    data = []
    if os.path.exists(POSTS_FILE):
        with open(POSTS_FILE) as fp:
            data = json.load(fp)

    data.append({
        "caption":   caption,
        "image_url": img_path,
        "platforms": [c.lower() for c in channels],
        "schedule":  schedule,  # ISO‑8601 UTC or None
        "status":    "ready",
        "created":   dt.datetime.utcnow().isoformat() + "Z",
    })

    with open(POSTS_FILE, "w") as fp:
        json.dump(data, fp, indent=2)


def main():
    rec, tbl = _get_next_prompt()
    if not rec:
        print("No ready prompts found.")
        return

    fld      = rec["fields"]
    caption  = _mk_caption(rec)
    base_img = _mk_image(fld.get("Image Prompt", ""))
    final    = _overlay_logo(base_img)
    img_path = _save(final)

    _queue_post(caption, img_path, fld.get("Channels", []), fld.get("Schedule"))
    tbl.update(rec["id"], {"Post Status": "queued"})

    print(f"✅ Queued → {img_path}")


if __name__ == "__main__":
    main()
