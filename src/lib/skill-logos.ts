const files: Record<string, string> = {
    'Java': 'java.svg', 'JavaScript': 'javascript.svg', 'Python': 'python.svg', 'Go': 'go.svg',
    'HTML5': 'html5.svg', 'CSS3': 'css3.svg', 'React': 'react.svg', 'Node.js': 'nodejs.svg',
    'Express.js': 'express.svg', 'REST APIs': 'rest-apis.svg', 'MongoDB': 'mongodb.svg',
    'SQL': 'sql.svg', 'Firebase': 'firebase.svg', 'Prompt Engineering': 'prompt-engineering.svg',
    'LLMs': 'llms.svg', 'AI Agents': 'ai-agents.svg', 'n8n': 'n8n.svg', 'Git': 'git.svg',
    'GitHub': 'github.svg', 'VS Code': 'vscode.svg', 'Microsoft Office': 'microsoft-office.svg',
    'Data Analysis': 'data-analysis.svg',
};

/** Match canonical English names before localization; never guess a CDN slug. */
export function skillLogo(name: string, customIcon = ''): string {
    return files[name] ? `/skill-logos/${files[name]}` : customIcon;
}

export function skillLogoNeedsInvert(name: string, customInvert = false): boolean {
    return files[name] ? name === 'GitHub' || name === 'Express.js' : customInvert;
}
