export interface ReplacementData {
  fullName: string;
  relationship: string;
  parentSpouseName: string;
  houseName: string;
  island: string;
  pinCode: string;
  email: string;
  phone: string;
  place: string;
  date: string;
  signatureHtml: string;
}

export function replacePlaceholders(templateHtml: string, data: ReplacementData): string {
  let result = templateHtml;

  // Use global regex replacement for each specific placeholder
  result = result.replace(/\{\{FULL_NAME\}\}/g, escapeHtml(data.fullName));
  result = result.replace(/\{\{RELATIONSHIP\}\}/g, escapeHtml(data.relationship));
  result = result.replace(/\{\{PARENT_SPOUSE_NAME\}\}/g, escapeHtml(data.parentSpouseName));
  result = result.replace(/\{\{HOUSE_NAME\}\}/g, escapeHtml(data.houseName));
  result = result.replace(/\{\{ISLAND\}\}/g, escapeHtml(data.island));
  result = result.replace(/\{\{PIN_CODE\}\}/g, escapeHtml(data.pinCode));
  result = result.replace(/\{\{EMAIL\}\}/g, escapeHtml(data.email));
  result = result.replace(/\{\{PHONE\}\}/g, escapeHtml(data.phone));
  result = result.replace(/\{\{PLACE\}\}/g, escapeHtml(data.place));
  result = result.replace(/\{\{DATE\}\}/g, escapeHtml(data.date));
  
  // Note: signatureHtml is safe HTML (an img tag with base64 data)
  result = result.replace(/\{\{SIGNATURE\}\}/g, data.signatureHtml);

  return result;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
