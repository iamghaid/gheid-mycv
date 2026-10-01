import test from 'node:test';
import assert from 'node:assert/strict';
import { projectPresentationUrl, supportsProjectPresentation } from '../src/lib/project-presentation';
for (const language of ['en','ar'] as const) for (const theme of ['light','dark'] as const) {
 test(`${language}/${theme} preserves mission routes and existing parameters`, () => {
  const result = new URL(projectPresentationUrl('https://go-mission.vercel.app/?demo=1#/join', {language,theme})!);
  assert.equal(result.searchParams.get('portfolio_lang'),language);
  assert.equal(result.searchParams.get('portfolio_theme'),theme);
  assert.equal(result.searchParams.get('demo'),'1'); assert.equal(result.hash,'#/join');
 });
}
test('unrelated links and unsupported sites are left unchanged', () => {
 for (const url of ['#','https://github.com/iamghaid','https://qurb-halaqat.vercel.app/','javascript:void(0)']) {
  assert.equal(supportsProjectPresentation(url),false);
  assert.equal(projectPresentationUrl(url,{language:'ar',theme:'light'}),url);
 }
});
