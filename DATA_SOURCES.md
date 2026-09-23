# Disha Sarathi — Data Sources and Methodology Documentation

## 1. NSQF Qualification Packs (QP) & Trades
All 40 National Skills Qualifications Framework (NSQF) trades included in `src/data/nsqf_trades.json` are mapped to official Sector Skill Councils (SSCs) under the National Skill Development Corporation (NSDC) and National Council for Vocational Education and Training (NCVET):
- **National Qualifications Register (NQR)**: https://www.nqr.gov.in
- **Skill India Digital Hub**: https://www.skillindiadigital.gov.in
- **Sector Skill Councils**:
  - Apparel Made-Ups & Home Furnishing Sector Skill Council (AMHSSC)
  - Beauty & Wellness Sector Skill Council (B&WSSC)
  - Electronics Sector Skills Council of India (ESSCI)
  - Construction Skill Development Council of India (CSDCI)
  - Agriculture Skill Council of India (ASCI)
  - Automotive Skills Development Council (ASDC)
  - IT-ITeS Sector Skills Council NASSCOM
  - Retailers Association's Skill Council of India (RASCI)
  - Healthcare Sector Skill Council (HSSC)
  - Tourism and Hospitality Skill Council (THSC)

## 2. District Centroids & Geographic Resolution
- **Census of India & Local Government Directory (LGD)**: Ministry of Panchayati Raj, Government of India (https://lgdirectory.gov.in).
- Centroid coordinates validated inside the geographic boundaries of India.
- Haversine resolution operates locally client-side with a 220 km sanity gate. Full precision coordinates stay transient in RAM and are stored rounded to 2 decimal places (~1.1 km) to protect beneficiary privacy.

## 3. Schemes & Financial Linkages
All scheme texts in `src/data/schemes.json` are human-authored from official guidelines:
- **PM-SVANidhi**: Ministry of Housing and Urban Affairs (https://pmsvanidhi.mohua.gov.in)
- **NSFDC**: National Scheduled Castes Finance and Development Corporation, Ministry of Social Justice and Empowerment (https://nsfdc.nic.in)
- **Stand-Up India**: Small Industries Development Bank of India (SIDBI) / DFS (https://www.standupmitra.in)

## 4. Synthetic Demo Data Disclosure
In strict adherence to PS 26097 guidelines:
- `seed_cohort.json` (72 records) is deterministically generated synthetic data for offline evaluator testing. Every row contains `is_demo_seed: true`.
- `training_centers.json` combines verified PMKK/NSTI training centers with representative district hubs badged `is_demo_seed: true`.
- `district_market.json` sector capacities are synthetic baseline distributions badged `source: "synthetic_seed_v1"`.
- `opportunities.json` contains representative local employer and micro-enterprise linkages badged `is_demo_seed: true` for demonstrating post-training placement workflows without connecting to external proprietary job portals.
- `testimonials.json` contains synthetic demo personas labeled as prototype demonstration records.

## 5. Third-Party Libraries & Licenses
- **Leaflet**: BSD 2-Clause License (offline vector/raster container)
- **OpenStreetMap Tiles**: © OpenStreetMap contributors (ODbL)
- **Noto Sans Fonts**: SIL Open Font License (OFL)
- **idb-keyval**: Apache License 2.0
- **qrcode**: MIT License
