const fs = require('fs');
const path = require('path');

const projectJsonPath = path.join(process.env.GITHUB_WORKSPACE, '.info', 'project.json');
const templatePath = path.join(process.env.GITHUB_WORKSPACE, '.info', 'README-template.md');
const readmePath = path.join(process.env.GITHUB_WORKSPACE, 'README.md');

function formatDesc(desc) {
  if (Array.isArray(desc)) {
    return desc.map(d => `- ${d}`).join('\n');
  }
  return desc;
}

function featuresList(data, lang) {
  if (!Array.isArray(data.features)) return '';
  return data.features.map(f => {
    const name = f[`name-${lang}`];
    const desc = f[`description-${lang}`];
    if (!name || !desc) return '';

    if (Array.isArray(desc)) {
      const descList = desc.map(item => `- ${item}`).join('\n');
      return `#### ${name}:\n\n${descList}`;
    }

    return `#### ${name}:\n\n- ${desc}`;
  }).filter(Boolean).join('\n\n');
}

function fillTemplate(template, vars) {
  return template.replace(/{{\s*([\w-]+)\s*}}/g, (_, key) => vars[key] || '');
}

function generateReadme() {
  if (!fs.existsSync(projectJsonPath)) {
    console.error('project.json не найден');
    process.exit(1);
  }
  if (!fs.existsSync(templatePath)) {
    console.error('Шаблон README-template.md не найден');
    process.exit(1);
  }

  const rawData = fs.readFileSync(projectJsonPath, 'utf8');
  const data = JSON.parse(rawData);

  const template = fs.readFileSync(templatePath, 'utf8');

  const posterImg = `<img src=".info/poster.webp" alt="Poster" width="600" />`;

  const vars = {
    'title-en': data['title-en'],
    'title-ru': data['title-ru'],
    'textFirst-en': data['textFirst-en'],
    'textFirst-ru': data['textFirst-ru'],
    'textSecond-en': data['textSecond-en'],
    'textSecond-ru': data['textSecond-ru'],
    'features-en': featuresList(data, 'en'),
    'features-ru': featuresList(data, 'ru'),
    'deploy': data.deploy,
    'backend': data.backend,
    'poster-img': posterImg
  };

  const readme = fillTemplate(template, vars);

  fs.writeFileSync(readmePath, readme, 'utf8');
  console.log('README.md сгенерирован из шаблона');
}

generateReadme();
