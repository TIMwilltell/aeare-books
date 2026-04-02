const domain = process.env.AUTH0_DOMAIN;
const applicationID = process.env.AUTH0_APPLICATION_ID;

if (!domain) {
	throw new Error('Missing AUTH0_DOMAIN for Convex auth configuration.');
}

if (!applicationID) {
	throw new Error('Missing AUTH0_APPLICATION_ID for Convex auth configuration.');
}

const issuer = domain.startsWith('http') ? domain : `https://${domain}`;

export default {
	providers: [
		{
			domain: issuer,
			applicationID,
		},
	],
};
