'use strict';

const form = document.querySelector('#builder');
const preview = document.querySelector('#email-preview');
const downloadButton = document.querySelector('#download');
const recipes = {
  welcome: {
    subject: 'A little something to welcome you',
    preheader: 'Meet Fieldwork. Enjoy 10% off your first order.',
    headline: 'Good things start here.',
    message: 'Thoughtfully made essentials for everyday living. Get to know our collection, find your favorites, and make yourself at home.',
    cta: 'Explore the collection', offer: '10% off your first order',
    eyebrow: 'A warm welcome', section: 'Made for the everyday',
    benefits: ['Considered details', 'Everyday versatility', 'A fresh perspective'],
    note: 'Introduce the brand → explain the value → invite a first visit.',
    decision: 'A welcome email starts the relationship. One clear invitation keeps the next step easy, while a separate offer gives new subscribers a reason to explore.'
  },
  launch: {
    subject: 'Meet your new everyday essential',
    preheader: 'The Everyday Collection has arrived. Take a closer look.',
    headline: 'Something new. Made for you.',
    message: 'Introducing the Everyday Collection: familiar essentials, thoughtfully reimagined. Explore the details and discover your next favorite.',
    cta: 'Discover the collection', offer: 'Introducing the Everyday Collection',
    eyebrow: 'Just arrived', section: 'A closer look',
    benefits: ['Thoughtful design', 'Easy to make your own', 'Ready for your routine'],
    note: 'Announce the collection → highlight its value → invite discovery.',
    decision: 'A launch email leads with the announcement. A short introduction and three supporting benefits give readers enough context to decide whether to explore.'
  }
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function safeUrl(value) {
  try { const parsed = new URL(value); return parsed.protocol === 'https:' && !parsed.username && !parsed.password ? parsed.href : null; }
  catch { return null; }
}
function contrast(hex) {
  const rgb = hex.match(/[a-f\d]{2}/gi).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return 1.05 / (rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 + .05);
}
function loadRecipe() {
  const recipe = recipes[form.elements.recipe.value];
  for (const key of ['subject','preheader','headline','message','cta','offer']) form.elements[key].value = recipe[key];
  render();
}
function buildEmail(data) {
  const recipe = recipes[data.recipe];
  const color = /^#[a-f\d]{6}$/i.test(data.accent) ? data.accent : '#294e42';
  const buttonTextColor = contrast(color) >= 4.5 ? '#ffffff' : '#111111';
  const benefits = data.benefits ? `<tr><td style="padding:30px 32px;border-top:1px solid #e0e4dc"><h2 style="font-size:22px;font-weight:400;margin:0 0 16px">${escapeHtml(recipe.section)}</h2>${recipe.benefits.map((text, index) => `<p style="margin:10px 0;font-size:14px"><span style="color:${color};font-weight:bold">0${index + 1}</span> &nbsp; ${escapeHtml(text)}</p>`).join('')}</td></tr>` : '';
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(data.subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f3ed;color:#24352d;font-family:Arial,Helvetica,sans-serif;word-break:break-word">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${escapeHtml(data.preheader)}</div>
<table role="presentation" style="width:100%;border-collapse:collapse"><tr><td align="center" style="padding:16px 8px">
<table role="presentation" style="width:100%;max-width:600px;background:#fffdf7;border-collapse:collapse">
<tr><td style="padding:24px 32px;border-bottom:1px solid #e0e4dc;font-size:22px;font-weight:bold;letter-spacing:1px">${escapeHtml(data.brand)}</td></tr>
<tr><td style="padding:40px 32px 32px"><p style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:${color};margin:0 0 20px">${escapeHtml(recipe.eyebrow)}</p><h1 style="font-family:Georgia,serif;font-size:38px;line-height:1.12;font-weight:400;margin:0 0 22px">${escapeHtml(data.headline)}</h1><p style="font-size:16px;line-height:1.8;color:#586057;margin:0 0 26px;white-space:pre-line">${escapeHtml(data.message)}</p><table role="presentation" style="border-collapse:collapse"><tr><td bgcolor="${color}" style="border-radius:4px"><a href="${escapeHtml(safeUrl(data.url) || 'https://example.com')}" style="background:${color};border:1px solid ${color};border-radius:4px;color:${buttonTextColor};display:inline-block;padding:14px 22px;font-size:14px;font-weight:bold;text-decoration:none">${escapeHtml(data.cta)}</a></td></tr></table></td></tr>
${data.offer.trim() ? `<tr><td style="padding:22px 32px;background:#e9eddf;font-family:Georgia,serif;font-size:22px">${escapeHtml(data.offer)}</td></tr>` : ''}
${benefits}
<tr><td style="padding:25px 32px;border-top:1px solid #e0e4dc;font-size:11px;line-height:1.8;color:#626c64">${escapeHtml(data.brand)} · Portfolio demonstration<br>Fictional sample campaign. Add your approved sender address and unsubscribe link before sending.</td></tr>
</table></td></tr></table></body></html>`;
}
let currentHtml = '';
function render() {
  const data = Object.fromEntries(new FormData(form));
  data.benefits = form.elements.benefits.checked;
  currentHtml = buildEmail(data);
  preview.srcdoc = currentHtml;
  document.querySelector('#sender').textContent = data.brand || 'Your brand';
  document.querySelector('.avatar').textContent = (data.brand.trim()[0] || '?').toUpperCase();
  document.querySelector('#inbox-subject').textContent = data.subject || '(Add a subject line)';
  document.querySelector('#inbox-preheader').textContent = data.preheader;
  document.querySelector('#recipe-note').textContent = recipes[data.recipe].note;
  document.querySelector('#decision').textContent = recipes[data.recipe].decision;
  const validUrl = safeUrl(data.url);
  const required = ['brand','subject','preheader','headline','message','cta'].every(key => data[key].trim());
  const size = new Blob([currentHtml]).size;
  const checks = [
    [required, required ? '✓ Essential copy is filled in' : 'Add brand, subject, preview text, headline, message and button text'],
    [!!validUrl && new URL(validUrl).hostname !== 'example.com', !validUrl ? 'Enter a valid HTTPS button destination' : new URL(validUrl).hostname === 'example.com' ? 'Replace the example.com button destination' : '✓ Button has an HTTPS destination'],
    [data.subject.length <= 60, data.subject.length <= 60 ? '✓ Subject is within the 60-character demo guideline' : 'Subject exceeds 60 characters; it may truncate in an inbox'],
    [true, `✓ Button text uses ${contrast(data.accent) >= 4.5 ? 'white' : 'dark'} for contrast`],
    [size < 102400, `${size < 102400 ? '✓' : 'Review:'} HTML size: ${(size / 1024).toFixed(1)} KB (102 KB clipping guideline)`]
  ];
  document.querySelector('#checks').replaceChildren(...checks.map(([pass, text]) => { const item = document.createElement('li'); item.dataset.pass = String(pass); item.textContent = text; return item; }));
  downloadButton.disabled = !required || !validUrl;
  document.querySelector('#download-status').textContent = '';
}
form.addEventListener('input', event => { if (event.target.name !== 'recipe') render(); });
form.elements.recipe.addEventListener('change', loadRecipe);
form.addEventListener('submit', event => event.preventDefault());
form.addEventListener('reset', () => setTimeout(loadRecipe, 0));
document.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click', () => {
  preview.classList.toggle('mobile', button.dataset.device === 'mobile');
  document.querySelectorAll('[data-device]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
}));
downloadButton.addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([currentHtml], {type:'text/html;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = `email-demo-${form.elements.recipe.value}.html`; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  document.querySelector('#download-status').textContent = 'HTML downloaded. This demo export has not been inbox-tested.';
});
loadRecipe();
