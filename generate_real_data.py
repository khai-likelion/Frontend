import json
import os
import glob
import re
import csv

# --- Configuration ---
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# agent-sim/data/raw/stores.csv 경로 설정 (상위 폴더로 이동 후 접근)
STORES_CSV_PATH = os.path.join(os.path.dirname(CURRENT_DIR), 'agent-sim', 'data', 'raw', 'stores.csv')
REPORT_DIR = os.path.join(os.path.dirname(CURRENT_DIR), 'batch_reports_random_10')
OUTPUT_FILE = os.path.join(CURRENT_DIR, 'src', 'data', 'real_data.json')

# --- Helper: Load Store Locations from CSV ---
def load_store_locations():
    locations = {}
    if not os.path.exists(STORES_CSV_PATH):
        print(f"Warning: stores.csv not found at {STORES_CSV_PATH}")
        return locations
    
    try:
        with open(STORES_CSV_PATH, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                store_name = row.get('장소명')
                if store_name:
                    # Normalize: remove spaces for better matching
                    normalized_name = store_name.replace(' ', '')
                    locations[normalized_name] = {
                        'address': row.get('주소'),
                        'lat': float(row.get('y')) if row.get('y') else None,
                        'lng': float(row.get('x')) if row.get('x') else None
                    }
    except Exception as e:
        print(f"Error reading stores.csv: {e}")
    return locations

store_locations = load_store_locations()

# Ensure output directory exists
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

def extract_grade(report_text):
    match = re.search(r'종합 등급\*\*: \*\*([A-S\+]+)\*\*', report_text)
    if not match:
        match = re.search(r'종합 등급: \*\*([A-S\+]+)\*\*', report_text)
    return match.group(1) if match else "A"

def extract_solutions(report_text):
    solutions = []
    # Find Categories and their solutions
    categories = re.split(r'### 🔹 전략 카테고리 \d+: \*\*\[(.+?)\]\*\*', report_text)
    if len(categories) > 1:
        for i in range(1, len(categories), 2):
            cat_name = categories[i]
            content = categories[i+1] if i+1 < len(categories) else ""
            # Find individual solutions in this category
            sol_matches = re.findall(r'- \*\*솔루션 [A-C]: (.+?)\*\*(?:\n  - (.+?))?', content)
            for title, desc in sol_matches:
                solutions.append({
                    "category": cat_name,
                    "title": title.strip(),
                    "desc": desc.strip() if desc else "데이터 기반 맞춤형 전략"
                })
    return solutions[:4] # Return top 4

stores_data = []
total_stores = 0
total_sentiment = 0
total_agents = 0
total_revenue = 0
revenue_count = 0

for filename in glob.glob(os.path.join(REPORT_DIR, "*_result.json")):
    with open(filename, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
            store_name = data.get('store_name', 'Unknown')
            input_data = data.get('input_data', {})
            review_metrics = input_data.get('review_metrics', {})
            overall_sentiment = review_metrics.get('overall_sentiment', {})
            sentiment_score = overall_sentiment.get('score', 0)
            
            # Feature scores for Radar Chart
            feature_scores = review_metrics.get('feature_scores', {})
            radar_data = []
            features_map = {
                'taste': '맛', 'service': '서비스', 'cleanliness': '청결도',
                'price_value': '가성비', 'atmosphere': '분위기', 'turnover': '접근성'
            }
            
            for key, label in features_map.items():
                feature = feature_scores.get(key, {})
                score = feature.get('score', 0) * 100
                radar_data.append({
                    "subject": label,
                    "A": int(score),
                    "fullMark": 100,
                    "reason": feature.get('label', '')
                })

            top_keywords = input_data.get('top_keywords', [])
            report_text = data.get('output_report', '')
            
            # Extract Grade and Solutions
            grade = extract_grade(report_text)
            solutions = extract_solutions(report_text)
            
            # Revenue
            revenue_text = input_data.get('revenue_analysis', '')
            revenue_match = re.search(r'객단가는\s*([\d,]+)원', revenue_text)
            revenue_value = int(revenue_match.group(1).replace(',', '')) if revenue_match else 0
            
            # Derived Rank (Mocked based on sentiment for variety)
            rank_pc = 5 + int((1 - sentiment_score) * 20)
            rank_pc = max(1, min(25, rank_pc))

            # Get location data
            # Normalize store name for lookup
            normalized_store_name = store_name.replace(' ', '')
            loc_data = store_locations.get(normalized_store_name)
            
            stores_data.append({
                "id": os.path.basename(filename).split('_')[0],
                "name": store_name,
                "address": loc_data['address'] if loc_data and loc_data['address'] else '서울 마포구 망원동 (주소 정보 미확인)',
                "lat": loc_data['lat'] if loc_data and loc_data['lat'] is not None else 37.556,  # Default fallback
                "lng": loc_data['lng'] if loc_data and loc_data['lng'] is not None else 126.906, # Default fallback
                "sentiment": sentiment_score,
                "revenue": revenue_value,
                "agents": 380,
                "radarData": radar_data,
                "keywords": top_keywords,
                "grade": grade,
                "rankPercent": rank_pc,
                "solutions": solutions,
                "description": input_data.get('rag_context', '')[:120] + "..."
            })

            total_stores += 1
            total_sentiment += sentiment_score
            total_agents += 380
            if revenue_value > 0:
                total_revenue += revenue_value
                revenue_count += 1
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")

avg_sentiment = total_sentiment / total_stores if total_stores > 0 else 0
avg_revenue = total_revenue / revenue_count if revenue_count > 0 else 0

final_data = {
    "stats": {
        "storeCount": total_stores,
        "avgSentiment": round(avg_sentiment, 2),
        "totalAgents": f"{total_agents:,}+",
        "avgRevenue": f"₩{int(avg_revenue):,}"
    },
    "stores": stores_data
}

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    json.dump(final_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {OUTPUT_FILE} with {total_stores} stores and detailed report data.")
