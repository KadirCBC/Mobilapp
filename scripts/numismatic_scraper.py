#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Numizmatik Sikke Otomasyon Tarayıcısı (Numismatic Coin Web Scraper)
------------------------------------------------------------------
Hedef numizmatik web sitesindeki kategorileri sayfa sayfa (pagination)
gezerek her sikkenin detayını, nümizmatik özelliklerini ve yüksek
çözünürlüklü ön/arka (avers/revers) görsellerini indirir.
"""

import os
import re
import sys
import json
import time
import random
import logging
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# =============================================================================
# YAPILANDIRMA VE GİRDİ DEĞİŞKENLERİ
# =============================================================================
HEDEF_KATEGORI_URL = "https://ornek-sikke-sitesi.com/category/roman-imperial"
INDIRME_KLASORU = "./sikkeler_arsiv"
GORSEL_KLASORU = os.path.join(INDIRME_KLASORU, "images")
CIKTI_JSON_DOSYASI = os.path.join(INDIRME_KLASORU, "raw_coins.json")

# Hız sınırlaması ve bekleme aralıkları (saniye)
MIN_BEKLEME = 1.2
MAX_BEKLEME = 2.5

# =============================================================================
# LOGGING (GÜNLÜK) AYARLARI
# =============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger("NumismaticScraper")


# =============================================================================
# HTTP OTURUMU VE GÜVENLİK AYARLARI
# =============================================================================
def create_resilient_session() -> requests.Session:
    """
    Cloudflare ve sunucu engellemelerine karşı dayanıklı,
    bağlantı kopmalarında otomatik yeniden deneyen (retry) oturum oluşturur.
    """
    session = requests.Session()

    retry_strategy = Retry(
        total=4,
        backoff_factor=1.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["HEAD", "GET", "OPTIONS"]
    )
    adapter = HTTPAdapter(max_retries=retry_strategy)
    session.mount("https://", adapter)
    session.mount("http://", adapter)

    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Upgrade-Insecure-Requests": "1"
    })
    return session


def random_sleep(min_sec: float = MIN_BEKLEME, max_sec: float = MAX_BEKLEME):
    """Hedef sunucunun IP engeli atmaması için rastgele süre bekler."""
    duration = random.uniform(min_sec, max_sec)
    time.sleep(duration)


# =============================================================================
# NÜMİZMATİK VERİ AYRIŞTIRICILARI (REGEX VE PARSERS)
# =============================================================================
NOMINAL_REGEX = re.compile(
    r"\b(Denarius|Tetradrachm|Tetradrahmi|Drachm|Drahmi|Didrachm|Obol|Diobol|Triobol|"
    r"Hemidrachm|Sestertius|Dupondius|As\b|Assarion|Follis|Antoninianus|Siliqua|"
    r"Miliarense|Aureus|Solidus|Stater|Trite|Hekte|Unit|Chalkous)\b",
    re.IGNORECASE
)

REFERANS_REGEX = re.compile(
    r"\b(RIC\s*(?:[I|V|X]+|\d+)?\s*(?:(?:p\.|no\.)?\s*\d+[a-z]?)?|"
    r"RPC\s*(?:[I|V|X]+|\d+)?\s*(?:no\.)?\s*\d+|"
    r"BMCRE\s*\d+|"
    r"RSC\s*\d+|"
    r"SNG\s*(?:ANS|Cop|Delepierre|BM)?\s*\d+|"
    r"Sear\s*(?:[A-Z]+)?\s*\d+|"
    r"HGC\s*\d+,\s*\d+)\b",
    re.IGNORECASE
)

MINT_REGEX = re.compile(
    r"\b(Rome|Roma|Alexandria|İskenderiye|Antioch|Antakya|Lugdunum|Lyon|Sardis|Sardes|"
    r"Ephesos|Ephesus|Pergamon|Bergama|Constantinople|Konstantinopolis|Athens|Atina|"
    r"Corinth|Korint|Neapolis|Napoli|Tarentum|Taras|Syracuse|Siraküza|Massalia|Nicomedia)\b",
    re.IGNORECASE
)

RULER_REGEX = re.compile(
    r"\b(Augustus|Tiberius|Caligula|Claudius|Nero|Galba|Otho|Vitellius|Vespasian|"
    r"Titus|Domitian|Nerva|Trajan|Hadrian|Antoninus Pius|Marcus Aurelius|Lucius Verus|"
    r"Commodus|Septimius Severus|Caracalla|Geta|Macrinus|Elagabalus|Severus Alexander|"
    r"Maximinus Thrax|Gordian III|Philip I|Trajan Decius|Trebonianus Gallus|Valerian|"
    r"Gallienus|Claudius Gothicus|Aurelian|Probus|Diocletian|Maximian|Constantius|"
    r"Constantine(?: the Great)?|Lucilla|Faustina(?: I| II)?|Alexander the Great)\b",
    re.IGNORECASE
)


def extract_coin_details(soup: BeautifulSoup, page_url: str) -> Dict[str, Optional[str]]:
    """Detay sayfasındaki HTML bloklarını tarayarak sikke verilerini çıkarır."""
    text_content = soup.get_text(separator=" ", strip=True)

    # 1. Başlık
    title = ""
    for sel in ["h1.product-title", "h1.item-title", "h1.title", "h1", "title"]:
        el = soup.select_one(sel)
        if el and el.get_text(strip=True):
            title = el.get_text(strip=True)
            break

    # 2. Hükümdar / Otorite
    ruler = None
    ruler_match = RULER_REGEX.search(title + " " + text_content)
    if ruler_match:
        ruler = ruler_match.group(1).title()

    # 3. Nominal Birim
    nominal = None
    nom_match = NOMINAL_REGEX.search(title + " " + text_content)
    if nom_match:
        nominal = nom_match.group(1).capitalize()

    # 4. Darphane Şehri
    mint = None
    mint_match = MINT_REGEX.search(text_content)
    if mint_match:
        mint = mint_match.group(1).title()

    # 5. Katalog / Referans Numarası
    ref_match = REFERANS_REGEX.search(text_content)
    katalog_no = ref_match.group(0).strip() if ref_match else None

    # 6. Dönem / Tarih Aralığı
    donem = None
    year_match = re.search(
        r"(?:(?:AD|BC|BCE|M\.Ö\.|M\.S\.)\s*\d{1,4}[-–]\d{1,4}|\d{1,4}[-–]\d{1,4}\s*(?:AD|BC|BCE))",
        text_content,
        re.IGNORECASE
    )
    if year_match:
        donem = year_match.group(0).strip()

    # 7. Avers & Revers Görsel Bağlantıları
    avers_url, revers_url = extract_images(soup, page_url)

    return {
        "baslik": title or "Bilinmeyen Sikke",
        "hukumdar": ruler or "Bilinmeyen Hükümdar / Şehir Devleti",
        "donem": donem,
        "nominal_birim": nominal,
        "darphane": mint,
        "katalog_referans": katalog_no,
        "avers_gorsel_url": avers_url,
        "revers_gorsel_url": revers_url,
        "kaynak_url": page_url
    }


def extract_images(soup: BeautifulSoup, base_url: str) -> Tuple[Optional[str], Optional[str]]:
    """Detay sayfasındaki ana sikke görsellerini bulur (Avers ve Revers)."""
    candidates = []

    # 1. Meta og:image kontrolü
    for meta in soup.find_all("meta", property=re.compile(r"og:image", re.I)):
        src = meta.get("content")
        if src and not any(skip in src.lower() for skip in ["logo", "icon", "banner", "thumb"]):
            candidates.append(urljoin(base_url, src))

    # 2. Özel resim etiketleri veya galeri seçicileri
    selectors = [
        "img.main-image", "img.product-image", "img#imgMain",
        ".coin-images img", ".gallery img", ".product-gallery img",
        "a.lightbox img", "div.images img"
    ]
    for sel in selectors:
        for img in soup.select(sel):
            src = img.get("src") or img.get("data-src") or img.get("data-large")
            if src and not any(skip in src.lower() for skip in ["logo", "icon", "placeholder", "badge"]):
                full_url = urljoin(base_url, src)
                if full_url not in candidates:
                    candidates.append(full_url)

    # 3. Sayfadaki diğer tüm img etiketleri
    if len(candidates) < 2:
        for img in soup.find_all("img"):
            src = img.get("src") or img.get("data-src")
            if src and any(ext in src.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                if not any(skip in src.lower() for skip in ["logo", "icon", "spinner", "loader"]):
                    full_url = urljoin(base_url, src)
                    if full_url not in candidates:
                        candidates.append(full_url)

    avers = candidates[0] if len(candidates) > 0 else None
    revers = candidates[1] if len(candidates) > 1 else None
    return avers, revers


def download_image(session: requests.Session, img_url: str, save_path: str) -> bool:
    """Görseli akış (stream) modunda indirerek diske yazar."""
    if not img_url:
        return False
    try:
        resp = session.get(img_url, stream=True, timeout=15)
        if resp.status_code == 200:
            with open(save_path, "wb") as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            return True
        else:
            logger.warning(f"Görsel indirilemedi (HTTP {resp.status_code}): {img_url}")
            return False
    except Exception as e:
        logger.error(f"Görsel indirme hatası [{img_url}]: {e}")
        return False


# =============================================================================
# SAYFALAMA (PAGINATION) VE LİSTE TARAMA
# =============================================================================
def get_detail_links(soup: BeautifulSoup, current_url: str) -> List[str]:
    """Liste sayfasındaki tüm sikke detay sayfalarının bağlantılarını toplar."""
    detail_links = []
    # Yaygın ürün/detay link kalıpları
    patterns = [
        r"/product/", r"/item/", r"/coin/", r"/lot/", r"/detail/",
        r"/catalog/", r"/id/\d+", r"\?id=\d+"
    ]
    combined_pattern = re.compile("|".join(patterns), re.IGNORECASE)

    for a in soup.find_all("a", href=True):
        href = a["href"]
        if combined_pattern.search(href):
            full_url = urljoin(current_url, href)
            # Sayfalama veya filtreleme linklerini hariç tut
            if not any(skip in full_url.lower() for skip in ["page=", "sort=", "filter=", "category="]):
                if full_url not in detail_links:
                    detail_links.append(full_url)

    return detail_links


def find_next_page_url(soup: BeautifulSoup, current_url: str) -> Optional[str]:
    """Bir sonraki sayfanın ('Next' / 'Sonraki') URL adresini tespit eder."""
    # 1. Standart rel="next"
    next_tag = soup.find("a", rel=lambda r: r and "next" in r.lower())
    if next_tag and next_tag.get("href"):
        return urljoin(current_url, next_tag["href"])

    # 2. Metin içeriğinde 'Next', 'Sonraki', '>' veya '»' olan butonlar
    for a in soup.find_all("a", href=True):
        txt = a.get_text(strip=True).lower()
        aria = (a.get("aria-label") or "").lower()
        cls = " ".join(a.get("class", [])).lower()

        if txt in ["next", "sonraki", ">", "»", "ilerle"] or "next" in aria or "next" in cls:
            return urljoin(current_url, a["href"])

    # 3. Sayfa parametresi kontrolü (?page=N veya &p=N)
    parsed = urlparse(current_url)
    page_match = re.search(r"[?&](?:page|p)=(\d+)", current_url)
    if page_match:
        current_page_num = int(page_match.group(1))
        next_page_num = current_page_num + 1
        # Sayfada bir sonraki sayfa numarasının linki var mı?
        for a in soup.find_all("a", href=True):
            if f"page={next_page_num}" in a["href"] or f"p={next_page_num}" in a["href"]:
                return urljoin(current_url, a["href"])

    return None


# =============================================================================
# ANA ÇALIŞTIRICI FONKSİYON (MAIN CRAWLER)
# =============================================================================
def run_scraper(target_category_url: str, output_folder: str, max_pages: int = 50):
    """Numizmatik scraper ana döngüsü."""
    os.makedirs(output_folder, exist_ok=True)
    images_dir = os.path.join(output_folder, "images")
    os.makedirs(images_dir, exist_ok=True)
    json_path = os.path.join(output_folder, "raw_coins.json")

    session = create_resilient_session()
    current_url = target_category_url
    page_number = 1
    total_coins_scraped = 0
    all_coins_data = []

    logger.info("=" * 70)
    logger.info("🚀 NÜMİZMATİK VERİ TARAYICI BAŞLATILDI")
    logger.info(f"Hedef URL: {target_category_url}")
    logger.info(f"Arşiv Dizini: {output_folder}")
    logger.info("=" * 70)

    try:
        while current_url and page_number <= max_pages:
            logger.info(f"\n📂 [Sayfa {page_number}] Taranıyor: {current_url}")
            try:
                resp = session.get(current_url, timeout=20)
                if resp.status_code != 200:
                    logger.error(f"Sayfa açılamadı (HTTP {resp.status_code}): {current_url}")
                    break
            except Exception as e:
                logger.error(f"Bağlantı hatası [{current_url}]: {e}")
                break

            soup = BeautifulSoup(resp.content, "html.parser")
            coin_links = get_detail_links(soup, current_url)
            logger.info(f"   Bulunan sikke adedi: {len(coin_links)}")

            if not coin_links:
                logger.warning("   Bu sayfada sikke bağlantısı bulunamadı.")

            for idx, coin_url in enumerate(coin_links, 1):
                coin_id = f"coin_p{page_number}_{idx}_{int(time.time())}"
                logger.info(f"   [{idx}/{len(coin_links)}] Detay Çekiliyor: {coin_url}")

                random_sleep()

                try:
                    detail_resp = session.get(coin_url, timeout=20)
                    if detail_resp.status_code != 200:
                        logger.warning(f"   Detay sayfası hatası (HTTP {detail_resp.status_code})")
                        continue
                    detail_soup = BeautifulSoup(detail_resp.content, "html.parser")
                    coin_data = extract_coin_details(detail_soup, coin_url)
                    coin_data["sikke_id"] = coin_id

                    # Görselleri İndir
                    avers_path = os.path.join(images_dir, f"{coin_id}_avers.jpg")
                    revers_path = os.path.join(images_dir, f"{coin_id}_revers.jpg")

                    if coin_data["avers_gorsel_url"]:
                        if download_image(session, coin_data["avers_gorsel_url"], avers_path):
                            coin_data["yerel_avers_dosyasi"] = avers_path

                    if coin_data["revers_gorsel_url"]:
                        if download_image(session, coin_data["revers_gorsel_url"], revers_path):
                            coin_data["yerel_revers_dosyasi"] = revers_path

                    all_coins_data.append(coin_data)
                    total_coins_scraped += 1

                except Exception as ex:
                    logger.error(f"   Sikke işlenirken hata oluştu [{coin_url}]: {ex}")

            # Bir sonraki sayfayı ara
            next_url = find_next_page_url(soup, current_url)
            if next_url and next_url != current_url:
                current_url = next_url
                page_number += 1
                random_sleep(2.0, 3.5)
            else:
                logger.info("🏁 Son sayfaya ulaşıldı veya sonraki sayfa bağlantısı bulunamadı.")
                break

    except KeyboardInterrupt:
        logger.warning("\n⚠️ Kullanıcı tarafından durduruldu! Mevcut veriler kaydediliyor...")
    finally:
        # JSON Dosyasına Yaz (UTF-8 garantili)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(all_coins_data, f, ensure_ascii=False, indent=2)

        logger.info("\n" + "=" * 70)
        logger.info(f"🎉 İŞLEM TAMAMLANDI!")
        logger.info(f"Toplam Çekilen Sikke: {total_coins_scraped}")
        logger.info(f"JSON Çıktısı: {os.path.abspath(json_path)}")
        logger.info(f"Görseller Dizini: {os.path.abspath(images_dir)}")
        logger.info("=" * 70)


if __name__ == "__main__":
    run_scraper(
        target_category_url=HEDEF_KATEGORI_URL,
        output_folder=INDIRME_KLASORU,
        max_pages=50  # İstenilen sayfa limiti
    )
