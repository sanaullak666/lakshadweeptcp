import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

export interface ZipFileEntry {
  filePath: string;
  entryName: string;
}

export async function createZipArchive(entries: ZipFileEntry[], outputZipPath: string): Promise<string> {
  const dir = path.dirname(outputZipPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputZipPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    output.on('close', () => {
      resolve(outputZipPath);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    for (const entry of entries) {
      if (fs.existsSync(entry.filePath)) {
        archive.file(entry.filePath, { name: entry.entryName });
      }
    }

    archive.finalize();
  });
}
