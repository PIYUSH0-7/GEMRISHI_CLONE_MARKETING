/**
 * Append the domain name to all URLs in the object/array recursively.
 * @param {Object|Array} data - The object or array of data
 * @param {String} domain - The base domain (e.g., https://api.example.com)
 * @param {Array} fields - List of field names that should be prefixed with the domain
 */
function appendDomainPluginOld(schema, options = {}) {
	const domain = options.domain || process.env.DOMAIN_NAME;
	const fields = options.fields || ["url"];
	// console.log(domain, fields);

	function transform(doc, ret) {
		if (!ret) return ret;
		const domain = options.domain || process.env.DOMAIN_NAME; // added again beacuse out of this function this dont work

		function addDomain(obj) {
			for (const key in obj) {
				if (!obj[key]) continue;

				if (typeof obj[key] === "object") {
					addDomain(obj[key]);
					// console.log(obj[key]);
				} else if (fields.includes(key) && typeof obj[key] === "string" && obj[key].startsWith("/")) {
					obj[key] = `${domain}${obj[key]}`;
				}
			}
		}

		addDomain(ret);
		return ret;
	}

	if (!schema.options.toJSON) schema.options.toJSON = {};
	if (!schema.options.toObject) schema.options.toObject = {};

	schema.options.toJSON.transform = transform;
	schema.options.toObject.transform = transform;
}


/**
 * Mongoose plugin to recursively append a domain to specified URL fields.
 * Works for both standard queries (via toJSON) and aggregation queries.
 */
function appendDomainPlugin(schema, options = {}) {
	const fields = options.fields || ["url"];

	const getEffectiveDomain = (optsDomain) => {
		if (optsDomain) return optsDomain;
		if (options.domain) return options.domain;
		if (process.env.DOMAIN_NAME && !process.env.DOMAIN_NAME.includes("localhost") && !process.env.DOMAIN_NAME.includes("127.0.0.1")) {
			return process.env.DOMAIN_NAME;
		}
		if (process.env.NODE_ENV === "production") return "https://api.gemrishi.com";
		return process.env.DOMAIN_NAME || "http://localhost:7788";
	};

	// Helper function to recursively find and prefix URLs
	function addDomain(obj, domain) {
		for (const key in obj) {
			if (!obj[key]) continue;

			if (typeof obj[key] === "object") {
				addDomain(obj[key], domain);
			} else if (fields.includes(key) && typeof obj[key] === "string") {
				const isLocalEnv = Boolean(domain && (domain.includes("localhost") || domain.includes("127.0.0.1")));
				if (obj[key].startsWith("/")) {
					obj[key] = domain ? `${domain}${obj[key]}` : obj[key];
				} else if (isLocalEnv && (obj[key].includes("api.gemrishi.com/") || obj[key].includes("gemrishi.com/"))) {
					const relativePath = obj[key].replace(/^https?:\/\/(?:api\.)?gemrishi\.com/, "");
					obj[key] = `${domain}${relativePath.startsWith("/") ? relativePath : `/${relativePath}`}`;
				}
			}
		}
	}

	// 1. For standard queries (find, findOne, etc.) using toJSON / toObject transform
	const transform = (doc, ret, opts = {}) => {
		if (!ret) return ret;
		const domain = getEffectiveDomain(opts.domain);
		if (domain) {
			addDomain(ret, domain);
		}
		return ret;
	};

	schema.set('toJSON', { transform });
	schema.set('toObject', { transform });

	// 2. For aggregation queries
	schema.post('aggregate', function (results, next) {
		if (Array.isArray(results)) {
			const domain = getEffectiveDomain();
			results.forEach(result => {
				addDomain(result, domain);
			});
		}
		next();
	});
}

export default appendDomainPlugin;
