export const extractAndParseJson = (rawAdviceString: string): any | null => {
  try {
    // First, try to parse the outer JSON string
    const outerObject = JSON.parse(rawAdviceString);

    // Check if the outer object has an 'advice' property and it's a string
    if (outerObject && typeof outerObject.advice === 'string') {
      let innerJsonString = outerObject.advice;

      // Remove the ```json\n prefix and \n``` suffix
      const jsonPrefix = '```json\n';
      const jsonSuffix = '\n```';

      if (innerJsonString.startsWith(jsonPrefix) && innerJsonString.endsWith(jsonSuffix)) {
        innerJsonString = innerJsonString.substring(jsonPrefix.length, innerJsonString.length - jsonSuffix.length);
      }

      // Now, parse the cleaned inner JSON string
      return JSON.parse(innerJsonString);
    } else {
      // If no 'advice' property or it's not a string, try to parse the raw string directly
      // This handles cases where the AI might directly return pure JSON without the outer wrapper
      return JSON.parse(rawAdviceString);
    }
  } catch (error) {
    console.error("Error extracting and parsing JSON:", error);
    // If any parsing fails, return null or throw an error as appropriate
    return null;
  }
};