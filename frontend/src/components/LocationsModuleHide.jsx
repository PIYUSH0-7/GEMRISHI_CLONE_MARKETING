'use client';

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// 4 EXCLUSIVE OFFLINE SHOWROOMS DATA WITH COMPLETE ADDRESS, CONTACT, MAPS & SLUGS
const showroomsData = [
  {
    id: 'ambala-nicholson',
    name: 'Ambala Showroom',
    badge: 'Flagship Store',
    address: 'Nicholson Road, Ambala, Haryana 133001',
    phone: '+91 98179 75978',
    email: 'wecare@gemrishi.com',
    cityName: 'Ambala',
    citySlug: 'ambala',
    areaSlug: 'nicholson-road',
    mapUrl: 'https://maps.google.com/maps?q=Nicholson+Road,+Ambala+Haryana+133001&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directMapLink: 'https://www.google.com/maps/search/?api=1&query=Nicholson+Road,+Ambala+Haryana+133001'
  },
  {
    id: 'shimla-mallroad',
    name: 'Shimla Showroom',
    badge: 'Himachal Store',
    address: 'Mall Road, Shimla, Himachal Pradesh 171001',
    phone: '+91 98179 75972',
    email: 'wecare@gemrishi.com',
    cityName: 'Shimla',
    citySlug: 'shimla',
    areaSlug: 'mall-road-shimla',
    mapUrl: 'https://maps.google.com/maps?q=Mall+Road,+Shimla,+Himachal+Pradesh+171001&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directMapLink: 'https://www.google.com/maps/search/?api=1&query=Mall+Road,+Shimla,+Himachal+Pradesh+171001'
  },
  {
    id: 'solan-gsquare',
    name: 'Solan Showroom',
    badge: 'G Square Mall Store',
    address: 'Ward 7, G Square Mall, Solan, Himachal Pradesh 173212',
    phone: '+91 74969 97220',
    email: 'wecare@gemrishi.com',
    cityName: 'Solan',
    citySlug: 'solan',
    areaSlug: 'g-square-mall-solan',
    mapUrl: 'https://maps.google.com/maps?q=Ward+7,+G+Square+Mall,+Solan,+Himachal+Pradesh+173212&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directMapLink: 'https://www.google.com/maps/search/?api=1&query=Ward+7,+G+Square+Mall,+Solan,+Himachal+Pradesh+173212'
  },
  {
    id: 'ambala-sadarbazar',
    name: 'Ambala Showroom (Sadar Bazar)',
    badge: 'Heritage Store',
    address: 'SADAR BAAZAR, Ambala, Haryana 133001',
    phone: '+91 98179 75978',
    email: 'wecare@gemrishi.com',
    cityName: 'Ambala (Sadar Bazar)',
    citySlug: 'ambala-sadar-bazar',
    areaSlug: 'sadar-bazar-ambala',
    mapUrl: 'https://maps.google.com/maps?q=SADAR+BAAZAR,+Ambala,+Haryana+133001&t=&z=15&ie=UTF8&iwloc=&output=embed',
    directMapLink: 'https://www.google.com/maps/search/?api=1&query=SADAR+BAAZAR,+Ambala,+Haryana+133001'
  }
];

// COMPREHENSIVE SEO LOCATION DATASET - 140+ INDIAN CITIES WITH SPECIFIC AREAS & PINCODES
const defaultLocationData = [
  { cityId: "ambala", cityName: "Ambala", citySlug: "ambala", state: "Haryana", areas: [{ name: "Nicholson Road", slug: "nicholson-road", pincode: "133001" }, { name: "Ambala Cantt", slug: "ambala-cantt", pincode: "133001" }, { name: "Ambala City", slug: "ambala-city", pincode: "134003" }, { name: "Model Town Ambala", slug: "model-town-ambala", pincode: "134003" }, { name: "Sector 7 Ambala", slug: "sector-7-ambala", pincode: "134003" }] },
  { cityId: "shimla", cityName: "Shimla", citySlug: "shimla", state: "Himachal Pradesh", areas: [{ name: "Mall Road Shimla", slug: "mall-road-shimla", pincode: "171001" }, { name: "Chotta Shimla", slug: "chotta-shimla", pincode: "171002" }, { name: "Sanjauli", slug: "sanjauli", pincode: "171006" }, { name: "Lakkar Bazar", slug: "lakkar-bazar", pincode: "171001" }, { name: "Kasumpti", slug: "kasumpti", pincode: "171009" }] },
  { cityId: "solan", cityName: "Solan", citySlug: "solan", state: "Himachal Pradesh", areas: [{ name: "Ward 7 G Square Mall", slug: "g-square-mall-solan", pincode: "173212" }, { name: "Mall Road Solan", slug: "mall-road-solan", pincode: "173212" }, { name: "Chambaghat", slug: "chambaghat", pincode: "173213" }, { name: "Saproon", slug: "saproon", pincode: "173211" }] },
  { cityId: "ambala-sadar-bazar", cityName: "Ambala (Sadar Bazar)", citySlug: "ambala-sadar-bazar", state: "Haryana", areas: [{ name: "Sadar Bazar Ambala", slug: "sadar-bazar-ambala", pincode: "133001" }, { name: "Cross Road Sadar Bazar", slug: "cross-road-sadar-bazar", pincode: "133001" }, { name: "Grain Market Ambala", slug: "grain-market-ambala", pincode: "133001" }] },
  { cityId: "gurugram", cityName: "Gurugram", citySlug: "gurugram", state: "Haryana", areas: [{ name: "Gurgaon DLF Phase 1-5", slug: "gurgaon-dlf-phase-1-5", pincode: "122002" }, { name: "Gurgaon Sector 14", slug: "gurgaon-sector-14", pincode: "122001" }, { name: "Gurgaon Sector 56", slug: "gurgaon-sector-56", pincode: "122011" }, { name: "Cyber City Gurugram", slug: "cyber-city-gurugram", pincode: "122002" }, { name: "Golf Course Extension Road", slug: "golf-course-extension", pincode: "122018" }, { name: "Sohna Road Gurugram", slug: "sohna-road-gurugram", pincode: "122018" }] },
  { cityId: "delhi", cityName: "Delhi NCR", citySlug: "delhi", state: "Delhi", areas: [{ name: "Connaught Place", slug: "connaught-place", pincode: "110001" }, { name: "Chandni Chowk", slug: "chandni-chowk", pincode: "110006" }, { name: "Karol Bagh", slug: "karol-bagh", pincode: "110005" }, { name: "South Extension", slug: "south-extension", pincode: "110049" }, { name: "Greater Kailash", slug: "greater-kailash", pincode: "110048" }, { name: "Defence Colony", slug: "defence-colony", pincode: "110024" }, { name: "Lajpat Nagar", slug: "lajpat-nagar", pincode: "110024" }, { name: "Punjabi Bagh", slug: "punjabi-bagh", pincode: "110026" }] },
  { cityId: "jaipur", cityName: "Jaipur", citySlug: "jaipur", state: "Rajasthan", areas: [{ name: "Johari Bazaar", slug: "johari-bazaar", pincode: "302003" }, { name: "Malviya Nagar", slug: "malviya-nagar", pincode: "302017" }, { name: "C-Scheme", slug: "c-scheme", pincode: "302001" }, { name: "Vaishali Nagar", slug: "vaishali-nagar", pincode: "302021" }, { name: "Mansarovar", slug: "mansarovar", pincode: "302020" }, { name: "Bapu Bazaar", slug: "bapu-bazaar", pincode: "302003" }] },
  { cityId: "mumbai", cityName: "Mumbai", citySlug: "mumbai", state: "Maharashtra", areas: [{ name: "Zaveri Bazaar", slug: "zaveri-bazaar", pincode: "400002" }, { name: "Bandra West", slug: "bandra-west", pincode: "400050" }, { name: "Andheri West", slug: "andheri-west", pincode: "400053" }, { name: "Juhu", slug: "juhu", pincode: "400049" }, { name: "Powai", slug: "powai", pincode: "400076" }, { name: "Colaba", slug: "colaba", pincode: "400001" }, { name: "BKC Mumbai", slug: "bkc-mumbai", pincode: "400051" }] },
  { cityId: "surat", cityName: "Surat", citySlug: "surat", state: "Gujarat", areas: [{ name: "Mahidharpura", slug: "mahidharpura", pincode: "395003" }, { name: "Varachha", slug: "varachha", pincode: "395006" }, { name: "Vesu", slug: "vesu", pincode: "395007" }, { name: "Adajan", slug: "adajan", pincode: "395009" }, { name: "Piplod", slug: "piplod", pincode: "395007" }] },
  { cityId: "kolkata", cityName: "Kolkata", citySlug: "kolkata", state: "West Bengal", areas: [{ name: "Bowbazar", slug: "bowbazar", pincode: "700012" }, { name: "Burrabazar", slug: "burrabazar", pincode: "700007" }, { name: "Park Street", slug: "park-street", pincode: "700016" }, { name: "Salt Lake City", slug: "salt-lake", pincode: "700064" }, { name: "Ballygunge", slug: "ballygunge", pincode: "700019" }] },
  { cityId: "hyderabad", cityName: "Hyderabad", citySlug: "hyderabad", state: "Telangana", areas: [{ name: "Banjara Hills", slug: "banjara-hills", pincode: "500034" }, { name: "Jubilee Hills", slug: "jubilee-hills", pincode: "500033" }, { name: "Hitech City", slug: "hitech-city", pincode: "500081" }, { name: "Gachibowli", slug: "gachibowli", pincode: "500032" }, { name: "Madhapur", slug: "madhapur", pincode: "500081" }] },
  { cityId: "bengaluru", cityName: "Bengaluru", citySlug: "bengaluru", state: "Karnataka", areas: [{ name: "Jayanagar", slug: "jayanagar", pincode: "560011" }, { name: "Indiranagar", slug: "indiranagar", pincode: "560038" }, { name: "Koramangala", slug: "koramangala", pincode: "560034" }, { name: "Whitefield", slug: "whitefield", pincode: "560066" }, { name: "HSR Layout", slug: "hsr-layout", pincode: "560102" }] },
  { cityId: "chennai", cityName: "Chennai", citySlug: "chennai", state: "Tamil Nadu", areas: [{ name: "T Nagar", slug: "t-nagar", pincode: "600017" }, { name: "Adyar", slug: "adyar", pincode: "600020" }, { name: "Anna Nagar", slug: "anna-nagar", pincode: "600040" }, { name: "Mylapore", slug: "mylapore", pincode: "600004" }, { name: "Velachery", slug: "velachery", pincode: "600042" }] },
  { cityId: "ahmedabad", cityName: "Ahmedabad", citySlug: "ahmedabad", state: "Gujarat", areas: [{ name: "CG Road", slug: "cg-road", pincode: "380009" }, { name: "SG Highway", slug: "sg-highway", pincode: "380054" }, { name: "Satellite", slug: "satellite", pincode: "380015" }, { name: "Vastrapur", slug: "vastrapur", pincode: "380015" }, { name: "Bopal", slug: "bopal", pincode: "380058" }] },
  { cityId: "pune", cityName: "Pune", citySlug: "pune", state: "Maharashtra", areas: [{ name: "Koregaon Park", slug: "koregaon-park", pincode: "411001" }, { name: "Kalyani Nagar", slug: "kalyani-nagar", pincode: "411006" }, { name: "Kothrud", slug: "kothrud", pincode: "411038" }, { name: "Viman Nagar", slug: "viman-nagar", pincode: "411014" }, { name: "Baner", slug: "baner", pincode: "411045" }] },
  { cityId: "chandigarh", cityName: "Chandigarh", citySlug: "chandigarh", state: "Chandigarh", areas: [{ name: "Sector 17", slug: "sector-17", pincode: "160017" }, { name: "Sector 22", slug: "sector-22", pincode: "160022" }, { name: "Sector 35", slug: "sector-35", pincode: "160035" }, { name: "Sector 8", slug: "sector-8", pincode: "160009" }] },
  { cityId: "lucknow", cityName: "Lucknow", citySlug: "lucknow", state: "Uttar Pradesh", areas: [{ name: "Hazratganj", slug: "hazratganj", pincode: "226001" }, { name: "Gomti Nagar", slug: "gomti-nagar", pincode: "226010" }, { name: "Aliganj", slug: "aliganj", pincode: "226024" }, { name: "Indira Nagar", slug: "indira-nagar", pincode: "226016" }] },
  { cityId: "noida", cityName: "Noida", citySlug: "noida", state: "Uttar Pradesh", areas: [{ name: "Sector 18 Noida", slug: "sector-18-noida", pincode: "201301" }, { name: "Sector 62 Noida", slug: "sector-62-noida", pincode: "201309" }, { name: "Greater Noida West", slug: "greater-noida-west", pincode: "201306" }] },
  { cityId: "ghaziabad", cityName: "Ghaziabad", citySlug: "ghaziabad", state: "Uttar Pradesh", areas: [{ name: "Indirapuram", slug: "indirapuram", pincode: "201014" }, { name: "Raj Nagar Ghaziabad", slug: "raj-nagar", pincode: "201002" }, { name: "Vaishali Ghaziabad", slug: "vaishali-ghaziabad", pincode: "201010" }] },
  { cityId: "faridabad", cityName: "Faridabad", citySlug: "faridabad", state: "Haryana", areas: [{ name: "Sector 15 Faridabad", slug: "sector-15-faridabad", pincode: "121007" }, { name: "NIT Faridabad", slug: "nit-faridabad", pincode: "121001" }, { name: "Greater Faridabad", slug: "greater-faridabad", pincode: "121002" }] },
  { cityId: "panchkula", cityName: "Panchkula", citySlug: "panchkula", state: "Haryana", areas: [{ name: "Sector 5 Panchkula", slug: "sector-5-panchkula", pincode: "134109" }, { name: "Sector 9 Panchkula", slug: "sector-9-panchkula", pincode: "134109" }, { name: "MDC Panchkula", slug: "mdc-panchkula", pincode: "134114" }] },
  { cityId: "mohali", cityName: "Mohali", citySlug: "mohali", state: "Punjab", areas: [{ name: "Phase 3B2 Mohali", slug: "phase-3b2-mohali", pincode: "160059" }, { name: "Phase 7 Mohali", slug: "phase-7-mohali", pincode: "160062" }, { name: "Aerocity Mohali", slug: "aerocity-mohali", pincode: "140306" }] },
  { cityId: "dehradun", cityName: "Dehradun", citySlug: "dehradun", state: "Uttarakhand", areas: [{ name: "Rajpur Road", slug: "rajpur-road", pincode: "248001" }, { name: "Paltan Bazaar", slug: "paltan-bazaar", pincode: "248001" }, { name: "Clement Town", slug: "clement-town", pincode: "248002" }] },
  { cityId: "haridwar", cityName: "Haridwar", citySlug: "haridwar", state: "Uttarakhand", areas: [{ name: "Har Ki Pauri", slug: "har-ki-pauri", pincode: "249401" }, { name: "Kankhal", slug: "kankhal", pincode: "249408" }, { name: "Ranipur More", slug: "ranipur-more", pincode: "249407" }] },
  { cityId: "rishikesh", cityName: "Rishikesh", citySlug: "rishikesh", state: "Uttarakhand", areas: [{ name: "Triveni Ghat", slug: "triveni-ghat", pincode: "249201" }, { name: "Laxman Jhula", slug: "laxman-jhula", pincode: "249137" }, { name: "Tapovan", slug: "tapovan", pincode: "249192" }] },
  { cityId: "dharamshala", cityName: "Dharamshala", citySlug: "dharamshala", state: "Himachal Pradesh", areas: [{ name: "McLeod Ganj", slug: "mcleod-ganj", pincode: "176219" }, { name: "Kotwali Bazaar", slug: "kotwali-bazaar", pincode: "176215" }, { name: "Dari", slug: "dari", pincode: "176215" }] },
  { cityId: "kullu", cityName: "Kullu", citySlug: "kullu", state: "Himachal Pradesh", areas: [{ name: "Dhalpur", slug: "dhalpur", pincode: "175101" }, { name: "Bhuntar", slug: "bhuntar", pincode: "175125" }, { name: "Akhara Bazar", slug: "akhara-bazar", pincode: "175101" }] },
  { cityId: "manali", cityName: "Manali", citySlug: "manali", state: "Himachal Pradesh", areas: [{ name: "Mall Road Manali", slug: "mall-road-manali", pincode: "175131" }, { name: "Old Manali", slug: "old-manali", pincode: "175131" }, { name: "Vashisht", slug: "vashisht", pincode: "175131" }] },
  { cityId: "mandi", cityName: "Mandi", citySlug: "mandi", state: "Himachal Pradesh", areas: [{ name: "Indira Market Mandi", slug: "indira-market-mandi", pincode: "175001" }, { name: "Purani Mandi", slug: "purani-mandi", pincode: "175001" }, { name: "Gutkar", slug: "gutkar", pincode: "175021" }] },
  { cityId: "hamirpur", cityName: "Hamirpur", citySlug: "hamirpur", state: "Himachal Pradesh", areas: [{ name: "Main Market Hamirpur", slug: "main-market-hamirpur", pincode: "177001" }, { name: "Bhota Road", slug: "bhota-road", pincode: "177001" }, { name: "Anu Hamirpur", slug: "anu-hamirpur", pincode: "177001" }] },
  { cityId: "una", cityName: "Una", citySlug: "una", state: "Himachal Pradesh", areas: [{ name: "Main Market Una", slug: "main-market-una", pincode: "174303" }, { name: "Mehatpur", slug: "mehatpur", pincode: "174315" }, { name: "Amb Una", slug: "amb-una", pincode: "177203" }] },
  { cityId: "bilaspur-hp", cityName: "Bilaspur HP", citySlug: "bilaspur-hp", state: "Himachal Pradesh", areas: [{ name: "Main Market Bilaspur", slug: "main-market-bilaspur", pincode: "174001" }, { name: "Ghumarwin", slug: "ghumarwin", pincode: "174021" }] },
  { cityId: "chamba", cityName: "Chamba", citySlug: "chamba", state: "Himachal Pradesh", areas: [{ name: "Chowgan Ground", slug: "chowgan-ground", pincode: "176310" }, { name: "Khajjiar Road", slug: "khajjiar-road", pincode: "176314" }] },
  { cityId: "nahan", cityName: "Nahan (Sirmaur)", citySlug: "nahan", state: "Himachal Pradesh", areas: [{ name: "Nahan Town", slug: "nahan-town", pincode: "173001" }, { name: "Paonta Sahib", slug: "paonta-sahib", pincode: "173025" }] },
  { cityId: "karnal", cityName: "Karnal", citySlug: "karnal", state: "Haryana", areas: [{ name: "Mall Road Karnal", slug: "mall-road-karnal", pincode: "132001" }, { name: "Model Town Karnal", slug: "model-town-karnal", pincode: "132001" }, { name: "Sector 12 Karnal", slug: "sector-12-karnal", pincode: "132001" }] },
  { cityId: "kurukshetra", cityName: "Kurukshetra", citySlug: "kurukshetra", state: "Haryana", areas: [{ name: "Sector 13 Kurukshetra", slug: "sector-13-kurukshetra", pincode: "136118" }, { name: "Pipli Road", slug: "pipli-road", pincode: "136118" }, { name: "Thanesar", slug: "thanesar", pincode: "136118" }] },
  { cityId: "yamunanagar", cityName: "Yamunanagar", citySlug: "yamunanagar", state: "Haryana", areas: [{ name: "Model Town Yamunanagar", slug: "model-town-yamunanagar", pincode: "135001" }, { name: "Jagadhri", slug: "jagadhri", pincode: "135003" }] },
  { cityId: "panipat", cityName: "Panipat", citySlug: "panipat", state: "Haryana", areas: [{ name: "Model Town Panipat", slug: "model-town-panipat", pincode: "132103" }, { name: "GT Road Panipat", slug: "gt-road-panipat", pincode: "132103" }] },
  { cityId: "sonipat", cityName: "Sonipat", citySlug: "sonipat", state: "Haryana", areas: [{ name: "Model Town Sonipat", slug: "model-town-sonipat", pincode: "131001" }, { name: "Sector 14 Sonipat", slug: "sector-14-sonipat", pincode: "131001" }] },
  { cityId: "rohtak", cityName: "Rohtak", citySlug: "rohtak", state: "Haryana", areas: [{ name: "Model Town Rohtak", slug: "model-town-rohtak", pincode: "124001" }, { name: "DLF Colony Rohtak", slug: "dlf-colony-rohtak", pincode: "124001" }] },
  { cityId: "hisar", cityName: "Hisar", citySlug: "hisar", state: "Haryana", areas: [{ name: "Urban Estate Hisar", slug: "urban-estate-hisar", pincode: "125005" }, { name: "Model Town Hisar", slug: "model-town-hisar", pincode: "125001" }] },
  { cityId: "bhiwani", cityName: "Bhiwani", citySlug: "bhiwani", state: "Haryana", areas: [{ name: "Clock Tower Bhiwani", slug: "clock-tower-bhiwani", pincode: "127021" }, { name: "Circular Road Bhiwani", slug: "circular-road-bhiwani", pincode: "127021" }] },
  { cityId: "rewari", cityName: "Rewari", citySlug: "rewari", state: "Haryana", areas: [{ name: "Model Town Rewari", slug: "model-town-rewari", pincode: "123401" }, { name: "Brass Market Rewari", slug: "brass-market-rewari", pincode: "123401" }] },
  { cityId: "sirsa", cityName: "Sirsa", citySlug: "sirsa", state: "Haryana", areas: [{ name: "Subhash Chowk Sirsa", slug: "subhash-chowk-sirsa", pincode: "125055" }, { name: "Barnala Road Sirsa", slug: "barnala-road-sirsa", pincode: "125055" }] },
  { cityId: "jind", cityName: "Jind", citySlug: "jind", state: "Haryana", areas: [{ name: "Main Bazaar Jind", slug: "main-bazaar-jind", pincode: "126102" }, { name: "Urban Estate Jind", slug: "urban-estate-jind", pincode: "126102" }] },
  { cityId: "palwal", cityName: "Palwal", citySlug: "palwal", state: "Haryana", areas: [{ name: "GT Road Palwal", slug: "gt-road-palwal", pincode: "121102" }, { name: "Minar Gate Palwal", slug: "minar-gate-palwal", pincode: "121102" }] },
  { cityId: "jalandhar", cityName: "Jalandhar", citySlug: "jalandhar", state: "Punjab", areas: [{ name: "Model Town Jalandhar", slug: "model-town-jalandhar", pincode: "144003" }, { name: "Cantt Road Jalandhar", slug: "cantt-road-jalandhar", pincode: "144005" }, { name: "Civil Lines Jalandhar", slug: "civil-lines-jalandhar", pincode: "144001" }] },
  { cityId: "patiala", cityName: "Patiala", citySlug: "patiala", state: "Punjab", areas: [{ name: "Mall Road Patiala", slug: "mall-road-patiala", pincode: "147001" }, { name: "Leela Bhawan", slug: "leela-bhawan", pincode: "147001" }, { name: "Urban Estate Patiala", slug: "urban-estate-patiala", pincode: "147002" }] },
  { cityId: "bathinda", cityName: "Bathinda", citySlug: "bathinda", state: "Punjab", areas: [{ name: "Mall Road Bathinda", slug: "mall-road-bathinda", pincode: "151001" }, { name: "Model Town Bathinda", slug: "model-town-bathinda", pincode: "151001" }] },
  { cityId: "pathankot", cityName: "Pathankot", citySlug: "pathankot", state: "Punjab", areas: [{ name: "Dhangu Road", slug: "dhangu-road", pincode: "145001" }, { name: "Railway Road Pathankot", slug: "railway-road-pathankot", pincode: "145001" }] },
  { cityId: "hoshiarpur", cityName: "Hoshiarpur", citySlug: "hoshiarpur", state: "Punjab", areas: [{ name: "Clock Tower Hoshiarpur", slug: "clock-tower-hoshiarpur", pincode: "146001" }, { name: "Mall Road Hoshiarpur", slug: "mall-road-hoshiarpur", pincode: "146001" }] },
  { cityId: "moga", cityName: "Moga", citySlug: "moga", state: "Punjab", areas: [{ name: "GT Road Moga", slug: "gt-road-moga", pincode: "142001" }, { name: "Main Bazaar Moga", slug: "main-bazaar-moga", pincode: "142001" }] },
  { cityId: "firozpur", cityName: "Firozpur", citySlug: "firozpur", state: "Punjab", areas: [{ name: "Mall Road Firozpur", slug: "mall-road-firozpur", pincode: "152001" }, { name: "Cantonment Firozpur", slug: "cantonment-firozpur", pincode: "152001" }] },
  { cityId: "phagwara", cityName: "Phagwara", citySlug: "phagwara", state: "Punjab", areas: [{ name: "GT Road Phagwara", slug: "gt-road-phagwara", pincode: "144401" }, { name: "Hargobind Nagar", slug: "hargobind-nagar", pincode: "144401" }] },
  { cityId: "khanna", cityName: "Khanna", citySlug: "khanna", state: "Punjab", areas: [{ name: "GT Road Khanna", slug: "gt-road-khanna", pincode: "141401" }, { name: "Samrala Road", slug: "samrala-road", pincode: "141401" }] },
  { cityId: "ludhiana", cityName: "Ludhiana", citySlug: "ludhiana", state: "Punjab", areas: [{ name: "Sarabha Nagar", slug: "sarabha-nagar", pincode: "141001" }, { name: "Model Town Ludhiana", slug: "model-town-ludhiana", pincode: "141002" }, { name: "Civil Lines Ludhiana", slug: "civil-lines-ludhiana", pincode: "141001" }] },
  { cityId: "amritsar", cityName: "Amritsar", citySlug: "amritsar", state: "Punjab", areas: [{ name: "Guru Bazaar", slug: "guru-bazaar", pincode: "143006" }, { name: "Lawrence Road", slug: "lawrence-road", pincode: "143001" }, { name: "Ranjit Avenue", slug: "ranjit-avenue", pincode: "143001" }] },
  { cityId: "agra", cityName: "Agra", citySlug: "agra", state: "Uttar Pradesh", areas: [{ name: "Sanjay Place", slug: "sanjay-place", pincode: "282002" }, { name: "Tajganj", slug: "tajganj", pincode: "282001" }, { name: "Sadar Bazaar Agra", slug: "sadar-bazaar-agra", pincode: "282001" }] },
  { cityId: "varanasi", cityName: "Varanasi", citySlug: "varanasi", state: "Uttar Pradesh", areas: [{ name: "Godowlia", slug: "godowlia", pincode: "221001" }, { name: "Sigra", slug: "sigra", pincode: "221002" }, { name: "Lanka Varanasi", slug: "lanka-varanasi", pincode: "221005" }] },
  { cityId: "prayagraj", cityName: "Prayagraj", citySlug: "prayagraj", state: "Uttar Pradesh", areas: [{ name: "Civil Lines Prayagraj", slug: "civil-lines-prayagraj", pincode: "211001" }, { name: "Chowk Prayagraj", slug: "chowk-prayagraj", pincode: "211003" }, { name: "Katra Prayagraj", slug: "katra-prayagraj", pincode: "211002" }] },
  { cityId: "kanpur", cityName: "Kanpur", citySlug: "kanpur", state: "Uttar Pradesh", areas: [{ name: "Swaroop Nagar", slug: "swaroop-nagar", pincode: "208002" }, { name: "Birhana Road", slug: "birhana-road", pincode: "208001" }, { name: "Civil Lines Kanpur", slug: "civil-lines-kanpur", pincode: "208001" }] },
  { cityId: "meerut", cityName: "Meerut", citySlug: "meerut", state: "Uttar Pradesh", areas: [{ name: "Abu Lane", slug: "abu-lane", pincode: "250001" }, { name: "Shastri Nagar Meerut", slug: "shastri-nagar-meerut", pincode: "250004" }] },
  { cityId: "bareilly", cityName: "Bareilly", citySlug: "bareilly", state: "Uttar Pradesh", areas: [{ name: "Civil Lines Bareilly", slug: "civil-lines-bareilly", pincode: "243001" }, { name: "Rajendra Nagar Bareilly", slug: "rajendra-nagar-bareilly", pincode: "243122" }] },
  { cityId: "aligarh", cityName: "Aligarh", citySlug: "aligarh", state: "Uttar Pradesh", areas: [{ name: "Centre Point", slug: "centre-point", pincode: "202001" }, { name: "Marris Road", slug: "marris-road", pincode: "202001" }] },
  { cityId: "moradabad", cityName: "Moradabad", citySlug: "moradabad", state: "Uttar Pradesh", areas: [{ name: "Civil Lines Moradabad", slug: "civil-lines-moradabad", pincode: "244001" }, { name: "Kanth Road", slug: "kanth-road", pincode: "244001" }] },
  { cityId: "saharanpur", cityName: "Saharanpur", citySlug: "saharanpur", state: "Uttar Pradesh", areas: [{ name: "Court Road Saharanpur", slug: "court-road-saharanpur", pincode: "247001" }, { name: "Nehru Market", slug: "nehru-market", pincode: "247001" }] },
  { cityId: "gorakhpur", cityName: "Gorakhpur", citySlug: "gorakhpur", state: "Uttar Pradesh", areas: [{ name: "Golghar", slug: "golghar", pincode: "273001" }, { name: "Civil Lines Gorakhpur", slug: "civil-lines-gorakhpur", pincode: "273001" }] },
  { cityId: "mathura", cityName: "Mathura", citySlug: "mathura", state: "Uttar Pradesh", areas: [{ name: "Dampier Nagar", slug: "dampier-nagar", pincode: "281001" }, { name: "Krishna Nagar Mathura", slug: "krishna-nagar-mathura", pincode: "281004" }] },
  { cityId: "ayodhya", cityName: "Ayodhya", citySlug: "ayodhya", state: "Uttar Pradesh", areas: [{ name: "Ram Path Ayodhya", slug: "ram-path-ayodhya", pincode: "224123" }, { name: "Naya Ghat Ayodhya", slug: "naya-ghat-ayodhya", pincode: "224123" }] },
  { cityId: "jhansi", cityName: "Jhansi", citySlug: "jhansi", state: "Uttar Pradesh", areas: [{ name: "Sadar Bazaar Jhansi", slug: "sadar-bazaar-jhansi", pincode: "284001" }, { name: "Civil Lines Jhansi", slug: "civil-lines-jhansi", pincode: "284001" }] },
  { cityId: "muzaffarnagar", cityName: "Muzaffarnagar", citySlug: "muzaffarnagar", state: "Uttar Pradesh", areas: [{ name: "Civil Lines Muzaffarnagar", slug: "civil-lines-muzaffarnagar", pincode: "251001" }, { name: "New Mandi", slug: "new-mandi", pincode: "251001" }] },
  { cityId: "jodhpur", cityName: "Jodhpur", citySlug: "jodhpur", state: "Rajasthan", areas: [{ name: "Sardarpura", slug: "sardarpura", pincode: "342003" }, { name: "Ratanada", slug: "ratanada", pincode: "342011" }, { name: "Shastri Nagar Jodhpur", slug: "shastri-nagar-jodhpur", pincode: "342003" }] },
  { cityId: "udaipur", cityName: "Udaipur", citySlug: "udaipur", state: "Rajasthan", areas: [{ name: "Panchwati Udaipur", slug: "panchwati-udaipur", pincode: "313001" }, { name: "Hiran Magri", slug: "hiran-magri", pincode: "313002" }, { name: "Surajpole", slug: "surajpole", pincode: "313001" }] },
  { cityId: "kota", cityName: "Kota", citySlug: "kota", state: "Rajasthan", areas: [{ name: "Talwandi Kota", slug: "talwandi-kota", pincode: "324005" }, { name: "Gumanpura", slug: "gumanpura", pincode: "324007" }, { name: "Vigyan Nagar Kota", slug: "vigyan-nagar-kota", pincode: "324005" }] },
  { cityId: "ajmer", cityName: "Ajmer", citySlug: "ajmer", state: "Rajasthan", areas: [{ name: "Panchsheel Nagar", slug: "panchsheel-nagar", pincode: "305004" }, { name: "Vaishali Nagar Ajmer", slug: "vaishali-nagar-ajmer", pincode: "305004" }] },
  { cityId: "bikaner", cityName: "Bikaner", citySlug: "bikaner", state: "Rajasthan", areas: [{ name: "Kote Gate", slug: "kote-gate", pincode: "334001" }, { name: "Rani Bazaar", slug: "rani-bazaar", pincode: "334001" }] },
  { cityId: "bhilwara", cityName: "Bhilwara", citySlug: "bhilwara", state: "Rajasthan", areas: [{ name: "Azad Nagar Bhilwara", slug: "azad-nagar-bhilwara", pincode: "311001" }, { name: "Subhash Nagar Bhilwara", slug: "subhash-nagar-bhilwara", pincode: "311001" }] },
  { cityId: "alwar", cityName: "Alwar", citySlug: "alwar", state: "Rajasthan", areas: [{ name: "Church Road Alwar", slug: "church-road-alwar", pincode: "301001" }, { name: "Manu Marg", slug: "manu-marg", pincode: "301001" }] },
  { cityId: "indore", cityName: "Indore", citySlug: "indore", state: "Madhya Pradesh", areas: [{ name: "Sarafa Bazaar", slug: "sarafa-bazaar", pincode: "452002" }, { name: "Vijay Nagar Indore", slug: "vijay-nagar-indore", pincode: "452010" }, { name: "Palasia", slug: "palasia", pincode: "452001" }] },
  { cityId: "bhopal", cityName: "Bhopal", citySlug: "bhopal", state: "Madhya Pradesh", areas: [{ name: "MP Nagar Bhopal", slug: "mp-nagar-bhopal", pincode: "462011" }, { name: "Arera Colony", slug: "arera-colony", pincode: "462016" }, { name: "New Market Bhopal", slug: "new-market-bhopal", pincode: "462003" }] },
  { cityId: "gwalior", cityName: "Gwalior", citySlug: "gwalior", state: "Madhya Pradesh", areas: [{ name: "City Center Gwalior", slug: "city-center-gwalior", pincode: "474011" }, { name: "Lashkar Gwalior", slug: "lashkar-gwalior", pincode: "474001" }] },
  { cityId: "jabalpur", cityName: "Jabalpur", citySlug: "jabalpur", state: "Madhya Pradesh", areas: [{ name: "Civil Lines Jabalpur", slug: "civil-lines-jabalpur", pincode: "482001" }, { name: "Wright Town", slug: "wright-town", pincode: "482002" }] },
  { cityId: "ujjain", cityName: "Ujjain", citySlug: "ujjain", state: "Madhya Pradesh", areas: [{ name: "Freeganj Ujjain", slug: "freeganj-ujjain", pincode: "456010" }, { name: "Nanakheda", slug: "nanakheda", pincode: "456010" }] },
  { cityId: "sagar", cityName: "Sagar", citySlug: "sagar", state: "Madhya Pradesh", areas: [{ name: "Civil Lines Sagar", slug: "civil-lines-sagar", pincode: "470001" }, { name: "Katra Bazaar Sagar", slug: "katra-bazaar-sagar", pincode: "470002" }] },
  { cityId: "rewa", cityName: "Rewa", citySlug: "rewa", state: "Madhya Pradesh", areas: [{ name: "Civil Lines Rewa", slug: "civil-lines-rewa", pincode: "486001" }, { name: "College Road Rewa", slug: "college-road-rewa", pincode: "486001" }] },
  { cityId: "satna", cityName: "Satna", citySlug: "satna", state: "Madhya Pradesh", areas: [{ name: "Civil Lines Satna", slug: "civil-lines-satna", pincode: "485001" }, { name: "Rewa Road Satna", slug: "rewa-road-satna", pincode: "485001" }] },
  { cityId: "panna", cityName: "Panna", citySlug: "panna", state: "Madhya Pradesh", areas: [{ name: "Panna City Center", slug: "panna-city-center", pincode: "488001" }, { name: "Diamond Mine Area", slug: "diamond-mine-area", pincode: "488001" }] },
  { cityId: "raipur", cityName: "Raipur", citySlug: "raipur", state: "Chhattisgarh", areas: [{ name: "Pandri Raipur", slug: "pandri-raipur", pincode: "492004" }, { name: "Civil Lines Raipur", slug: "civil-lines-raipur", pincode: "492001" }] },
  { cityId: "bhilai", cityName: "Bhilai", citySlug: "bhilai", state: "Chhattisgarh", areas: [{ name: "Civic Center Bhilai", slug: "civic-center-bhilai", pincode: "490006" }, { name: "Supela Bhilai", slug: "supela-bhilai", pincode: "490023" }] },
  { cityId: "bilaspur-cg", cityName: "Bilaspur CG", citySlug: "bilaspur-cg", state: "Chhattisgarh", areas: [{ name: "Link Road Bilaspur", slug: "link-road-bilaspur", pincode: "495001" }, { name: "Vyapar Vihar", slug: "vyapar-vihar", pincode: "495001" }] },
  { cityId: "ratnapur", cityName: "Ratnapur", citySlug: "ratnapur", state: "Chhattisgarh", areas: [{ name: "Ratnapur Town", slug: "ratnapur-town", pincode: "495442" }, { name: "Mahamaya Temple Area", slug: "mahamaya-temple", pincode: "495442" }] },
  { cityId: "vadodara", cityName: "Vadodara", citySlug: "vadodara", state: "Gujarat", areas: [{ name: "Alkapuri Vadodara", slug: "alkapuri-vadodara", pincode: "390007" }, { name: "Sayajigunj", slug: "sayajigunj", pincode: "390005" }] },
  { cityId: "rajkot", cityName: "Rajkot", citySlug: "rajkot", state: "Gujarat", areas: [{ name: "Yagnik Road", slug: "yagnik-road", pincode: "360001" }, { name: "Kalawad Road", slug: "kalawad-road", pincode: "360005" }] },
  { cityId: "bhavnagar", cityName: "Bhavnagar", citySlug: "bhavnagar", state: "Gujarat", areas: [{ name: "Waghawadi Road", slug: "waghawadi-road", pincode: "364002" }, { name: "Kalanala", slug: "kalanala", pincode: "364001" }] },
  { cityId: "jamnagar", cityName: "Jamnagar", citySlug: "jamnagar", state: "Gujarat", areas: [{ name: "Park Colony Jamnagar", slug: "park-colony-jamnagar", pincode: "361008" }, { name: "Summair Club Road", slug: "summair-club-road", pincode: "361005" }] },
  { cityId: "gandhinagar", cityName: "Gandhinagar", citySlug: "gandhinagar", state: "Gujarat", areas: [{ name: "Sector 11 Gandhinagar", slug: "sector-11-gandhinagar", pincode: "382011" }, { name: "Infocity Gandhinagar", slug: "infocity-gandhinagar", pincode: "382007" }] },
  { cityId: "nagpur", cityName: "Nagpur", citySlug: "nagpur", state: "Maharashtra", areas: [{ name: "Dharampeth", slug: "dharampeth", pincode: "440010" }, { name: "Sitabuldi", slug: "sitabuldi", pincode: "440012" }, { name: "Sadar Nagpur", slug: "sadar-nagpur", pincode: "440001" }] },
  { cityId: "goa", cityName: "Goa (Panaji)", citySlug: "goa", state: "Goa", areas: [{ name: "Panaji City Center", slug: "panaji-city-center", pincode: "403001" }, { name: "Margao", slug: "margao", pincode: "403601" }, { name: "Calangute", slug: "calangute", pincode: "403516" }] },
  { cityId: "cuttack", cityName: "Cuttack", citySlug: "cuttack", state: "Odisha", areas: [{ name: "Choudhury Bazaar", slug: "choudhury-bazaar", pincode: "753001" }, { name: "Mangalabag", slug: "mangalabag", pincode: "753001" }, { name: "Buxi Bazaar", slug: "buxi-bazaar", pincode: "753001" }] },
  { cityId: "bhubaneswar", cityName: "Bhubaneswar", citySlug: "bhubaneswar", state: "Odisha", areas: [{ name: "Janpath Road", slug: "janpath-road", pincode: "751001" }, { name: "Saheed Nagar", slug: "saheed-nagar", pincode: "751007" }, { name: "Patia Bhubaneswar", slug: "patia-bhubaneswar", pincode: "751024" }] },
  { cityId: "ranchi", cityName: "Ranchi", citySlug: "ranchi", state: "Jharkhand", areas: [{ name: "Main Road Ranchi", slug: "main-road-ranchi", pincode: "834001" }, { name: "Lalpur Ranchi", slug: "lalpur-ranchi", pincode: "834001" }] },
  { cityId: "jamshedpur", cityName: "Jamshedpur", citySlug: "jamshedpur", state: "Jharkhand", areas: [{ name: "Bistupur Jamshedpur", slug: "bistupur-jamshedpur", pincode: "831001" }, { name: "Sakchi", slug: "sakchi", pincode: "831001" }] },
  { cityId: "dhanbad", cityName: "Dhanbad", citySlug: "dhanbad", state: "Jharkhand", areas: [{ name: "Bank More Dhanbad", slug: "bank-more-dhanbad", pincode: "826001" }, { name: "Saraidhela", slug: "saraidhela", pincode: "828127" }] },
  { cityId: "patna", cityName: "Patna", citySlug: "patna", state: "Bihar", areas: [{ name: "Boring Road Patna", slug: "boring-road-patna", pincode: "800001" }, { name: "Kankarbagh", slug: "kankarbagh", pincode: "800020" }] },
  { cityId: "gaya", cityName: "Gaya", citySlug: "gaya", state: "Bihar", areas: [{ name: "AP Colony Gaya", slug: "ap-colony-gaya", pincode: "823001" }, { name: "GB Road Gaya", slug: "gb-road-gaya", pincode: "823001" }] },
  { cityId: "muzaffarpur", cityName: "Muzaffarpur", citySlug: "muzaffarpur", state: "Bihar", areas: [{ name: "Motijheel Muzaffarpur", slug: "motijheel-muzaffarpur", pincode: "842001" }, { name: "Mithanpura", slug: "mithanpura", pincode: "842002" }] },
  { cityId: "bhagalpur", cityName: "Bhagalpur", citySlug: "bhagalpur", state: "Bihar", areas: [{ name: "Tilkamanjhi", slug: "tilkamanjhi", pincode: "812001" }, { name: "MG Road Bhagalpur", slug: "mg-road-bhagalpur", pincode: "812001" }] },
  { cityId: "guwahati", cityName: "Guwahati", citySlug: "guwahati", state: "Assam", areas: [{ name: "GS Road Guwahati", slug: "gs-road-guwahati", pincode: "781005" }, { name: "Fancy Bazaar", slug: "fancy-bazaar", pincode: "781001" }] },
  { cityId: "shillong", cityName: "Shillong", citySlug: "shillong", state: "Meghalaya", areas: [{ name: "Police Bazar Shillong", slug: "police-bazar-shillong", pincode: "793001" }, { name: "Laitumkhrah", slug: "laitumkhrah", pincode: "793003" }] },
  { cityId: "agartala", cityName: "Agartala", citySlug: "agartala", state: "Tripura", areas: [{ name: "City Center Agartala", slug: "city-center-agartala", pincode: "799001" }, { name: "Akhaura Road", slug: "akhaura-road", pincode: "799001" }] },
  { cityId: "imphal", cityName: "Imphal", citySlug: "imphal", state: "Manipur", areas: [{ name: "Paona Bazaar", slug: "paona-bazaar", pincode: "795001" }, { name: "Thangal Bazaar", slug: "thangal-bazaar", pincode: "795001" }] },
  { cityId: "aizawl", cityName: "Aizawl", citySlug: "aizawl", state: "Mizoram", areas: [{ name: "Zarkawt Aizawl", slug: "zarkawt-aizawl", pincode: "796001" }, { name: "Chanmari Aizawl", slug: "chanmari-aizawl", pincode: "796007" }] },
  { cityId: "kohima", cityName: "Kohima", citySlug: "kohima", state: "Nagaland", areas: [{ name: "PR Hill Kohima", slug: "pr-hill-kohima", pincode: "797001" }, { name: "Main Bazaar Kohima", slug: "main-bazaar-kohima", pincode: "797001" }] },
  { cityId: "srinagar", cityName: "Srinagar", citySlug: "srinagar", state: "Jammu & Kashmir", areas: [{ name: "Lal Chowk Srinagar", slug: "lal-chowk-srinagar", pincode: "190001" }, { name: "Rajbagh Srinagar", slug: "rajbagh-srinagar", pincode: "190008" }] },
  { cityId: "jammu", cityName: "Jammu", citySlug: "jammu", state: "Jammu & Kashmir", areas: [{ name: "Gandhi Nagar Jammu", slug: "gandhi-nagar-jammu", pincode: "180004" }, { name: "Raghunath Bazaar Jammu", slug: "raghunath-bazaar-jammu", pincode: "180001" }] },
  { cityId: "leh", cityName: "Leh Ladakh", citySlug: "leh", state: "Ladakh", areas: [{ name: "Main Bazaar Leh", slug: "main-bazaar-leh", pincode: "194101" }, { name: "Fort Road Leh", slug: "fort-road-leh", pincode: "194101" }] },
  { cityId: "visakhapatnam", cityName: "Visakhapatnam", citySlug: "visakhapatnam", state: "Andhra Pradesh", areas: [{ name: "Waltair Uplands", slug: "waltair-uplands", pincode: "530003" }, { name: "VIP Road Visakhapatnam", slug: "vip-road-visakhapatnam", pincode: "530003" }] },
  { cityId: "vijayawada", cityName: "Vijayawada", citySlug: "vijayawada", state: "Andhra Pradesh", areas: [{ name: "MG Road Vijayawada", slug: "mg-road-vijayawada", pincode: "520010" }, { name: "Benz Circle", slug: "benz-circle", pincode: "520010" }] },
  { cityId: "tirupati", cityName: "Tirupati", citySlug: "tirupati", state: "Andhra Pradesh", areas: [{ name: "TK Street Tirupati", slug: "tk-street-tirupati", pincode: "517501" }, { name: "Air Bypass Road", slug: "air-bypass-road", pincode: "517501" }] },
  { cityId: "guntur", cityName: "Guntur", citySlug: "guntur", state: "Andhra Pradesh", areas: [{ name: "Brodipet Guntur", slug: "brodipet-guntur", pincode: "522002" }, { name: "Arundelpet", slug: "arundelpet", pincode: "522002" }] },
  { cityId: "nellore", cityName: "Nellore", citySlug: "nellore", state: "Andhra Pradesh", areas: [{ name: "Trunk Road Nellore", slug: "trunk-road-nellore", pincode: "524001" }, { name: "Pogathota", slug: "pogathota", pincode: "524001" }] },
  { cityId: "warangal", cityName: "Warangal", citySlug: "warangal", state: "Telangana", areas: [{ name: "Hanamkonda", slug: "hanamkonda", pincode: "506001" }, { name: "Kazipet", slug: "kazipet", pincode: "506003" }] },
  { cityId: "karimnagar", cityName: "Karimnagar", citySlug: "karimnagar", state: "Telangana", areas: [{ name: "Mukarampura", slug: "mukarampura", pincode: "505001" }, { name: "Tower Circle Karimnagar", slug: "tower-circle-karimnagar", pincode: "505001" }] },
  { cityId: "mangaluru", cityName: "Mangaluru", citySlug: "mangaluru", state: "Karnataka", areas: [{ name: "MG Road Mangalore", slug: "mg-road-mangalore", pincode: "575001" }, { name: "Hampankatta", slug: "hampankatta", pincode: "575001" }] },
  { cityId: "mysuru", cityName: "Mysuru", citySlug: "mysuru", state: "Karnataka", areas: [{ name: "Devaraja Mohalla", slug: "devaraja-mohalla", pincode: "570001" }, { name: "Gokulam Mysuru", slug: "gokulam-mysuru", pincode: "570002" }] },
  { cityId: "hubballi", cityName: "Hubballi", citySlug: "hubballi", state: "Karnataka", areas: [{ name: "Koppikar Road", slug: "koppikar-road", pincode: "580020" }, { name: "Vidyanagar Hubli", slug: "vidyanagar-hubli", pincode: "580021" }] },
  { cityId: "belagavi", cityName: "Belagavi", citySlug: "belagavi", state: "Karnataka", areas: [{ name: "College Road Belgaum", slug: "college-road-belgaum", pincode: "590001" }, { name: "Tilakwadi Belgaum", slug: "tilakwadi-belgaum", pincode: "590006" }] },
  { cityId: "coimbatore", cityName: "Coimbatore", citySlug: "coimbatore", state: "Tamil Nadu", areas: [{ name: "RS Puram", slug: "rs-puram", pincode: "641002" }, { name: "Gandhipuram Coimbatore", slug: "gandhipuram-coimbatore", pincode: "641012" }] },
  { cityId: "karur", cityName: "Karur", citySlug: "karur", state: "Tamil Nadu", areas: [{ name: "Karur Town", slug: "karur-town", pincode: "639001" }, { name: "Sengunthapuram", slug: "sengunthapuram", pincode: "639002" }] },
  { cityId: "madurai", cityName: "Madurai", citySlug: "madurai", state: "Tamil Nadu", areas: [{ name: "Town Hall Road Madurai", slug: "town-hall-road-madurai", pincode: "625001" }, { name: "Anna Nagar Madurai", slug: "anna-nagar-madurai", pincode: "625020" }] },
  { cityId: "tiruchirappalli", cityName: "Tiruchirappalli (Trichy)", citySlug: "tiruchirappalli", state: "Tamil Nadu", areas: [{ name: "Thillai Nagar Trichy", slug: "thillai-nagar-trichy", pincode: "620018" }, { name: "Cantonment Trichy", slug: "cantonment-trichy", pincode: "620001" }] },
  { cityId: "salem", cityName: "Salem", citySlug: "salem", state: "Tamil Nadu", areas: [{ name: "Fairlands Salem", slug: "fairlands-salem", pincode: "636016" }, { name: "Five Roads Salem", slug: "five-roads-salem", pincode: "636004" }] },
  { cityId: "tiruppur", cityName: "Tiruppur", citySlug: "tiruppur", state: "Tamil Nadu", areas: [{ name: "Avinashi Road Tiruppur", slug: "avinashi-road-tiruppur", pincode: "641602" }, { name: "PN Road Tiruppur", slug: "pn-road-tiruppur", pincode: "641602" }] },
  { cityId: "vellore", cityName: "Vellore", citySlug: "vellore", state: "Tamil Nadu", areas: [{ name: "Katpadi Road Vellore", slug: "katpadi-road-vellore", pincode: "632004" }, { name: "Gandhinagar Vellore", slug: "gandhinagar-vellore", pincode: "632006" }] },
  { cityId: "kochi", cityName: "Kochi", citySlug: "kochi", state: "Kerala", areas: [{ name: "MG Road Kochi", slug: "mg-road-kochi", pincode: "682016" }, { name: "Edappally", slug: "edappally", pincode: "682024" }, { name: "Kakkanad", slug: "kakkanad", pincode: "682030" }] },
  { cityId: "thiruvananthapuram", cityName: "Thiruvananthapuram", citySlug: "thiruvananthapuram", state: "Kerala", areas: [{ name: "MG Road Trivandrum", slug: "mg-road-trivandrum", pincode: "695001" }, { name: "Kowdiar", slug: "kowdiar", pincode: "695003" }] },
  { cityId: "kozhikode", cityName: "Kozhikode (Calicut)", citySlug: "kozhikode", state: "Kerala", areas: [{ name: "Mavoor Road Calicut", slug: "mavoor-road-calicut", pincode: "673004" }, { name: "SM Street Calicut", slug: "sm-street-calicut", pincode: "673001" }] },
  { cityId: "thrissur", cityName: "Thrissur", citySlug: "thrissur", state: "Kerala", areas: [{ name: "Swaraj Round Thrissur", slug: "swaraj-round-thrissur", pincode: "680001" }, { name: "MG Road Thrissur", slug: "mg-road-thrissur", pincode: "680004" }] },
  { cityId: "kannur", cityName: "Kannur", citySlug: "kannur", state: "Kerala", areas: [{ name: "Fort Road Kannur", slug: "fort-road-kannur", pincode: "670001" }, { name: "Thana Kannur", slug: "thana-kannur", pincode: "670002" }] },
  { cityId: "puducherry", cityName: "Puducherry", citySlug: "puducherry", state: "Puducherry", areas: [{ name: "Mission Street Puducherry", slug: "mission-street-puducherry", pincode: "605001" }, { name: "Heritage Town Puducherry", slug: "heritage-town-puducherry", pincode: "605001" }] }
];

// REUSABLE GEMSTONE CATALOG ITEMS DATA
const GEMSTONE_CATALOG = [
  { 
    title: "Emerald (Panna)", 
    sub: "Mercury gemstone enhancing intellect, memory & business success.",
    link: "https://gemrishi.com/gemstone/emerald",
    slug: "emerald"
  },
  { 
    title: "Yellow Sapphire (Pukhraj)", 
    sub: "Jupiter blessings for wealth, education & marital harmony.",
    link: "https://gemrishi.com/gemstone/yellow-sapphire",
    slug: "yellow-sapphire"
  },
  { 
    title: "Blue Sapphire (Neelam)", 
    sub: "Powerful Saturn gemstone for rapid professional advancement.",
    link: "https://gemrishi.com/gemstone/blue-sapphire",
    slug: "blue-sapphire"
  },
  { 
    title: "Red Coral (Moonga)", 
    sub: "Mars gemstone for physical courage, stamina & vitality.",
    link: "https://gemrishi.com/gemstone/red-coral",
    slug: "red-coral"
  },
  { 
    title: "Ruby (Manik)", 
    sub: "Sun gemstone conferring leadership, vital health & status.",
    link: "https://gemrishi.com/gemstone/ruby",
    slug: "ruby"
  },
  { 
    title: "Turquoise (Firoza)", 
    sub: "Sacred gemstone bringing spiritual protection & emotional balance.",
    link: "https://gemrishi.com/gemstone/turquoise",
    slug: "turquoise"
  },
  { 
    title: "Natural Pearl (Moti)", 
    sub: "Moon gemstone bringing emotional stability & mental peace.",
    link: "https://gemrishi.com/gemstone/pearl",
    slug: "pearl"
  },
  { 
    title: "White Sapphire (Safed Pukhraj)", 
    sub: "Venus gemstone conferring luxury, artistic flair & charisma.",
    link: "https://gemrishi.com/gemstone/white-sapphire-",
    slug: "white-sapphire-"
  },
  { 
    title: "Hessonite (Gomed)", 
    sub: "Rahu gemstone protecting against obstacles & boosting ambition.",
    link: "https://gemrishi.com/gemstone/hessonite",
    slug: "hessonite"
  },
  { 
    title: "Cats Eye (Lehsuniya)", 
    sub: "Ketu gemstone shielding from unseen risks & enhancing intuition.",
    link: "https://gemrishi.com/gemstone/cats-eye",
    slug: "cats-eye"
  }
];

// SHARED BLOG STYLES TO PREVENT CSS DUPLICATION
const BLOG_STYLES = `
  .gem-blog-container {
    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #ffffff;
    max-width: 1150px;
    margin: 0 auto;
    border-radius: 12px;
    border: 1px solid #cbd5e1;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    overflow: hidden;
  }
  .gem-blog-header-nav {
    padding: 16px 28px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .gem-blog-back-btn {
    background: #264a3f;
    color: #ffffff;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    font-weight: 700;
    font-size: 0.92rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .gem-blog-back-btn:hover {
    background: #1f3d34;
    transform: translateX(-3px);
  }
  .gem-blog-breadcrumb {
    font-size: 0.88rem;
    color: #64748b;
  }
  .gem-blog-breadcrumb span {
    color: #264a3f;
    font-weight: 700;
  }
  .gem-blog-hero {
    background: linear-gradient(135deg, #1f3d34 0%, #264a3f 70%, #173029 100%);
    color: #ffffff;
    padding: 56px 36px;
    text-align: center;
    border-bottom: 4px solid #264a3f;
  }
  .gem-hero-subtitle-badge {
    display: inline-block;
    background: rgba(38, 74, 63, 0.35);
    border: 1px solid #356254;
    color: #d1e5dd;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    margin-bottom: 18px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }
  .gem-hero-h1 {
    font-size: 2.4rem;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 16px;
    line-height: 1.25;
  }
  .gem-hero-h1 span {
    color: #a3cfbb;
    text-decoration: underline;
    text-decoration-color: #264a3f;
  }
  .gem-hero-p {
    font-size: 1.15rem;
    color: #e2e8f0;
    max-width: 840px;
    margin: 0 auto 28px;
    line-height: 1.6;
  }
  .gem-trust-bar {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
  }
  .gem-trust-item {
    font-size: 0.9rem;
    color: #d1e5dd;
    font-weight: 600;
  }
  .gem-blog-main-content {
    padding: 48px 36px;
    line-height: 1.85;
    font-size: 1.08rem;
    color: #334155;
  }
  .gem-section-h2 {
    font-size: 1.75rem;
    font-weight: 800;
    color: #264a3f;
    margin: 40px 0 16px;
    border-left: 5px solid #264a3f;
    padding-left: 16px;
  }
  .gem-paragraph {
    margin-bottom: 22px;
  }
  .gem-city-areas-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    padding: 24px;
    margin: 28px 0 36px;
  }
  .gem-city-areas-box h3 {
    font-size: 1.3rem;
    font-weight: 800;
    color: #264a3f;
    margin-bottom: 16px;
  }
  .gem-areas-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }
  .gem-area-link-btn {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.92rem;
    font-weight: 700;
    color: #264a3f;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .gem-area-link-btn:hover {
    border-color: #264a3f;
    background: #f0f7f4;
    transform: translateY(-2px);
  }
  .gem-highlight-card {
    background: #f0f7f4;
    border: 1px solid #264a3f;
    border-radius: 10px;
    padding: 28px;
    margin: 32px 0;
  }
  .gem-highlight-card h3 {
    color: #264a3f;
    font-size: 1.3rem;
    margin-bottom: 14px;
    font-weight: 800;
  }
  .gem-feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .gem-feature-list li {
    padding: 10px 0;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 1.02rem;
    border-bottom: 1px dashed #e2e8f0;
  }
  .gem-feature-list li:last-child {
    border-bottom: none;
  }
  .gem-feature-list li::before {
    content: "✓";
    color: #264a3f;
    font-weight: 900;
    font-size: 1.2rem;
  }
  .gem-catalog-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin: 28px 0 36px;
  }
  .gem-catalog-card {
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .gem-catalog-card:hover {
    border-color: #264a3f;
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  .gem-catalog-title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #264a3f;
    margin-bottom: 6px;
  }
  .gem-catalog-sub {
    font-size: 0.88rem;
    color: #64748b;
    margin-bottom: 12px;
  }
  .gem-catalog-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: auto;
    padding-top: 8px;
  }
  .gem-catalog-tag {
    display: inline-block;
    background: #f0f7f4;
    color: #264a3f;
    border: 1px solid #264a3f;
    font-size: 0.78rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 4px;
  }
  .gem-catalog-link-text {
    font-size: 0.85rem;
    font-weight: 700;
    color: #264a3f;
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .gem-catalog-card:hover .gem-catalog-link-text {
    text-decoration: underline;
  }
  .gem-faq-section {
    background: #f8fafc;
    border-radius: 10px;
    padding: 32px;
    margin: 40px 0 20px;
    border: 1px solid #e2e8f0;
  }
  .gem-faq-item {
    margin-bottom: 20px;
  }
  .gem-faq-question {
    font-weight: 700;
    color: #264a3f;
    font-size: 1.1rem;
    margin-bottom: 6px;
  }
  .gem-faq-answer {
    color: #475569;
    font-size: 1rem;
  }
  .gem-blog-footer {
    background: linear-gradient(135deg, #f0f7f4 0%, #e0ece7 100%);
    border-top: 2px solid #264a3f;
    padding: 40px 32px;
    text-align: center;
  }
  .gem-footer-h3 {
    font-size: 1.6rem;
    font-weight: 800;
    color: #264a3f;
    margin-bottom: 12px;
  }
  .gem-footer-p {
    color: #475569;
    font-size: 1.05rem;
    margin-bottom: 24px;
  }
  .gem-cta-button {
    background: #264a3f;
    color: #ffffff;
    border: 1px solid #1f3d34;
    padding: 14px 32px;
    font-size: 1.05rem;
    font-weight: 800;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .gem-cta-button:hover {
    background: #1f3d34;
    box-shadow: 0 6px 18px rgba(38, 74, 63, 0.3);
  }
  @media (max-width: 768px) {
    .gem-hero-h1 { font-size: 1.8rem; }
    .gem-blog-main-content { padding: 28px 20px; }
  }
`;

// REUSABLE BLOG ARTICLE VIEW LAYOUT COMPONENT FOR AREA & CITY BLOGS
function BlogArticleLayout({
  metaTitle,
  metaDescription,
  metaKeywords,
  canonicalUrl,
  backAction,
  backBtnText,
  backAriaLabel,
  breadcrumbText,
  heroBadge,
  heroTitle,
  heroHighlightedText,
  heroDescription,
  trustDeliveryText,
  introH2,
  introParagraph,
  matchedShowroom,
  cityAreas,
  openAreaBlog,
  activeCitySlug,
  whyTitle,
  whyItems,
  catalogCount = 10,
  deliveryLocationName,
  faqs,
  orderParagraph,
  footerTitle,
  footerDescription,
  footerCtaText,
  footerCtaAction,
  jsonLdSchema
}) {
  return (
    <div className="gem-blog-container" itemScope itemType="https://schema.org/Article">
      {/* OPTIMIZED SEO META TAGS WITH OPEN GRAPH & TWITTER CARDS */}
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* OPEN GRAPH (OG) TAGS */}
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="GemRishi" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:image" content="https://www.gemrishi.com/logo.png" />
        
        {/* TWITTER CARD TAGS */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://www.gemrishi.com/logo.png" />

        <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
      </Helmet>

      <style>{BLOG_STYLES}</style>

      <nav className="gem-blog-header-nav">
        <button 
          className="gem-blog-back-btn" 
          onClick={backAction} 
          type="button"
          aria-label={backAriaLabel}
        >
          {backBtnText}
        </button>
        <div className="gem-blog-breadcrumb">
          GemRishi / {breadcrumbText}
        </div>
      </nav>

      <header className="gem-blog-hero">
        <div className="gem-hero-subtitle-badge">
          {heroBadge}
        </div>
        <h1 className="gem-hero-h1">
          {heroTitle} <span>{heroHighlightedText}</span>
        </h1>
        <p className="gem-hero-p">{heroDescription}</p>

        <div className="gem-trust-bar">
          <div className="gem-trust-item">✓ Govt. Lab Certified</div>
          <div className="gem-trust-item">✓ {trustDeliveryText}</div>
          <div className="gem-trust-item">✓ Free Vedic Astrologer Consultation</div>
        </div>
      </header>

      <article className="gem-blog-main-content" itemProp="articleBody">
        <h2 className="gem-section-h2">{introH2}</h2>
        <p className="gem-paragraph">{introParagraph}</p>

        {/* SHOWROOM ALERT CARD IF AVAILABLE IN THIS CITY */}
        {matchedShowroom && (
          <div className="gem-highlight-card" style={{ borderColor: '#264a3f', background: '#f8fafc' }}>
            <h3>📍 Visit Our Exclusive Showroom in {matchedShowroom.cityName}:</h3>
            <p style={{ margin: '8px 0' }}><strong>{matchedShowroom.name}</strong> - {matchedShowroom.address}</p>
            <p style={{ margin: '4px 0' }}>📞 Phone: <strong>{matchedShowroom.phone}</strong> | ✉️ Email: {matchedShowroom.email}</p>
          </div>
        )}

        {/* CITY SPECIFIC AREAS LINKS DIRECTORY IF APPLICABLE */}
        {cityAreas && cityAreas.length > 0 && (
          <div className="gem-city-areas-box">
            <h3>Explore Specific Areas in {deliveryLocationName}:</h3>
            <div className="gem-areas-links-grid">
              {cityAreas.map((area) => (
                <button
                  key={area.slug}
                  type="button"
                  className="gem-area-link-btn"
                  onClick={() => openAreaBlog(activeCitySlug, area.slug)}
                >
                  <span>📍 {area.name}</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Blog →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="gem-highlight-card">
          <h3>{whyTitle}</h3>
          <ul className="gem-feature-list">
            {whyItems.map((item, idx) => (
              <li key={idx}><strong>{item.bold}:</strong> {item.text}</li>
            ))}
          </ul>
        </div>

        <h2 className="gem-section-h2">Popular Astrological Gemstones Available in {deliveryLocationName}</h2>
        <p className="gem-paragraph">
          Discover our most requested certified gemstone collection available for immediate dispatch to <strong>{deliveryLocationName}</strong>:
        </p>

        <div className="gem-catalog-grid">
          {GEMSTONE_CATALOG.slice(0, catalogCount).map((gem, idx) => (
            <a
              key={idx}
              href={gem.link}
              className="gem-catalog-card"
            >
              <div>
                <div className="gem-catalog-title">{gem.title}</div>
                <div className="gem-catalog-sub">{gem.sub}</div>
              </div>
              <div className="gem-catalog-footer">
                <span className="gem-catalog-tag">Delivering in {deliveryLocationName}</span>
                <span className="gem-catalog-link-text">Buy Online →</span>
              </div>
            </a>
          ))}
        </div>

        <h2 className="gem-section-h2">Frequently Asked Questions for Buyers in {deliveryLocationName}</h2>
        <div className="gem-faq-section">
          {faqs.map((faq, idx) => (
            <div key={idx} className="gem-faq-item">
              <div className="gem-faq-question">{faq.q}</div>
              <div className="gem-faq-answer">{faq.a}</div>
            </div>
          ))}
        </div>

        <h2 className="gem-section-h2">How to Order Your Certified Gemstone in {deliveryLocationName}</h2>
        <p className="gem-paragraph">{orderParagraph}</p>
      </article>

      <footer className="gem-blog-footer">
        <h3 className="gem-footer-h3">{footerTitle}</h3>
        <p className="gem-footer-p">{footerDescription}</p>
        <button 
          className="gem-cta-button" 
          onClick={footerCtaAction} 
          type="button"
        >
          {footerCtaText}
        </button>
      </footer>
    </div>
  );
}

export default function SeoLocationModule({ customData, title = "Buy Natural Gemstones In Store & PAN India", baseUrl = "/Locations" }) {
  const data = customData || defaultLocationData;
  const navigate = useNavigate();
  const location = useLocation();

  // Active City state (for matrix UI tab toggle)
  const [activeCityId, setActiveCityId] = useState(null);

  const toggleCity = (cityKey) => {
    setActiveCityId((prev) => (prev === cityKey ? null : cityKey));
  };

  // 1. ROUTE / URL PARAMETERS EXTRACTION (handles /Locations/:cityName and /Locations/:cityName/:localityName)
  const { cityName, localityName } = useParams();

  // 2. QUERY PARAMETERS EXTRACTION (handles ?city=ambala&area=nicholson-road)
  const searchParams = new URLSearchParams(location.search);
  const queryCity = searchParams.get('city');
  const queryArea = searchParams.get('area');

  // 3. PATH SEGMENTS EXTRACTION (handles direct URL /Locations/ambala or /Locations/ambala/nicholson-road)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  let pathCity = null;
  let pathArea = null;
  const locIndex = pathSegments.findIndex(s => s.toLowerCase() === 'locations');
  if (locIndex !== -1 && pathSegments.length > locIndex + 1) {
    pathCity = pathSegments[locIndex + 1];
    if (pathSegments.length > locIndex + 2) {
      pathArea = pathSegments[locIndex + 2];
    }
  }

  // Derive target city and area slugs STRICTLY from URL (params, query, or path)
  const targetCitySlug = cityName || queryCity || pathCity || null;
  const targetLocalitySlug = localityName || queryArea || pathArea || null;

  let activeCityData = null;
  let activeArea = null;

  if (targetCitySlug) {
    activeCityData = data.find(c => c.citySlug === targetCitySlug || c.cityId === targetCitySlug);
    if (activeCityData && targetLocalitySlug) {
      activeArea = activeCityData.areas.find(a => a.slug === targetLocalitySlug);
    }
  }

  // Auto-scroll to top whenever URL changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, location.search]);

  // Navigation handlers using standard router navigation
  const openCityBlog = (citySlug) => {
    navigate(`${baseUrl}?city=${citySlug}`);
  };

  const openAreaBlog = (citySlug, areaSlug) => {
    navigate(`${baseUrl}/${citySlug}/${areaSlug}`);
  };

  const resetToDirectory = () => {
    navigate(baseUrl);
  };

  // Build JSON-LD Schema structured data for local showrooms & SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.gemrishi.com/#organization",
        "name": "GemRishi",
        "url": "https://www.gemrishi.com",
        "logo": "https://www.gemrishi.com/logo.png",
        "sameAs": [
          "https://www.facebook.com/gemrishi",
          "https://www.instagram.com/gemrishi"
        ]
      },
      ...showroomsData.map(store => ({
        "@type": "JewelryStore",
        "@id": `https://www.gemrishi.com/#${store.id}`,
        "name": `GemRishi - ${store.name}`,
        "telephone": store.phone,
        "email": store.email,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": store.address,
          "addressCountry": "IN"
        },
        "url": `https://www.gemrishi.com${baseUrl}/${store.citySlug}/${store.areaSlug}`,
        "hasMap": store.directMapLink,
        "priceRange": "$$$",
        "openingHours": "Mo-Su 10:00-20:00"
      }))
    ]
  };

  // ENHANCE JSON-LD SCHEMA WITH BREADCRUMBLIST & FAQPAGE RICH SNIPPETS FOR SEARCH ENGINE RESULTS
  if (activeCityData) {
    const breadcrumbList = [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.gemrishi.com" },
      { "@type": "ListItem", "position": 2, "name": "Locations", "item": `https://www.gemrishi.com${baseUrl}` },
      { "@type": "ListItem", "position": 3, "name": activeCityData.cityName, "item": `https://www.gemrishi.com${baseUrl}/${activeCityData.citySlug}` }
    ];
    if (activeArea) {
      breadcrumbList.push({
        "@type": "ListItem",
        "position": 4,
        "name": activeArea.name,
        "item": `https://www.gemrishi.com${baseUrl}/${activeCityData.citySlug}/${activeArea.slug}`
      });
    }
    jsonLdSchema["@graph"].push({
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbList
    });
  }

  // =========================================================================
  // VIEW 1: SPECIFIC AREA BLOG VIEW (Renders ONLY when a specific area is active)
  // =========================================================================
  if (activeArea && activeCityData) {
    const areaName = activeArea.name;
    const pincode = activeArea.pincode || "133001";
    const currentCityName = activeCityData.cityName || "City";
    const canonicalUrl = `https://www.gemrishi.com${baseUrl}/${activeCityData.citySlug}/${activeArea.slug}`;

    const areaFaqs = [
      {
        q: `Q1: How do I verify the authenticity of gemstones sent to ${areaName}?`,
        a: `Every gemstone sent to ${areaName} includes a physical certificate with a QR code to verify the laboratory test report online.`
      },
      {
        q: `Q2: What is the delivery time for orders in ${areaName}?`,
        a: `Orders to ${areaName} (Pincode ${pincode}) are shipped via insured express courier and arrive within 2 to 4 business days.`
      },
      {
        q: `Q3: Can I get guidance on gemstone wearing methods in ${areaName}?`,
        a: `Yes! Our team provides complete wearing instructions (metal, auspicious day, time, and mantra) for residents in ${areaName}, ${currentCityName}.`
      }
    ];

    // Add FAQPage Schema to JSON-LD
    const areaJsonLd = {
      ...jsonLdSchema,
      "@graph": [
        ...jsonLdSchema["@graph"],
        {
          "@type": "FAQPage",
          "mainEntity": areaFaqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        }
      ]
    };

    return (
      <BlogArticleLayout
        metaTitle={`Buy Certified Natural Gemstones in ${areaName}, ${currentCityName} | GemRishi`}
        metaDescription={`100% Original, Unheated & Untreated Astrological Gemstones delivered to your doorstep in ${areaName}, ${currentCityName} (Pincode: ${pincode}). Govt. Lab Certified Pukhraj, Neelam, Panna, Manik.`}
        metaKeywords={`Buy gemstones in ${areaName}, Gemstone store in ${areaName} ${currentCityName}, Certified Pukhraj ${areaName}, Blue Sapphire Neelam ${currentCityName}, Original Emerald Panna ${areaName}`}
        canonicalUrl={canonicalUrl}
        backAction={() => openCityBlog(activeCityData.citySlug)}
        backBtnText={`← Back to ${currentCityName} City Overview`}
        backAriaLabel={`Back to ${currentCityName} City Page`}
        breadcrumbText={`${currentCityName} / ${areaName}`}
        heroBadge="Govt. Lab Certified Astrological Gemstones"
        heroTitle="Buy Certified Natural Gemstones in"
        heroHighlightedText={`${areaName}, ${currentCityName}`}
        heroDescription={`Explore 100% Original, Unheated & Untreated Astrological Gemstones delivered directly to your doorstep in ${areaName}, ${currentCityName} (Pincode: ${pincode}).`}
        trustDeliveryText={`Doorstep Delivery in ${areaName}`}
        introH2={`Trusted Certified Gemstone Provider Serving ${areaName}, ${currentCityName}`}
        introParagraph={`Are you searching for authentic, 100% natural, lab-certified gemstones in ${areaName}, ${currentCityName}? GemRishi (a venture of 5th-generation jewelers Fateh Chand Bansi Lal) is India’s premier destination for genuine astrological gemstones. Whether you require Emerald (Panna), Yellow Sapphire (Pukhraj), Blue Sapphire (Neelam), Red Coral (Moonga), Ruby (Manik), Turquoise (Firoza), Natural Pearl (Moti), White Sapphire, Hessonite (Gomed), or Cats Eye, every single stone ordered from ${areaName} comes with an authentic test report from recognized government gemological laboratories.`}
        whyTitle={`Why Gemstone Buyers in ${areaName} Trust GemRishi:`}
        whyItems={[
          { bold: "100% Natural, Unheated & Untreated", text: `Pure, unheated gemstones free from synthetic or heat enhancements for customers in ${areaName}.` },
          { bold: "Individual Government Lab Certificate", text: `Verifiable certificate from top gemological labs (GIA, IGI, GII, Govt. Recognized) provided with every purchase in ${areaName}.` },
          { bold: "Express Doorstep Delivery across " + areaName, text: `Insured, tamper-proof courier shipping directly to Pincode ${pincode}.` },
          { bold: "Personalized Astrological Consultation", text: `Exact ratti/carat weight guidance tailored specifically for buyers residing in ${areaName}, ${currentCityName}.` }
        ]}
        catalogCount={10}
        deliveryLocationName={areaName}
        faqs={areaFaqs}
        orderParagraph={`Getting your authentic gemstone in ${areaName} is seamless. Speak with our Vedic astrologers, choose your verified stone, and receive insured doorstep delivery with a 100% money-back guarantee on authenticity in ${areaName}.`}
        footerTitle={`Looking to Buy Certified Gemstones in ${areaName}?`}
        footerDescription={`Get personalized astrological recommendations and authentic lab-tested gemstones delivered to ${areaName}, ${currentCityName}.`}
        footerCtaText={`← Back to ${currentCityName} City Guide`}
        footerCtaAction={() => openCityBlog(activeCityData.citySlug)}
        jsonLdSchema={areaJsonLd}
      />
    );
  }

  // =========================================================================
  // VIEW 2: CITY BLOG VIEW (Renders when CITY NAME is active)
  // =========================================================================
  if (activeCityData && !activeArea) {
    const currentCityName = activeCityData.cityName;
    const currentState = activeCityData.state || "India";
    const cityAreas = activeCityData.areas || [];
    const matchedShowroom = showroomsData.find(s => s.citySlug === activeCityData.citySlug);
    const canonicalUrl = `https://www.gemrishi.com${baseUrl}/${activeCityData.citySlug}`;

    const cityFaqs = [
      {
        q: `Q1: Can I get lab-certified gemstones delivered to ${currentCityName}?`,
        a: `Yes! We deliver government lab-certified gemstones to all pincodes in ${currentCityName}.`
      },
      {
        q: `Q2: How do I verify my gemstone certificate in ${currentCityName}?`,
        a: `Each gemstone comes with an individual lab report containing a QR code and report number for online verification.`
      }
    ];

    // Add FAQPage Schema to JSON-LD
    const cityJsonLd = {
      ...jsonLdSchema,
      "@graph": [
        ...jsonLdSchema["@graph"],
        {
          "@type": "FAQPage",
          "mainEntity": cityFaqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a }
          }))
        }
      ]
    };

    return (
      <BlogArticleLayout
        metaTitle={`Buy Certified Natural Gemstones in ${currentCityName}, ${currentState} | GemRishi`}
        metaDescription={`Buy 100% Original, Unheated & Untreated Astrological Gemstones in ${currentCityName}, ${currentState}. Govt. Lab Certified Pukhraj, Neelam, Panna, Manik with fast delivery across all areas in ${currentCityName}.`}
        metaKeywords={`Buy gemstones in ${currentCityName}, Gemstone store in ${currentCityName}, Certified Pukhraj ${currentCityName}, Blue Sapphire Neelam ${currentCityName}, Original Emerald Panna ${currentCityName}`}
        canonicalUrl={canonicalUrl}
        backAction={resetToDirectory}
        backBtnText="← Back to All Cities & Stores Directory"
        backAriaLabel="Back to main directory"
        breadcrumbText={`Certified Cities / ${currentCityName}`}
        heroBadge="Govt. Laboratory Tested Astrological Gemstones"
        heroTitle="Buy Certified Natural Gemstones in"
        heroHighlightedText={currentCityName}
        heroDescription={`Explore 100% Original, Unheated & Untreated Astrological Gemstones delivered across all localities in ${currentCityName} (${currentState}).`}
        trustDeliveryText={`Doorstep Express Delivery in ${currentCityName}`}
        introH2={`Premier Astrological Gemstone Provider in ${currentCityName}`}
        introParagraph={`Are you looking to buy 100% genuine, unheated, government lab-certified gemstones in ${currentCityName}? GemRishi (backed by 5 generations of trusted jeweler heritage) offers guaranteed authentic Emerald (Panna), Yellow Sapphire (Pukhraj), Blue Sapphire (Neelam), Red Coral (Moonga), Ruby (Manik), Turquoise (Firoza), Natural Pearl (Moti), White Sapphire, Hessonite (Gomed), and Cats Eye to gemstone enthusiasts and astrology believers in ${currentCityName}.`}
        matchedShowroom={matchedShowroom}
        cityAreas={cityAreas}
        openAreaBlog={openAreaBlog}
        activeCitySlug={activeCityData.citySlug}
        whyTitle={`Why Buyers in ${currentCityName} Choose GemRishi:`}
        whyItems={[
          { bold: "100% Unheated & Untreated", text: "Authentic, non-treated Vedic gemstones selected for maximum planetary energy." },
          { bold: "Government Recognized Certification", text: `Verifiable lab report from GIA, IGI, GII, or Govt. Recognized Gem Laboratories sent with every gemstone in ${currentCityName}.` },
          { bold: "Insured Express Delivery across " + currentCityName, text: "Direct delivery to your pincode with tamper-evident packaging." },
          { bold: "Expert Astrological Carat Weight Guidance", text: "Free phone consultation with Vedic astrologers to select your exact Ratti / Carat." }
        ]}
        catalogCount={10}
        deliveryLocationName={currentCityName}
        faqs={cityFaqs}
        orderParagraph={`Ordering your gemstone in ${currentCityName} is fast and secure. Contact our Vedic experts for guidance, choose your lab-certified gemstone, and enjoy doorstep delivery across all localities in ${currentCityName}.`}
        footerTitle={`Order Certified Gemstones in ${currentCityName}`}
        footerDescription={`Speak to our Vedic astrologer team today and get your authentic gemstone delivered in ${currentCityName}.`}
        footerCtaText="← View All Cities Directory"
        footerCtaAction={resetToDirectory}
        jsonLdSchema={cityJsonLd}
      />
    );
  }

  // =========================================================================
  // VIEW 3: MAIN LOCATION & SHOWROOM DIRECTORY (Renders on /Locations)
  // =========================================================================
  return (
    <section className="gem-location-matrix-container">
      {/* OPTIMIZED SEO META TAGS FOR MAIN DIRECTORY */}
      <Helmet>
        <title>Buy Certified Gemstones PAN India | GemRishi</title>
        <meta name="description" content="Visit GemRishi exclusive showrooms in Ambala, Shimla, and Solan or buy 100% certified unheated gemstones PAN India across 140+ cities. Government lab-tested Pukhraj, Neelam, Panna, Manik." />
        <meta name="keywords" content="Gemstone store Ambala, Gemstone store Shimla, Gemstone store Solan, Buy certified gemstones PAN India, Original Pukhraj, Govt certified Neelam, GemRishi showrooms, Certified gemstones 100 cities" />
        <link rel="canonical" href={`https://www.gemrishi.com${baseUrl}`} />
        
        {/* OPEN GRAPH (OG) TAGS */}
        <meta property="og:title" content="Buy Certified Gemstones PAN India | GemRishi" />
        <meta property="og:description" content="Visit GemRishi exclusive showrooms in Ambala, Shimla, and Solan or buy 100% certified unheated gemstones PAN India across 140+ cities." />
        <meta property="og:url" content={`https://www.gemrishi.com${baseUrl}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="GemRishi" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:image" content="https://www.gemrishi.com/logo.png" />
        
        {/* TWITTER CARD TAGS */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Buy Certified Gemstones PAN India | GemRishi" />
        <meta name="twitter:description" content="Visit GemRishi exclusive showrooms or buy 100% certified unheated gemstones PAN India." />
        <meta name="twitter:image" content="https://www.gemrishi.com/logo.png" />

        <script type="application/ld+json">{JSON.stringify(jsonLdSchema)}</script>
      </Helmet>

      <style>{`
        .gem-location-matrix-container {
          font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #ffffff;
          padding: 32px 20px;
          border-radius: 12px;
          max-width: 1320px;
          margin: 0 auto;
        }
        .gem-main-seo-header {
          text-align: center;
          margin-bottom: 36px;
        }
        .gem-location-matrix_heading {
          font-size: 2.2rem;
          font-weight: 800;
          color: #264a3f;
          margin-top: 0;
          margin-bottom: 12px;
        }
        .gem-main-seo-subheading {
          font-size: 1.1rem;
          color: #475569;
          max-width: 840px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .gem-showrooms-section {
          background: linear-gradient(135deg, #f0f7f4 0%, #f8fafc 100%);
          border: 2px solid #264a3f;
          border-radius: 12px;
          padding: 28px 24px;
          margin-bottom: 44px;
          box-shadow: 0 8px 25px rgba(38, 74, 63, 0.06);
        }
        .gem-showrooms-title-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 2px solid #e2e8f0;
        }
        .gem-showrooms-h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #264a3f;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gem-showrooms-badge {
          background: #264a3f;
          color: #d1e5dd;
          font-size: 0.82rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 20px;
          border: 1px solid #356254;
        }
        .gem-showrooms-horizontal-track {
          display: flex;
          flex-direction: row;
          gap: 20px;
          overflow-x: auto;
          padding: 10px 4px 20px;
          scrollbar-width: thin;
          scrollbar-color: #264a3f #f1f5f9;
        }
        .gem-showrooms-horizontal-track::-webkit-scrollbar {
          height: 8px;
        }
        .gem-showrooms-horizontal-track::-webkit-scrollbar-thumb {
          background: #264a3f;
          border-radius: 4px;
        }
        .gem-showroom-card {
          flex: 0 0 320px;
          min-width: 300px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.25s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .gem-showroom-card:hover {
          border-color: #264a3f;
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(38, 74, 63, 0.12);
        }
        .gem-store-tag {
          align-self: flex-start;
          background: #f0f7f4;
          color: #264a3f;
          border: 1px solid #264a3f;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 4px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .gem-store-name-btn {
          font-size: 1.25rem;
          font-weight: 800;
          color: #264a3f;
          background: none;
          border: none;
          padding: 0;
          text-align: left;
          cursor: pointer;
          margin-bottom: 14px;
          display: block;
          line-height: 1.3;
          transition: color 0.2s ease;
        }
        .gem-store-name-btn:hover {
          color: #1f3d34;
          text-decoration: underline;
        }
        .gem-store-detail-row {
          font-size: 0.93rem;
          color: #334155;
          margin-bottom: 10px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          line-height: 1.45;
        }
        .gem-store-detail-row span.icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .gem-store-detail-row a {
          color: #0284c7;
          text-decoration: none;
          font-weight: 600;
        }
        .gem-store-map-wrapper {
          width: 100%;
          height: 150px;
          border-radius: 8px;
          overflow: hidden;
          margin: 14px 0 16px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
        }
        .gem-store-map-iframe {
          width: 100%;
          height: 100%;
          border: 0;
        }
        .gem-store-blog-btn {
          background: #264a3f;
          color: #ffffff;
          border: none;
          padding: 11px 16px;
          border-radius: 6px;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          width: 100%;
          text-align: center;
          transition: all 0.2s ease;
        }
        .gem-store-blog-btn:hover {
          background: #1f3d34;
          box-shadow: 0 4px 14px rgba(38, 74, 63, 0.3);
        }
        .gem-pan-india-section {
          margin-top: 10px;
        }
        .gem-section-header-wrap {
          text-align: center;
          margin-bottom: 24px;
        }
        .gem-pan-india-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #264a3f;
          margin-bottom: 8px;
        }
        .gem-major-cities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
          margin-bottom: 32px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          max-height: 480px;
          overflow-y: auto;
        }
        .gem-city-badge-btn {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #264a3f;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .gem-city-badge-btn:hover {
          background: #264a3f;
          color: #ffffff;
          border-color: #264a3f;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(38, 74, 63, 0.15);
        }
        .gem-horizontal-cities {
          display: flex;
          flex-direction: row;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 12px;
          margin-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
        }
        .gem-city-tab {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          color: #264a3f;
          padding: 12px 20px;
          font-size: 1.02rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .gem-city-tab:hover {
          border-color: #264a3f;
          background: #f8fafc;
        }
        .gem-city-tab.is-active {
          background: #264a3f;
          color: #ffffff;
          border-color: #264a3f;
        }
        .gem-areas-container {
          background: #ffffff;
          padding: 8px 0;
        }
        .gem-city-areas-group.hidden-visually {
          display: none;
        }
        .gem-areas-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .gem-location-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          transition: all 0.2s ease;
        }
        .gem-location-card:hover {
          border-color: #264a3f;
          background-color: #f0f7f4;
        }
        .gem-location-card_link {
          display: block;
          padding: 12px 16px;
          color: #264a3f;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          word-break: break-word;
        }
        .gem-location-card_link:hover {
          color: #264a3f;
          text-decoration: underline;
        }
        @media (max-width: 1024px) {
          .gem-areas-grid { grid-template-columns: repeat(2, 1fr); }
          .gem-showroom-card { flex: 0 0 280px; }
        }
        @media (max-width: 640px) {
          .gem-areas-grid { grid-template-columns: 1fr; }
          .gem-location-matrix_heading { font-size: 1.6rem; }
          .gem-showroom-card { flex: 0 0 85vw; }
        }
      `}</style>

      {/* MAIN SEO HEADER */}
      <header className="gem-main-seo-header">
        <h1 className="gem-location-matrix_heading">{title}</h1>
        <p className="gem-main-seo-subheading">
          Visit GemRishi exclusive showrooms or buy 100% natural, unheated & government lab-certified astrological gemstones delivered to your location PAN India.
        </p>
      </header>

      {/* 4 EXCLUSIVE SHOWROOMS IN HORIZONTAL FORM */}
      <section className="gem-showrooms-section">
        <div className="gem-showrooms-title-container">
          <h2 className="gem-showrooms-h2">📍 Our Exclusive Offline Showrooms</h2>
          <span className="gem-showrooms-badge">Visit In Store</span>
        </div>

        <div className="gem-showrooms-horizontal-track">
          {showroomsData.map((store) => (
            <article key={store.id} className="gem-showroom-card">
              <div>
                <span className="gem-store-tag">{store.badge}</span>
                <button
                  type="button"
                  className="gem-store-name-btn"
                  onClick={() => openCityBlog(store.citySlug)}
                  title={`Open ${store.cityName} Gemstone Store Blog`}
                >
                  {store.name}
                </button>

                <div className="gem-store-detail-row">
                  <span className="icon">📍</span>
                  <div>{store.address}</div>
                </div>
                <div className="gem-store-detail-row">
                  <span className="icon">📞</span>
                  <a href={`tel:${store.phone.replace(/\s+/g, '')}`}>{store.phone}</a>
                </div>
                <div className="gem-store-detail-row">
                  <span className="icon">✉️</span>
                  <a href={`mailto:${store.email}`}>{store.email}</a>
                </div>
              </div>

              <div className="gem-store-map-wrapper">
                <iframe
                  title={`Google Map - ${store.name}`}
                  className="gem-store-map-iframe"
                  src={store.mapUrl}
                  loading="lazy"
                  allowFullScreen
                />
              </div>

              <button
                type="button"
                className="gem-store-blog-btn"
                onClick={() => openCityBlog(store.citySlug)}
              >
                Read {store.cityName} City & Store Blog →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* BUY CERTIFIED GEMSTONES PAN INDIA & 140+ MAJOR CITIES */}
      <section className="gem-pan-india-section">
        <div className="gem-section-header-wrap">
          <h2 className="gem-pan-india-title">Buy Natural Gemstones PAN India – Delivered to Your Doorstep</h2>
        </div>

        {/* 140+ CITIES QUICK BADGES DIRECTORY */}
        <div className="gem-major-cities-grid">
          {data.map((city) => (
            <button
              key={city.cityId || city.citySlug}
              type="button"
              className="gem-city-badge-btn"
              onClick={() => openCityBlog(city.citySlug)}
              title={`Open ${city.cityName} Gemstone Blog`}
            >
              📍 {city.cityName}
            </button>
          ))}
        </div>

        {/* CITY TABS SELECTOR */}
        <div className="gem-horizontal-cities" role="tablist">
          {data.slice(0, 30).map((cityGroup, idx) => {
            const cityKey = cityGroup.cityId || cityGroup.citySlug || idx;
            const isActive = cityKey === activeCityId;

            return (
              <button
                key={cityKey}
                className={`gem-city-tab ${isActive ? 'is-active' : ''}`}
                onClick={() => toggleCity(cityKey)}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${cityKey}`}
              >
                {cityGroup.cityName || cityGroup.city}
              </button>
            );
          })}
        </div>

        {/* CITY LOCALITIES MATRIX */}
        <div className="gem-areas-container">
          {data.slice(0, 30).map((cityGroup, idx) => {
            const cityKey = cityGroup.cityId || cityGroup.citySlug || idx;
            const isActive = cityKey === activeCityId;
            const areas = cityGroup.areas || [];

            return (
              <div
                key={cityKey}
                id={`panel-${cityKey}`}
                role="tabpanel"
                className={`gem-city-areas-group ${isActive ? '' : 'hidden-visually'}`}
              >
                <div className="gem-areas-grid">
                  {areas.map((area) => (
                    <div key={area.slug} className="gem-location-card">
                      <Link
                        to={`${baseUrl}/${cityGroup.citySlug || 'location'}/${area.slug}`}
                        className="gem-location-card_link"
                      >
                        Buy Gemstones in {area.name} ({cityGroup.cityName})
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
}