const PEOPLE_API_BASE = 'https://people.googleapis.com/v1';

/**
 * Custom error class for Google Contacts API errors
 */
export class GoogleContactsError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'GoogleContactsError';
    this.status = status;
  }
}

/**
 * Fetch contacts from Google People API
 * @param {string} accessToken - OAuth access token with contacts.readonly scope
 * @param {number} pageSize - Number of contacts to fetch (max 1000)
 * @returns {Promise<Array>} Array of normalized contact objects
 */
export async function fetchGoogleContacts(accessToken, pageSize = 500) {
  const params = new URLSearchParams({
    personFields: 'names,emailAddresses,phoneNumbers,organizations,biographies',
    pageSize: String(pageSize),
    sortOrder: 'FIRST_NAME_ASCENDING',
  });

  const response = await fetch(
    `${PEOPLE_API_BASE}/people/me/connections?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new GoogleContactsError(
      error.error?.message || 'Failed to fetch contacts',
      response.status
    );
  }

  const data = await response.json();
  return normalizeContacts(data.connections || []);
}

/**
 * Normalize Google People API response to app format
 * @param {Array} connections - Raw connections from Google API
 * @returns {Array} Normalized contact objects
 */
function normalizeContacts(connections) {
  return connections
    .filter((person) => person.names?.length > 0)
    .map((person) => {
      const name = person.names?.[0] || {};
      const email = person.emailAddresses?.[0]?.value || '';
      const phone = person.phoneNumbers?.[0]?.value || '';
      const org = person.organizations?.[0] || {};
      const bio = person.biographies?.[0]?.value || '';

      return {
        googleResourceName: person.resourceName,
        firstName: name.givenName || '',
        lastName: name.familyName || '',
        email,
        phone,
        company: org.name || '',
        biography: bio,
      };
    });
}
