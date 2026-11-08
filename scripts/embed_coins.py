#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Numizmatik Görsel Vektör Çıkarıcı & SQLite Veritabanı Yükleyici
----------------------------------------------------------------
OpenAI CLIP (clip-vit-base-patch32) modelini kullanarak './sikkeler_arsiv/images'
klasöründeki sikke ön (avers) ve arka (revers) yüzlerini 512 boyutlu vektörlere
dönüştürür, ortalama kimlik vektörünü hesaplar ve 'coins_archive.db' SQLite
veritabanına ve 'vector_store.json' dosyasına kaydeder.
"""

import os
import sys
import glob
import json
import sqlite3
import logging
from typing import Dict, List, Optional, Tuple, Any

import torch
import numpy as np
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# =============================================================================
# YAPILANDIRMA VE DİZİNLER
# =============================================================================
ARCHIVE_DIR = "./sikkeler_arsiv"
IMAGES_DIR = os.path.join(ARCHIVE_DIR, "images")
METADATA_JSON_PATH = os.path.join(ARCHIVE_DIR, "raw_coins.json")
SQLITE_DB_PATH = os.path.join(ARCHIVE_DIR, "coins_archive.db")
VECTOR_STORE_JSON_PATH = os.path.join(ARCHIVE_DIR, "vector_store.json")

MODEL_NAME = "openai/clip-vit-base-patch32"
BATCH_SIZE = 16

# =============================================================================
# LOGGING (GÜNLÜK) AYARLARI
# =============================================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("CoinEmbedder")


# =============================================================================
# VERİTABANI YÖNETİMİ (SQLITE)
# =============================================================================
def init_sqlite_db(db_path: str):
    """SQLite veritabanını ve tablo şemasını hazırlar."""
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS coins (
            id TEXT PRIMARY KEY,
            metadata TEXT,
            avers_image_path TEXT,
            revers_image_path TEXT,
            embedding_vector TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Hızlı arama için indeksler
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_coins_id ON coins(id)")
    conn.commit()
    conn.close()
    logger.info(f"SQLite veritabanı hazırlandı: {os.path.abspath(db_path)}")


def save_to_sqlite(db_path: str, records: List[Dict[str, Any]]):
    """Toplu kayıtları SQLite veritabanına ekler / günceller (UPSERT)."""
    if not records:
        return
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    sql = """
        INSERT INTO coins (id, metadata, avers_image_path, revers_image_path, embedding_vector)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            metadata=excluded.metadata,
            avers_image_path=excluded.avers_image_path,
            revers_image_path=excluded.revers_image_path,
            embedding_vector=excluded.embedding_vector
    """

    data_tuples = [
        (
            r["id"],
            json.dumps(r.get("metadata", {}), ensure_ascii=False),
            r.get("avers_image_path", ""),
            r.get("revers_image_path", ""),
            json.dumps(r["embedding_vector"])  # 512 elemanlı float listesi
        )
        for r in records
    ]

    cursor.executemany(sql, data_tuples)
    conn.commit()
    conn.close()


# =============================================================================
# GÖRSEL VE METADATA EŞLEŞTİRME
# =============================================================================
def load_metadata_map(json_path: str) -> Dict[str, Dict[str, Any]]:
    """raw_coins.json dosyasını sikke_id veya başlık bazında sözlüğe çevirir."""
    meta_map = {}
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for item in data:
                        coin_id = item.get("sikke_id") or item.get("id")
                        if coin_id:
                            meta_map[coin_id] = item
                logger.info(f"Yüklenen metadata kayıt sayısı: {len(meta_map)}")
        except Exception as e:
            logger.warning(f"Metadata JSON dosyası okunamadı: {e}")
    return meta_map


def group_coin_images(images_dir: str) -> Dict[str, Dict[str, Optional[str]]]:
    """
    Klasördeki görselleri tarar ve sikke ID'lerine göre ön/arka gruplar.
    Desteklenen dosya adları:
      - <sikke_id>_avers.jpg / <sikke_id>_revers.jpg
      - <sikke_id>_on.jpg / <sikke_id>_arka.jpg
      - <sikke_id>_obv.jpg / <sikke_id>_rev.jpg
    """
    pairs: Dict[str, Dict[str, Optional[str]]] = {}
    extensions = ("*.jpg", "*.jpeg", "*.png", "*.webp")
    all_files = []
    for ext in extensions:
        all_files.extend(glob.glob(os.path.join(images_dir, ext)))
        all_files.extend(glob.glob(os.path.join(images_dir, ext.upper())))

    all_files = list(set(all_files))

    for filepath in sorted(all_files):
        filename = os.path.basename(filepath)
        name_no_ext, _ = os.path.splitext(filename)

        # Avers / Ön yüz eşleştirme
        if re.search(r"_(avers|on|obv|obverse)$", name_no_ext, re.IGNORECASE):
            coin_id = re.sub(r"_(avers|on|obv|obverse)$", "", name_no_ext, flags=re.IGNORECASE)
            if coin_id not in pairs:
                pairs[coin_id] = {"avers": None, "revers": None}
            pairs[coin_id]["avers"] = filepath

        # Revers / Arka yüz eşleştirme
        elif re.search(r"_(revers|arka|rev|reverse)$", name_no_ext, re.IGNORECASE):
            coin_id = re.sub(r"_(revers|arka|rev|reverse)$", "", name_no_ext, flags=re.IGNORECASE)
            if coin_id not in pairs:
                pairs[coin_id] = {"avers": None, "revers": None}
            pairs[coin_id]["revers"] = filepath

        # Tekil / kompozit dosya ise hem avers hem revers olarak kaydet
        else:
            coin_id = name_no_ext
            if coin_id not in pairs:
                pairs[coin_id] = {"avers": filepath, "revers": None}

    logger.info(f"Gruplanan toplam sikke adedi: {len(pairs)}")
    return pairs


# =============================================================================
# MODEL VE EMBEDDING ÇIKARMA (CLIP TRANSFORMER)
# =============================================================================
class ClipEmbedder:
    """OpenAI CLIP modelini yükler ve batch halinde görsel vektörleri üretir."""

    def __init__(self, model_name: str = MODEL_NAME):
        self.device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
        logger.info(f"HuggingFace CLIP Modeli yükleniyor: '{model_name}' (Cihaz: {self.device.upper()})...")
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()
        logger.info("Model başarıyla belleğe alındı.")

    def compute_image_embeddings(self, images: List[Image.Image]) -> np.ndarray:
        """PIL görselleri listesini alır ve L2 normalizeli 512 boyutlu numpy vektörleri döndürür."""
        if not images:
            return np.empty((0, 512), dtype=np.float32)

        inputs = self.processor(images=images, return_tensors="pt", padding=True).to(self.device)

        with torch.no_grad():
            image_features = self.model.get_image_features(**inputs)
            # L2 Normalizasyonu (Birim vektör; Cosine Similarity için zorunlu)
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)

        return image_features.cpu().numpy().astype(np.float32)


# =============================================================================
# ANA İŞLEM DÖNGÜSÜ (BATCH PROCESSING)
# =============================================================================
def process_archive(
    images_dir: str = IMAGES_DIR,
    metadata_json_path: str = METADATA_JSON_PATH,
    sqlite_db_path: str = SQLITE_DB_PATH,
    vector_store_json_path: str = VECTOR_STORE_JSON_PATH,
    batch_size: int = BATCH_SIZE
):
    """Görselleri 16'şar 16'şar okuyarak embedding çıkarır ve veritabanına yazar."""
    init_sqlite_db(sqlite_db_path)
    meta_map = load_metadata_map(metadata_json_path)
    coin_pairs = group_coin_images(images_dir)

    if not coin_pairs:
        logger.warning(f"'{images_dir}' klasöründe işlenecek görsel bulunamadı.")
        return

    embedder = ClipEmbedder()
    coin_ids = list(coin_pairs.keys())
    total_coins = len(coin_ids)
    all_processed_records: List[Dict[str, Any]] = []

    logger.info("=" * 70)
    logger.info(f"🚀 TOPLU EMBEDDING HESAPLAMA BAŞLATILDI (Batch Size: {batch_size})")
    logger.info("=" * 70)

    for i in range(0, total_coins, batch_size):
        batch_ids = coin_ids[i:i + batch_size]
        logger.info(f"🔄 İşleniyor: [{i + 1} - {min(i + batch_size, total_coins)} / {total_coins}]")

        # Görselleri yükle
        batch_avers_images = []
        batch_revers_images = []
        valid_batch_coins = []

        for cid in batch_ids:
            paths = coin_pairs[cid]
            av_path = paths["avers"]
            rv_path = paths["revers"]

            av_img = None
            rv_img = None

            if av_path and os.path.exists(av_path):
                try:
                    av_img = Image.open(av_path).convert("RGB")
                except Exception as e:
                    logger.warning(f"Avers görseli açılamadı [{av_path}]: {e}")

            if rv_path and os.path.exists(rv_path):
                try:
                    rv_img = Image.open(rv_path).convert("RGB")
                except Exception as e:
                    logger.warning(f"Revers görseli açılamadı [{rv_path}]: {e}")

            # En az bir görsel mevcut olmalı
            if av_img or rv_img:
                # Biri yoksa diğerini fallback olarak kullan
                if not av_img and rv_img:
                    av_img = rv_img
                if not rv_img and av_img:
                    rv_img = av_img

                batch_avers_images.append(av_img)
                batch_revers_images.append(rv_img)
                valid_batch_coins.append({
                    "id": cid,
                    "avers_path": av_path,
                    "revers_path": rv_path
                })

        if not valid_batch_coins:
            continue

        # CLIP üzerinden vektörleri çıkar (512-dim)
        avers_vecs = embedder.compute_image_embeddings(batch_avers_images)
        revers_vecs = embedder.compute_image_embeddings(batch_revers_images)

        # Ön ve Arka yüz vektörlerinin ortalamasını (Fused Identity Vector) hesapla
        fused_vecs = (avers_vecs + revers_vecs) / 2.0
        # Yeniden birim vektör yap (L2 Norm)
        norms = np.linalg.norm(fused_vecs, axis=1, keepdims=True)
        norms[norms == 0] = 1e-12
        fused_vecs = fused_vecs / norms

        batch_records = []
        for idx, coin_info in enumerate(valid_batch_coins):
            cid = coin_info["id"]
            meta = meta_map.get(cid, {
                "id": cid,
                "baslik": f"Sikke #{cid}",
                "bilgi": "Detaylı metadata mevcut değil"
            })

            record = {
                "id": cid,
                "metadata": meta,
                "avers_image_path": coin_info["avers_path"] or "",
                "revers_image_path": coin_info["revers_path"] or "",
                "embedding_vector": fused_vecs[idx].tolist()  # 512 boyutlu float listesi
            }
            batch_records.append(record)
            all_processed_records.append(record)

        # SQLite'a toplu kaydet
        save_to_sqlite(sqlite_db_path, batch_records)

    # Yedek olarak vector_store.json dosyasına da yaz
    try:
        with open(vector_store_json_path, "w", encoding="utf-8") as f:
            json.dump(all_processed_records, f, ensure_ascii=False, indent=2)
        logger.info(f"Vektör arşivi JSON dosyasına yazıldı: {vector_store_json_path}")
    except Exception as e:
        logger.error(f"JSON kayıt hatası: {e}")

    logger.info("=" * 70)
    logger.info("🎉 EMBEDDING İŞLEMİ TAMAMLANDI!")
    logger.info(f"Toplam Başarıyla Vektörleştirilen Sikke: {len(all_processed_records)}")
    logger.info(f"SQLite DB: {os.path.abspath(sqlite_db_path)}")
    logger.info(f"JSON Store: {os.path.abspath(vector_store_json_path)}")
    logger.info("=" * 70)


# =============================================================================
# BENZERLİK SORGULAMA YARDIMCISI (COSINE SIMILARITY SEARCH)
# =============================================================================
def search_similar_coin(query_image_path: str, sqlite_db_path: str = SQLITE_DB_PATH, top_k: int = 3):
    """
    Verilen yeni bir sikke fotoğrafının vektörünü çıkarıp
    veritabanındaki en yakın 'top_k' adayı kosinüs benzerliği ile bulur.
    """
    if not os.path.exists(query_image_path):
        print(f"Hata: Sorgu görseli bulunamadı -> {query_image_path}")
        return

    embedder = ClipEmbedder()
    img = Image.open(query_image_path).convert("RGB")
    query_vec = embedder.compute_image_embeddings([img])[0]  # (512,)

    conn = sqlite3.connect(sqlite_db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, metadata, embedding_vector FROM coins")
    rows = cursor.fetchall()
    conn.close()

    if not rows:
        print("Veritabanında kayıtlı sikke bulunamadı.")
        return

    results = []
    for cid, meta_str, vec_str in rows:
        target_vec = np.array(json.loads(vec_str), dtype=np.float32)
        # Her iki vektör de birim normalizeli olduğu için Dot Product = Cosine Similarity
        similarity = float(np.dot(query_vec, target_vec))
        results.append((cid, similarity, json.loads(meta_str)))

    # Benzerlik skoruna göre sırala (En yüksekten en düşüğe)
    results.sort(key=lambda x: x[1], reverse=True)

    print(f"\n🔍 '{os.path.basename(query_image_path)}' İçin En Yakın {top_k} Eşleşme:")
    for rank, (cid, score, meta) in enumerate(results[:top_k], 1):
        baslik = meta.get("baslik") or meta.get("title") or cid
        print(f"  {rank}. [ID: {cid}] - Benzerlik: %{score * 100:.1f} | {baslik}")


if __name__ == "__main__":
    # 1. ./sikkeler_arsiv/images klasöründeki tüm sikkeleri vektörleştir ve SQLite'a kaydet
    process_archive()

    # 2. Örnek Arama Yapmak İsterseniz (Aşağıdaki yorum satırını kaldırabilirsiniz):
    # search_similar_coin("./sikkeler_arsiv/images/ornek_sorgu.jpg")
