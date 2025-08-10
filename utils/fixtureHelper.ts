import fs from 'fs';
import path from 'path';

// Loads a JSON fixture from tests/fixtures/<relativePath>
export function loadJsonFixture(relativePath: string): any {
  const fullPath = path.resolve(__dirname, '../tests/fixtures', relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Fixture not found: ${fullPath}`);
  }
  const raw = fs.readFileSync(fullPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Failed to parse JSON for fixture ${fullPath}: ${(e as Error).message}`);
  }
}

