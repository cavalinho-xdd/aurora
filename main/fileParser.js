const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

async function parseFile(filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return limitText(data.text);
    } 
    else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return limitText(result.value);
    } 
    else if (ext === '.txt' || ext === '.md') {
      const text = fs.readFileSync(filePath, 'utf8');
      return limitText(text);
    } 
    else {
      throw new Error('Unsupported file extension: ' + ext);
    }
  } catch (error) {
    console.error('[FileParser] Error parsing file:', error);
    return null;
  }
}

function limitText(text, maxLength = 100000) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  console.log(`[FileParser] Trimming text from ${text.length} to ${maxLength} characters.`);
  return text.substring(0, maxLength) + '\\n...[TEXT TRUNCATED]';
}

module.exports = { parseFile };
