import btoa from 'btoa';

export default function (seed) {
  const bytes = [];

  for (let i = 0, l = seed.length; i < l; i += 1) {
    bytes.push(seed.charCodeAt(i));
  }

  // Salt must be 16 bytes
  while (bytes.length < 16) {
    bytes.push(0);
  }

  // Convert byte array to base64 string
  const args = bytes.slice(0, 16);
  const salt = btoa(String.fromCharCode(...args));

  // Adding header for bcrypt. Fake 10 rounds.
  return '$2a$10$'.concat(salt);
}
