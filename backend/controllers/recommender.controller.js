import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
import { sendEmail } from "../utils/sendEmails.js";
import { GemLead } from "../models/gemLead.model.js";
import {
	recommendGemstoneFromBirthDetails,
	getBirthstone,
	getRashiGemstone,
} from "../utils/recommendHelper.js";
import { sendMetaCapiEvent } from "../utils/metacapi.js";

function parseTime(hour, minute, ampm) {
	let h = parseInt(hour, 10);
	let m = parseInt(minute, 10);

	if (isNaN(h) || isNaN(m)) {
		throw new Error("Invalid time provided");
	}

	// Convert 12-hour format to 24-hour
	if (ampm === "PM" && h !== 12) h += 12;
	if (ampm === "AM" && h === 12) h = 0;

	return [h, m, 0];
}

export async function recommend(req, res) {
	try {
		const {
			name,
			email,
			phone,
			gender,
			purpose,
			budget,
			placeOfBirth,
			country,
			chartStyle,
			dob,
			tob,
		} = req.body;

		// ✅ Validation
		if (!name || !dob || !tob || !placeOfBirth) {
			return res.status(400).json({
				success: false,
				message:
					"Name, Date of Birth, Time of Birth, and Place of Birth are required.",
			});
		}

		// 🗺️ Fetch coordinates using OpenCage API
		const geoApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
			placeOfBirth
		)}&key=${process.env.OPENCAGE_API_KEY}`;

		const { data: geoData } = await axios.get(geoApiUrl);
		if (!geoData.results?.length) {
			return res.status(400).json({
				success: false,
				message: "Invalid city or unable to fetch coordinates.",
			});
		}

		const { lat: latitude, lng: longitude } = geoData.results[0].geometry;

		// 📅 Prepare birth date
		// 📅 Prepare birth date
		const { day, month, year } = dob;
		const [hour, minute, second] = parseTime(tob.hour, tob.minute, tob.ampm);

		// ✅ THE FIX: Force the Date string to include the IST offset (+05:30)
		// This guarantees the server calculates the exact same moment as your local computer
		const formattedMonth = String(month).padStart(2, '0');
		const formattedDay = String(day).padStart(2, '0');
		const formattedHour = String(hour).padStart(2, '0');
		const formattedMinute = String(minute).padStart(2, '0');

		const isoString = `${year}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}:00+05:30`;
		const birthDate = new Date(isoString);

		// Calculate timezone offset (in hours)
		const timezoneOffset = birthDate.getTimezoneOffset() / 60;

		// 🌕 Astrology recommendations
		const {
			rashi: janmaRashi,
			gemstone: gemstoneFromMoonSign,
			moonLongitude,
		} = recommendGemstoneFromBirthDetails(birthDate, longitude, latitude);

		const firstLetter = name.trim()[0].toUpperCase();
		const gemstoneFromNameLetter = getRashiGemstone(firstLetter);
		const birthstoneByMonth = getBirthstone(parseInt(month));

		const emailHtml = `
			<h2>New Gemstone Suggestion Request</h2>
			<table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse; font-family:Arial, sans-serif;">
				<tr><td><strong>Name</strong></td><td>${name}</td></tr>
				<tr><td><strong>Email</strong></td><td>${email || "N/A"}</td></tr>
				<tr><td><strong>Phone</strong></td><td>${phone || "N/A"}</td></tr>
				<tr><td><strong>Gender</strong></td><td>${gender || "N/A"}</td></tr>
				<tr><td><strong>Purpose</strong></td><td>${purpose || "N/A"}</td></tr>
				<tr><td><strong>Budget</strong></td><td>${budget || "N/A"}</td></tr>
				<tr><td><strong>Chart Style</strong></td><td>${chartStyle || "N/A"}</td></tr>
				<tr><td><strong>Country</strong></td><td>${country || "N/A"}</td></tr>
				<tr><td><strong>Place of Birth</strong></td><td>${placeOfBirth}</td></tr>
				<tr><td><strong>Date of Birth</strong></td><td>${dob.day}/${dob.month}/${dob.year}</td></tr>
				<tr><td><strong>Time of Birth</strong></td><td>${tob.hour}:${tob.minute} ${tob.ampm}</td></tr>
				<tr><td><strong>Latitude</strong></td><td>${latitude}</td></tr>
				<tr><td><strong>Longitude</strong></td><td>${longitude}</td></tr>
				<tr><td><strong>Moon Rashi</strong></td><td>${janmaRashi}</td></tr>
				<tr><td><strong>Moon Sign Gemstone</strong></td><td>${gemstoneFromMoonSign}</td></tr>
				<tr><td><strong>Name Letter Gemstone</strong></td><td>${gemstoneFromNameLetter}</td></tr>
				<tr><td><strong>Birth Month Gemstone</strong></td><td>${birthstoneByMonth}</td></tr>
			</table>
		`;

		try {
			await sendEmail({
				to: "orders@gemrishi.com",
				subject: `New Gemstone Suggestion from ${name}`,
				html: emailHtml,
			});
		} catch (emailError) {
			console.error("Gemstone suggestion email failed:", emailError);
		}

		return res.status(200).json({
			success: true,
			data: {
				name,
				email,
				phone,
				gender,
				purpose,
				budget,
				placeOfBirth,
				country,
				chartStyle,
				dob,
				tob,
				latitude,
				longitude,
				janmaRashi,
				gemstoneFromMoonSign,
				gemstoneFromNameLetter,
				birthstoneByMonth,
				moonLongitude,
			},
		});
	} catch (error) {
		console.error("Error in recommend:", error);
		return res.status(500).json({
			success: false,
			message: "Internal Server Error",
		});
	}
}

/**
 * Save Vedic Gemstone Lead, Save PDF, and Auto-Email orders@gemrishi.com with Quick Call/WhatsApp Buttons & Sheet Link
 */
export async function saveLeadSuggestion(req, res) {
	try {
		const {
			reportId,
			name,
			phone,
			email,
			gender,
			dob,
			time,
			unknownTime,
			place,
			latitude,
			longitude,
			weightKg,
			budgetTier,
			focus,
			lagnaSign,
			moonSign,
			mahadasha,
			antardasha,
			primaryPlanet,
			primaryStone,
			primaryPurpose,
			secondaryPlanet,
			secondaryStone,
			secondaryPurpose,
			classification,
			recommendedCarats,
			recommendedRatti,
			wearingFinger,
			wearingDay,
			metal,
			mantra,
			pdfBase64,
		} = req.body;

		const safeReportId = (reportId || `GR-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "");
		const customerName = name || "Valued Customer";

		// 1. Process & Save PDF if provided
		let pdfBuffer = null;
		let pdfUrl = "";
		let pdfFilePath = "";

		if (pdfBase64 && typeof pdfBase64 === "string") {
			try {
				const base64Content = pdfBase64.includes(";base64,")
					? pdfBase64.split(";base64,")[1]
					: pdfBase64;
				pdfBuffer = Buffer.from(base64Content, "base64");

				const reportsDir = path.join(process.cwd(), "public", "uploads", "reports");
				if (!fs.existsSync(reportsDir)) {
					fs.mkdirSync(reportsDir, { recursive: true });
				}

				const fileName = `${safeReportId}-GemRishi-Vedic-Dossier.pdf`;
				pdfFilePath = path.join(reportsDir, fileName);
				fs.writeFileSync(pdfFilePath, pdfBuffer);

				const baseUrl = (process.env.BACKEND_URL || "https://api.gemrishi.com").replace(/\/+$/, "");
				pdfUrl = `${baseUrl}/public/uploads/reports/${fileName}`;
			} catch (pdfSaveErr) {
				console.error("Failed saving dossier PDF to disk:", pdfSaveErr);
			}
		}

		// 2. Persist Lead in MongoDB datewise
		let leadDoc = await GemLead.findOne({ reportId: safeReportId });
		if (!leadDoc) {
			leadDoc = new GemLead({
				reportId: safeReportId,
				name: customerName,
				phone: phone || "",
				email: email || "",
				gender: gender || "",
				dob: dob || "",
				time: unknownTime ? "" : (time || ""),
				unknownTime: Boolean(unknownTime),
				place: place || "",
				latitude: latitude || null,
				longitude: longitude || null,
				weightKg: weightKg || "",
				budgetTier: budgetTier || "",
				focus: focus || "",
				lagnaSign: lagnaSign || "",
				moonSign: moonSign || "",
				mahadasha: mahadasha || "",
				antardasha: antardasha || "",
				primaryPlanet: primaryPlanet || "",
				primaryStone: primaryStone || "",
				primaryPurpose: primaryPurpose || "",
				secondaryPlanet: secondaryPlanet || "",
				secondaryStone: secondaryStone || "",
				secondaryPurpose: secondaryPurpose || "",
				classification: classification || "",
				recommendedCarats: recommendedCarats || "",
				recommendedRatti: recommendedRatti || "",
				wearingFinger: wearingFinger || "",
				wearingDay: wearingDay || "",
				metal: metal || "",
				mantra: mantra || "",
				pdfUrl: pdfUrl || "",
				pdfPath: pdfFilePath || "",
			});
			await leadDoc.save();

			sendMetaCapiEvent({
				eventName: "Lead",
				eventId: safeReportId || `lead_${Date.now()}`,
				eventSourceUrl: req.body?.eventSourceUrl || req.body?.metaContext?.eventSourceUrl || req.headers.referer || "https://gemrishi.com/suggest",
				userData: {
					email: email || undefined,
					phone: phone || undefined,
					firstName: customerName,
					city: place || undefined,
					clientIp: req.ip || req.headers["x-forwarded-for"],
					userAgent: req.headers["user-agent"],
					fbp: req.body?.metaContext?.fbp,
					fbc: req.body?.metaContext?.fbc,
				},
				customData: {
					content_name: "Gemstone Recommendation Consultation",
					content_category: primaryStone ? `${primaryStone} Gemstone` : "Natural Gemstone",
				},
			});
		} else if (pdfUrl) {
			leadDoc.pdfUrl = pdfUrl;
			leadDoc.pdfPath = pdfFilePath;
			await leadDoc.save();
		}

		// Optional: Direct webhook dispatch to Google Sheet if GOOGLE_SHEET_WEBHOOK_URL is configured
		if (process.env.GOOGLE_SHEET_WEBHOOK_URL) {
			try {
				const sheetPayload = {
					date: new Date().toLocaleDateString("en-IN"),
					time: new Date().toLocaleTimeString("en-IN"),
					reportId: safeReportId,
					name: customerName,
					phone: phone || "",
					email: email || "",
					gender: gender || "",
					dob: dob || "",
					birthTime: unknownTime ? "Unknown" : (time || ""),
					place: place || "",
					weightKg: weightKg || "",
					budgetTier: budgetTier || "",
					focus: focus || "",
					primaryStone: primaryStone || "",
					primaryPlanet: primaryPlanet || "",
					classification: classification || "",
					recommendedCarats: recommendedCarats || "",
					recommendedRatti: recommendedRatti || "",
					wearingFinger: wearingFinger || "",
					wearingDay: wearingDay || "",
					metal: metal || "",
					mantra: mantra || "",
					pdfUrl: pdfUrl || "",
				};
				await axios.post(process.env.GOOGLE_SHEET_WEBHOOK_URL, sheetPayload, { timeout: 4000 }).catch(() => {});
			} catch (webhookErr) {
				console.warn("Google Sheet Webhook note:", webhookErr.message);
			}
		}

		// 3. Format Phone Numbers for 1-Click Call & WhatsApp Buttons
		const rawPhone = (phone || "").trim();
		const cleanDigits = rawPhone.replace(/\D/g, "");
		const telNumber = cleanDigits ? `+${cleanDigits}` : "";
		// For WhatsApp: if standard 10 digit Indian number without country code, prepend 91
		const waNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
		const waGreeting = encodeURIComponent(
			`Hi ${customerName}, thank you for your gemstone consultation on GemRishi! Your certified primary Vedic match is ${primaryStone || "ready"}. How may we assist you with natural certified options today?`
		);

		const apiDomain = process.env.DOMAIN_NAME || "https://api.gemrishi.com";
		const liveSheetUrl = `${apiDomain}/api/v1/recommended/leads-export`;
		const liveDashboardUrl = `${apiDomain}/api/v1/recommended/leads-view`;

		// 4. Construct Rich Responsive Email HTML
		const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Vedic Gemstone Match Lead</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #F4F8F6; margin: 0; padding: 24px; color: #1C332B;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 660px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; border: 1px solid #DCE7E1; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
    
    <!-- BRAND HEADER -->
    <tr>
      <td style="background-color: #264A3F; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; letter-spacing: 0.5px; font-weight: 700;">GEMRISHI</h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #8FC7AE; text-transform: uppercase; letter-spacing: 1.2px;">Certified Vedic Gemstone Recommendation Lead</p>
      </td>
    </tr>

    <!-- QUICK ACTION BUTTONS -->
    <tr>
      <td style="padding: 22px 20px; text-align: center; background: #EAFBEF; border-bottom: 1px solid #BFE9CC;">
        <div style="font-size: 15px; font-weight: bold; margin-bottom: 14px; color: #142E27;">⚡ Instant Customer Contact Buttons:</div>
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            ${cleanDigits ? `
            <td style="padding: 0 6px;">
              <a href="tel:${telNumber}" style="display: inline-block; background-color: #198754; color: #ffffff; padding: 13px 22px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; box-shadow: 0 2px 6px rgba(25,135,84,0.3);">
                📞 Call Customer (${rawPhone})
              </a>
            </td>
            <td style="padding: 0 6px;">
              <a href="https://wa.me/${waNumber}?text=${waGreeting}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; padding: 13px 22px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; box-shadow: 0 2px 6px rgba(37,211,102,0.3);">
                💬 Chat on WhatsApp
              </a>
            </td>
            ` : `
            <td>
              <span style="color: #777; font-size: 14px;">(No phone number was entered by user)</span>
            </td>
            `}
          </tr>
        </table>
      </td>
    </tr>

    <!-- LEAD & ASTROLOGY DETAILS -->
    <tr>
      <td style="padding: 24px;">
        
        <!-- RECOMMENDED STONES CALLOUT (PRIMARY & SECONDARY) -->
        <div style="background: #F3F8F5; border: 2px solid #2F8F6B; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 12px; color: #2F8F6B; font-weight: bold; text-transform: uppercase; letter-spacing: 0.8px;">Vedic Gemstone Recommendations</div>
          
          <div style="margin-top: 10px; padding-bottom: 12px; border-bottom: 1px dashed #DCE7E1;">
            <span style="background: #EAFBEF; color: #1F7A44; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Primary Stone</span>
            <div style="font-size: 20px; font-weight: bold; color: #142E27; margin: 4px 0 4px;">💎 ${primaryStone || "Gemstone Recommendation"}</div>
            <div style="font-size: 13px; color: #264A3F;">
              Ruling Planet: <b>${primaryPlanet || "N/A"}</b> &nbsp;&bull;&nbsp; Classification: <b>${classification || "Benefic"}</b>
            </div>
            ${primaryPurpose ? `<div style="font-size: 12.5px; color: #1C332B; margin-top: 4px; background: #fff; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #2F8F6B;"><b>Purpose:</b> ${primaryPurpose}</div>` : ""}
          </div>

          ${secondaryStone ? `
          <div style="margin-top: 12px; padding-bottom: 12px; border-bottom: 1px dashed #DCE7E1;">
            <span style="background: #EDF4F1; color: #355E50; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Secondary Stone</span>
            <div style="font-size: 20px; font-weight: bold; color: #142E27; margin: 4px 0 4px;">✨ ${secondaryStone}</div>
            <div style="font-size: 13px; color: #264A3F;">
              Ruling Planet: <b>${secondaryPlanet || "N/A"}</b>
            </div>
            ${secondaryPurpose ? `<div style="font-size: 12.5px; color: #1C332B; margin-top: 4px; background: #fff; padding: 6px 10px; border-radius: 4px; border-left: 3px solid #6E9B85;"><b>Purpose:</b> ${secondaryPurpose}</div>` : ""}
          </div>
          ` : ""}

          <div style="font-size: 13.5px; color: #264A3F; margin-top: 10px;">
            Recommended Weight: <b>${recommendedCarats || "N/A"} Carats (${recommendedRatti || "N/A"} Ratti)</b> (for both stones)
          </div>
        </div>

        <h3 style="margin-top: 0; color: #264A3F; border-bottom: 2px solid #2F8F6B; padding-bottom: 8px; font-size: 16px;">👤 Customer Profile</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr style="background: #fafafa;"><td width="35%"><strong>Customer Name</strong></td><td><strong>${customerName}</strong></td></tr>
          <tr><td><strong>Phone / WhatsApp</strong></td><td><a href="tel:${telNumber}" style="color: #198754; font-weight: bold;">${rawPhone || "Not provided"}</a></td></tr>
          <tr style="background: #fafafa;"><td><strong>Email</strong></td><td>${email ? `<a href="mailto:${email}" style="color: #264A3F;">${email}</a>` : "Not provided"}</td></tr>
          <tr><td><strong>Gender</strong></td><td>${gender ? gender.toUpperCase() : "N/A"}</td></tr>
          <tr style="background: #fafafa;"><td><strong>Date of Birth</strong></td><td>${dob || "N/A"}</td></tr>
          <tr><td><strong>Time of Birth</strong></td><td>${unknownTime ? "Time Unknown (Solar Ascendant Used)" : (time || "N/A")}</td></tr>
          <tr style="background: #fafafa;"><td><strong>Place of Birth</strong></td><td>${place || "N/A"}</td></tr>
          <tr><td><strong>Body Weight</strong></td><td>${weightKg ? `${weightKg} kg` : "N/A"}</td></tr>
          <tr style="background: #fafafa;"><td><strong>Budget Tier</strong></td><td>${budgetTier || "N/A"}</td></tr>
          <tr><td><strong>Focus Area</strong></td><td>${focus || "Overall Fortune"}</td></tr>
        </table>

        <h3 style="color: #264A3F; border-bottom: 2px solid #2F8F6B; padding-bottom: 8px; font-size: 16px;">📜 Astrological Specifications</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tr style="background: #fafafa;"><td width="35%"><strong>Wearing Finger</strong></td><td>${wearingFinger || "N/A"}</td></tr>
          <tr><td><strong>Wearing Day / Time</strong></td><td>${wearingDay || "N/A"}</td></tr>
          <tr style="background: #fafafa;"><td><strong>Recommended Metal</strong></td><td>${metal || "N/A"}</td></tr>
          <tr><td><strong>Consecration Mantra</strong></td><td><i>${mantra || "N/A"}</i></td></tr>
          <tr style="background: #fafafa;"><td><strong>Lagna (Ascendant)</strong></td><td>${lagnaSign || "N/A"}</td></tr>
          <tr><td><strong>Moon Sign (Rashi)</strong></td><td>${moonSign || "N/A"}</td></tr>
          <tr style="background: #fafafa;"><td><strong>Mahadasha & Antardasha</strong></td><td>${mahadasha ? `${mahadasha} / ${antardasha || ""}` : "N/A"}</td></tr>
        </table>

        <!-- GOOGLE SHEET LIVE SYNC & CSV LINK -->
        <div style="background: #F3F8F5; border: 1px solid #DCE7E1; border-radius: 8px; padding: 18px; margin-top: 24px;">
          <h4 style="margin: 0 0 8px; color: #264A3F; font-size: 15px;">📊 Google Sheet Live Sync Formula</h4>
          <p style="margin: 0 0 10px; font-size: 13px; color: #4C7C68;">
            Paste this formula into <b>Cell A1</b> of any Google Sheet to automatically fetch and sync all leads datewise:
          </p>
          <div style="background: #ffffff; border: 1px dashed #2F8F6B; padding: 10px 14px; font-family: monospace; font-size: 12px; color: #142E27; border-radius: 4px; word-break: break-all;">
            =IMPORTDATA("${liveSheetUrl}")
          </div>
          <div style="margin-top: 12px; font-size: 13px;">
            🔗 <a href="${liveSheetUrl}" target="_blank" style="color: #2F8F6B; font-weight: bold; text-decoration: none;">Download Datewise CSV</a> &nbsp;&bull;&nbsp;
            🔗 <a href="${liveDashboardUrl}" target="_blank" style="color: #2F8F6B; font-weight: bold; text-decoration: none;">Open Web Leads Dashboard</a>
            ${pdfUrl ? `&nbsp;&bull;&nbsp; 📄 <a href="${pdfUrl}" target="_blank" style="color: #2F8F6B; font-weight: bold; text-decoration: none;">View Attached 2-Page PDF</a>` : ""}
          </div>
        </div>

      </td>
    </tr>

    <!-- FOOTER -->
    <tr>
      <td style="background-color: #fafafa; border-top: 1px solid #EAEAEA; padding: 16px; text-align: center; font-size: 12px; color: #888888;">
        Dossier #${safeReportId} &bull; Generated automatically by GemRishi Vedic Suggestion Engine &bull; Confidential Lead Data
      </td>
    </tr>
  </table>
</body>
</html>
`;

		// 5. Send Notification Email to orders@gemrishi.com with PDF Attachment
		const attachments = [];
		if (pdfBuffer) {
			attachments.push({
				filename: `${safeReportId}-GemRishi-Vedic-Dossier.pdf`,
				content: pdfBuffer,
				contentType: "application/pdf",
			});
		}

		try {
			await sendEmail({
				to: "orders@gemrishi.com",
				subject: `✨ New Gemstone Match: ${customerName} — ${primaryStone || "Recommendation"} (${rawPhone || "Lead"})`,
				html: emailHtml,
				attachments,
			});
		} catch (mailErr) {
			console.error("Auto lead notification email failed:", mailErr.message);
		}

		return res.status(200).json({
			success: true,
			message: "Lead recorded and notification sent to orders@gemrishi.com successfully.",
			leadId: leadDoc._id,
			pdfUrl,
		});
	} catch (error) {
		console.error("Error in saveLeadSuggestion:", error);
		return res.status(500).json({
			success: false,
			message: "Failed to process lead suggestion",
			error: error.message,
		});
	}
}

/**
 * Export all Gemstone Leads as CSV for Google Sheet live sync (=IMPORTDATA)
 */
export async function exportLeadsCsv(req, res) {
	try {
		const leads = await GemLead.find().sort({ createdAt: -1 });

		const headers = [
			"Date",
			"Time",
			"Report ID",
			"Customer Name",
			"Phone",
			"Email",
			"Gender",
			"DOB",
			"Birth Time",
			"Birth Place",
			"Weight (kg)",
			"Budget Tier",
			"Focus Area",
			"Primary Gemstone",
			"Primary Ruling Planet",
			"Primary Purpose",
			"Secondary Gemstone",
			"Secondary Ruling Planet",
			"Secondary Purpose",
			"Classification",
			"Recommended Carats",
			"Recommended Ratti",
			"Wearing Finger",
			"Wearing Day",
			"Metal",
			"Puja Mantra",
			"Lagna Sign",
			"Moon Sign",
			"Mahadasha",
			"Antardasha",
			"PDF URL",
			"Call Status",
			"Call Notes",
			"Last Call Update",
		];

		const escapeCsv = (val) => {
			if (val === null || val === undefined) return '""';
			const str = String(val).replace(/"/g, '""');
			return `"${str}"`;
		};

		let csvContent = headers.map(escapeCsv).join(",") + "\r\n";

		leads.forEach((l) => {
			const d = new Date(l.createdAt);
			const dateStr = d.toLocaleDateString("en-IN");
			const timeStr = d.toLocaleTimeString("en-IN");

			const row = [
				dateStr,
				timeStr,
				l.reportId || "",
				l.name || "",
				l.phone || "",
				l.email || "",
				l.gender || "",
				l.dob || "",
				l.unknownTime ? "Unknown" : (l.time || ""),
				l.place || "",
				l.weightKg || "",
				l.budgetTier || "",
				l.focus || "",
				l.primaryStone || "",
				l.primaryPlanet || "",
				l.primaryPurpose || "",
				l.secondaryStone || "",
				l.secondaryPlanet || "",
				l.secondaryPurpose || "",
				l.classification || "",
				l.recommendedCarats || "",
				l.recommendedRatti || "",
				l.wearingFinger || "",
				l.wearingDay || "",
				l.metal || "",
				l.mantra || "",
				l.lagnaSign || "",
				l.moonSign || "",
				l.mahadasha || "",
				l.antardasha || "",
				l.pdfUrl || "",
				l.callStatus || "New",
				l.callNotes || "",
				l.lastCallUpdate ? new Date(l.lastCallUpdate).toLocaleString("en-IN") : "",
			];
			csvContent += row.map(escapeCsv).join(",") + "\r\n";
		});

		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", "attachment; filename=gemrishi-leads-datewise.csv");
		res.setHeader("Access-Control-Allow-Origin", "*");
		return res.status(200).send(csvContent);
	} catch (error) {
		console.error("Error exporting leads CSV:", error);
		return res.status(500).send("Error generating leads export.");
	}
}

/**
 * Helper to escape HTML characters in strings
 */
function escapeHtml(text) {
	if (!text) return "";
	return String(text)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

/**
 * Update Call Status and Notes for a Lead (Called by telecaller on dashboard)
 */
export async function updateLeadCallStatus(req, res) {
	try {
		const { leadId, callStatus, callNotes } = req.body;
		if (!leadId) {
			return res.status(400).json({ success: false, message: "leadId is required" });
		}

		const lead = await GemLead.findById(leadId);
		if (!lead) {
			return res.status(404).json({ success: false, message: "Lead not found" });
		}

		if (callStatus !== undefined) lead.callStatus = String(callStatus).trim();
		if (callNotes !== undefined) lead.callNotes = String(callNotes).trim();
		lead.lastCallUpdate = new Date();
		await lead.save();

		return res.status(200).json({
			success: true,
			message: "Call update saved successfully",
			lead: {
				_id: lead._id,
				callStatus: lead.callStatus,
				callNotes: lead.callNotes,
				lastCallUpdate: lead.lastCallUpdate,
			},
		});
	} catch (error) {
		console.error("Error updating lead call status:", error);
		return res.status(500).json({ success: false, message: "Failed to update lead status", error: error.message });
	}
}

/**
 * Web View for Leads Dashboard with Call, WhatsApp, and Call Person Update Block
 */
export async function viewLeadsDashboard(req, res) {
	try {
		const leads = await GemLead.find().sort({ createdAt: -1 });
		const apiDomain = process.env.DOMAIN_NAME || "https://api.gemrishi.com";
		const liveSheetUrl = `${apiDomain}/api/v1/recommended/leads-export`;

		// Metrics
		let countNew = 0, countInterested = 0, countCallBack = 0, countOrder = 0, countNoAnswer = 0, countNotInterested = 0;
		leads.forEach((l) => {
			const s = l.callStatus || "New";
			if (s === "New") countNew++;
			else if (s === "Interested") countInterested++;
			else if (s === "Call Back Later") countCallBack++;
			else if (s === "Order Placed") countOrder++;
			else if (s === "Ringing / No Answer") countNoAnswer++;
			else if (s === "Not Interested") countNotInterested++;
		});

		const rowsHtml = leads
			.map((l, index) => {
				const d = new Date(l.createdAt);
				const dateStr = `${d.toLocaleDateString("en-IN")}<br/><span style="color:#888; font-size:11px;">${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>`;
				const cleanDigits = (l.phone || "").replace(/\D/g, "");
				const waNumber = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
				const currentStatus = l.callStatus || "New";
				const currentNotes = l.callNotes || "";
				const lastUpdatedStr = l.lastCallUpdate
					? `Last note: ${new Date(l.lastCallUpdate).toLocaleDateString("en-IN")} ${new Date(l.lastCallUpdate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
					: "No call update yet";

				const waGreeting = encodeURIComponent(`Hello ${l.name}, thank you for checking your Vedic Gemstone recommendation on GemRishi. Your primary match is ${l.primaryStone || "ready"}. How may we assist you today?`);

				return `
        <tr class="lead-row" data-status="${escapeHtml(currentStatus)}" style="border-bottom: 1px solid #E5ECE8; transition: background 0.15s;">
          <td style="padding: 12px 10px; font-size: 12px; color: #4B6358; white-space: nowrap; vertical-align: top;">
            <b>#${leads.length - index}</b><br/>${dateStr}
          </td>
          <td style="padding: 12px 10px; vertical-align: top;">
            <div style="font-weight: 700; color: #142E27; font-size: 14px;">${escapeHtml(l.name)}</div>
            <div style="font-size: 11px; color: #64748B;">${escapeHtml(l.gender || "")} ${l.dob ? `• ${escapeHtml(l.dob)}` : ""}</div>
            ${l.email ? `<div style="font-size: 11px; color: #475569; word-break: break-all; margin-top: 2px;">✉️ ${escapeHtml(l.email)}</div>` : ""}
          </td>
          <td style="padding: 12px 10px; vertical-align: top; white-space: nowrap;">
            ${cleanDigits ? `
              <div style="margin-bottom: 6px;">
                <a href="tel:+${cleanDigits}" style="color: #0E6245; text-decoration: none; font-weight: 700; font-size: 13px; display: inline-flex; align-items: center; gap: 4px;">
                  📞 ${l.phone}
                </a>
              </div>
              <a href="https://wa.me/${waNumber}?text=${waGreeting}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; background: #25D366; color: #fff; padding: 4px 9px; border-radius: 5px; font-size: 11.5px; font-weight: 600; text-decoration: none; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                💬 WhatsApp
              </a>
            ` : `<span style="color: #94A3B8;">-</span>`}
          </td>
          <td style="padding: 12px 10px; font-size: 12.5px; color: #334155; vertical-align: top;">
            ${escapeHtml(l.place || "-")}
          </td>
          <td style="padding: 12px 10px; vertical-align: top;">
            <div style="font-weight: 700; color: #1E6E50; font-size: 13.5px;">${escapeHtml(l.primaryStone || "-")}</div>
            <div style="font-size: 11px; color: #64748B;">${l.recommendedCarats ? `${l.recommendedCarats} Ct` : ""} ${l.recommendedRatti ? `(${l.recommendedRatti} Ratti)` : ""}</div>
            ${l.secondaryStone ? `<div style="font-size: 10.5px; color: #8A6D3B; margin-top: 2px;">Sub: ${escapeHtml(l.secondaryStone)}</div>` : ""}
          </td>
          <td style="padding: 12px 10px; vertical-align: top; text-align: center;">
            ${l.pdfUrl ? `<a href="${l.pdfUrl}" target="_blank" style="display: inline-block; background: #EAF6F0; border: 1px solid #BFE3D3; color: #1E6E50; padding: 5px 10px; border-radius: 6px; font-weight: 700; font-size: 11.5px; text-decoration: none;">📄 PDF</a>` : `<span style="color: #94A3B8; font-size: 11px;">-</span>`}
          </td>
          <!-- CALL PERSON UPDATE BLOCK -->
          <td style="padding: 10px 12px; vertical-align: top; min-width: 310px; background: #FAFDFB;">
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px;">
                <select id="status-${l._id}" style="flex: 1; padding: 6px 8px; border-radius: 6px; border: 1px solid #CBD5E1; font-size: 12px; font-weight: 600; background: #fff; color: #1E293B; cursor: pointer;">
                  <option value="New" ${currentStatus === "New" ? "selected" : ""}>⚪ New Lead</option>
                  <option value="Interested" ${currentStatus === "Interested" ? "selected" : ""}>🟢 Interested</option>
                  <option value="Call Back Later" ${currentStatus === "Call Back Later" ? "selected" : ""}>🟡 Call Back Later</option>
                  <option value="Order Placed" ${currentStatus === "Order Placed" ? "selected" : ""}>💎 Order Placed</option>
                  <option value="Ringing / No Answer" ${currentStatus === "Ringing / No Answer" ? "selected" : ""}>🟠 Ringing / No Answer</option>
                  <option value="Not Interested" ${currentStatus === "Not Interested" ? "selected" : ""}>🔴 Not Interested</option>
                  <option value="Invalid Number" ${currentStatus === "Invalid Number" ? "selected" : ""}>⚫ Invalid Number</option>
                </select>
                <button onclick="saveLeadUpdate('${l._id}')" id="btn-${l._id}" style="background: #1E6E50; color: #fff; border: none; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; white-space: nowrap;">
                  💾 Save
                </button>
              </div>
              <textarea id="notes-${l._id}" rows="2" placeholder="Write what happened on call (e.g. wants Emerald 5ct in gold ring, call tomorrow at 4pm)..." style="width: 100%; box-sizing: border-box; padding: 7px 9px; border-radius: 6px; border: 1px solid #D2E3DB; font-size: 12px; line-height: 1.4; resize: vertical; font-family: inherit; background: #fff; color: #1E293B;">${escapeHtml(currentNotes)}</textarea>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span id="time-${l._id}" style="font-size: 10.5px; color: #64748B;">${lastUpdatedStr}</span>
                <span id="msg-${l._id}" style="font-size: 11px; font-weight: 700; color: #15803D;"></span>
              </div>
            </div>
          </td>
        </tr>
      `;
			})
			.join("");

		const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GemRishi — Telecaller Live Leads Portal</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #EEF4F1; margin: 0; padding: 20px 24px; color: #0F172A; }
    .container { max-width: 1440px; margin: 0 auto; background: #fff; padding: 24px 28px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    h1 { color: #1E6E50; margin: 0; font-size: 24px; display: flex; align-items: center; gap: 8px; }
    .header-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid #E2E8F0; }
    .stats-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
    .stat-chip { padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; border: 1px solid transparent; }
    .stat-chip.active { box-shadow: 0 2px 6px rgba(0,0,0,0.15); transform: translateY(-1px); }
    .search-bar { width: 100%; max-width: 380px; padding: 9px 14px; border-radius: 8px; border: 1px solid #CBD5E1; font-size: 13px; outline: none; }
    .search-bar:focus { border-color: #1E6E50; box-shadow: 0 0 0 3px rgba(30,110,80,0.12); }
    .banner { background: #EAFBEF; border: 1px solid #BFE9CC; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 12.5px; color: #1E4D3E; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
    .table-wrapper { overflow-x: auto; border: 1px solid #E2E8F0; border-radius: 10px; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #1E6E50; color: #fff; padding: 11px 12px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em; white-space: nowrap; }
    .lead-row:hover { background: #F8FAFC !important; }
    .btn-csv { display: inline-flex; align-items: center; gap: 6px; background: #1E6E50; color: #fff; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; }
    .btn-csv:hover { background: #14503B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar">
      <div>
        <h1>💎 GemRishi Vedic Leads Portal</h1>
        <p style="margin: 4px 0 0; font-size: 13px; color: #64748B;">Live telecaller management & customer recommendation dossier</p>
      </div>
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <input type="text" id="search-input" class="search-bar" placeholder="🔍 Search by Name, Phone, City, Stone..." oninput="applyFilters()" />
        <a href="${liveSheetUrl}" class="btn-csv">📥 Export CSV</a>
      </div>
    </div>

    <!-- Live Status Filter Tabs -->
    <div class="stats-row">
      <div class="stat-chip active" id="chip-all" style="background: #0F172A; color: #fff;" onclick="filterByStatus('all')">All (${leads.length})</div>
      <div class="stat-chip" id="chip-new" style="background: #F1F5F9; color: #334155;" onclick="filterByStatus('New')">⚪ New (${countNew})</div>
      <div class="stat-chip" id="chip-interested" style="background: #DCFCE7; color: #15803D;" onclick="filterByStatus('Interested')">🟢 Interested (${countInterested})</div>
      <div class="stat-chip" id="chip-callback" style="background: #FEF9C3; color: #854D0E;" onclick="filterByStatus('Call Back Later')">🟡 Call Back Later (${countCallBack})</div>
      <div class="stat-chip" id="chip-order" style="background: #E0E7FF; color: #3730A3;" onclick="filterByStatus('Order Placed')">💎 Order Placed (${countOrder})</div>
      <div class="stat-chip" id="chip-noanswer" style="background: #FFEDD5; color: #9A3412;" onclick="filterByStatus('Ringing / No Answer')">🟠 Ringing / No Answer (${countNoAnswer})</div>
      <div class="stat-chip" id="chip-notinterested" style="background: #FEE2E2; color: #991B1B;" onclick="filterByStatus('Not Interested')">🔴 Not Interested (${countNotInterested})</div>
    </div>

    <div class="banner">
      <div><b>📊 Google Sheet Live Sync:</b> In your Google Sheet cell A1, enter <code>=IMPORTDATA("${liveSheetUrl}")</code></div>
      <div><b>Total Leads:</b> ${leads.length}</div>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer</th>
            <th>Contact</th>
            <th>City</th>
            <th>Stone Match</th>
            <th>Dossier</th>
            <th style="min-width: 310px;">📞 Telecaller Update Block (Status & Notes)</th>
          </tr>
        </thead>
        <tbody id="leads-tbody">
          ${rowsHtml || `<tr><td colspan="7" style="padding: 32px; text-align: center; color: #888;">No leads recorded yet.</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    let activeStatusFilter = 'all';

    function filterByStatus(status) {
      activeStatusFilter = status;
      document.querySelectorAll('.stat-chip').forEach(c => c.classList.remove('active'));
      const activeChip = document.getElementById('chip-' + (status === 'all' ? 'all' : status.toLowerCase().replace(/[^a-z]/g, '')));
      if (activeChip) activeChip.classList.add('active');
      applyFilters();
    }

    function applyFilters() {
      const query = (document.getElementById('search-input').value || '').toLowerCase().trim();
      const rows = document.querySelectorAll('#leads-tbody tr.lead-row');

      rows.forEach(r => {
        const rowStatus = r.getAttribute('data-status') || 'New';
        const matchesStatus = activeStatusFilter === 'all' || rowStatus === activeStatusFilter;
        const text = r.innerText.toLowerCase();
        const matchesQuery = !query || text.includes(query);

        r.style.display = (matchesStatus && matchesQuery) ? '' : 'none';
      });
    }

    async function saveLeadUpdate(leadId) {
      const statusEl = document.getElementById('status-' + leadId);
      const notesEl = document.getElementById('notes-' + leadId);
      const btnEl = document.getElementById('btn-' + leadId);
      const msgEl = document.getElementById('msg-' + leadId);
      const timeEl = document.getElementById('time-' + leadId);
      const rowEl = btnEl.closest('tr');

      const callStatus = statusEl.value;
      const callNotes = notesEl.value;

      btnEl.disabled = true;
      btnEl.innerText = 'Saving...';
      msgEl.innerText = '';

      try {
        const res = await fetch('/api/v1/recommended/update-lead-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, callStatus, callNotes }),
        });
        const data = await res.json();
        if (data.success) {
          btnEl.innerText = 'Saved ✓';
          btnEl.style.background = '#15803D';
          timeEl.innerText = 'Last note: Just now';
          if (rowEl) rowEl.setAttribute('data-status', callStatus);

          setTimeout(() => {
            btnEl.innerText = '💾 Save';
            btnEl.style.background = '#1E6E50';
            btnEl.disabled = false;
          }, 1800);
        } else {
          alert('Error saving update: ' + (data.message || 'Please try again'));
          btnEl.innerText = '💾 Save';
          btnEl.disabled = false;
        }
      } catch (err) {
        console.error(err);
        alert('Network error while saving update.');
        btnEl.innerText = '💾 Save';
        btnEl.disabled = false;
      }
    }
  </script>
</body>
</html>
    `;

		res.setHeader("Content-Type", "text/html; charset=utf-8");
		return res.status(200).send(html);
	} catch (error) {
		console.error("Error displaying leads dashboard:", error);
		return res.status(500).send("Error loading leads dashboard");
	}
}

/**
 * Stream Stored Lead PDF by Report ID
 */
export async function getLeadPdf(req, res) {
	try {
		const { reportId } = req.params;
		const safeId = (reportId || "").replace(/[^a-zA-Z0-9_-]/g, "");
		const fileName = `${safeId}-GemRishi-Vedic-Dossier.pdf`;
		const filePath = path.join(process.cwd(), "public", "uploads", "reports", fileName);

		if (fs.existsSync(filePath)) {
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
			return res.sendFile(filePath);
		}

		// Fallback: check database for path
		const lead = await GemLead.findOne({ reportId: safeId });
		if (lead?.pdfPath && fs.existsSync(lead.pdfPath)) {
			res.setHeader("Content-Type", "application/pdf");
			res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
			return res.sendFile(lead.pdfPath);
		}

		return res.status(404).json({ success: false, message: "PDF Dossier not found." });
	} catch (error) {
		console.error("Error streaming lead PDF:", error);
		return res.status(500).json({ success: false, message: "Error loading PDF." });
	}
}

