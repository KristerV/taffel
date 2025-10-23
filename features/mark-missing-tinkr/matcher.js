// Name matching utilities with normalization and Levenshtein distance
const TinkrMatcher = {
  // Normalize Estonian special characters and general cleanup
  normalize(str) {
    if (!str) return '';

    return str
      .toLowerCase()
      .replace(/š/g, 's')
      .replace(/ž/g, 'z')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/ü/g, 'u')
      .replace(/õ/g, 'o')
      .replace(/[^a-z]/g, ''); // Remove all non-letter characters
  },

  // Extract name from email (firstname.lastname@domain)
  extractNameFromEmail(email) {
    if (!email) return '';

    // Get part before @
    const localPart = email.split('@')[0];

    // Remove dots, dashes, etc and return
    return this.normalize(localPart);
  },

  // Calculate Levenshtein distance between two strings
  levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[len1][len2];
  },

  // Calculate similarity percentage (0-100)
  calculateSimilarity(str1, str2) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);

    if (maxLen === 0) return 100;

    return ((maxLen - distance) / maxLen) * 100;
  },

  // Match student name with email
  matchStudent(tahvelName, tinkrEmail, threshold = 85) {
    // Remove group name from Tahvel name (e.g., "Kris Veelain, TA-25A" → "Kris Veelain")
    const nameWithoutGroup = tahvelName.split(',')[0].trim();

    // Normalize both
    const normalizedName = this.normalize(nameWithoutGroup);
    const normalizedEmail = this.extractNameFromEmail(tinkrEmail);

    console.log(`    Comparing: "${tahvelName}" → "${nameWithoutGroup}" → "${normalizedName}" vs "${tinkrEmail}" → "${normalizedEmail}"`);

    // Try exact match first
    if (normalizedName === normalizedEmail) {
      console.log('    → EXACT MATCH');
      return {
        matched: true,
        method: 'exact',
        similarity: 100,
        normalizedName,
        normalizedEmail
      };
    }

    // Try Levenshtein
    const similarity = this.calculateSimilarity(normalizedName, normalizedEmail);
    console.log(`    → Similarity: ${similarity.toFixed(1)}% (threshold: ${threshold}%)`);

    if (similarity >= threshold) {
      console.log('    → FUZZY MATCH');
      return {
        matched: true,
        method: 'fuzzy',
        similarity,
        normalizedName,
        normalizedEmail
      };
    }

    // No match
    return {
      matched: false,
      method: 'none',
      similarity,
      normalizedName,
      normalizedEmail
    };
  },

  // Find matching Tinkr student for a Tahvel student
  findTinkrStudent(tahvelName, tinkrStudents, threshold = 85) {
    console.log(`TinkrMatcher: Finding match for "${tahvelName}"`);
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const tinkrStudent of tinkrStudents) {
      const result = this.matchStudent(tahvelName, tinkrStudent.email, threshold);

      if (result.matched && result.similarity > bestSimilarity) {
        bestMatch = {
          tinkrStudent,
          matchResult: result
        };
        bestSimilarity = result.similarity;

        console.log(`  ✓ Match found: ${tinkrStudent.email} (${result.method}, ${result.similarity.toFixed(1)}%)`);

        // If exact match, no need to continue
        if (result.method === 'exact') {
          break;
        }
      }
    }

    if (!bestMatch) {
      console.log(`  ✗ No match found for "${tahvelName}"`);
    }

    return bestMatch;
  }
};
