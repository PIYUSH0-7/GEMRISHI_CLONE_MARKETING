export const generateRandomString = "dsbhhrujifiuhed4ot340ot04ewgto";

// Helper function to append random string to product/jewelry URLs
export const appendRandomString = (url) => {
  return `${url}/${generateRandomString}`;
};

// Helper function to extract slug (remove random string from end)
export const extractSlug = (slugWithRandom) => {
  if (!slugWithRandom) return slugWithRandom;
  const parts = slugWithRandom.split("/");
  // If last part is the random string, remove it
  if (parts[parts.length - 1] === generateRandomString) {
    return parts.slice(0, -1).join("/");
  }
  return slugWithRandom;
};
