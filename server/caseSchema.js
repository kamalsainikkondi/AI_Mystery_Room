import { z } from 'zod';

const suspect = z.object({
  id: z.string().min(1), name: z.string().min(1), role: z.string().min(1), age: z.number().int().min(16).max(110),
  initials: z.string().min(1).max(3), color: z.enum(['sage', 'rust', 'blue', 'gold']), motive: z.string().min(1),
  alibi: z.string().min(1), detail: z.string().min(1),
});
const evidence = z.object({
  id: z.string().min(1), title: z.string().min(1), category: z.enum(['DOCUMENT', 'DIGITAL', 'PHYSICAL', 'CCTV TRANSCRIPT', 'WITNESS', 'FORENSIC']),
  time: z.string().min(1), location: z.string().min(1), summary: z.string().min(1), content: z.string().min(1),
  tags: z.array(z.string()).min(1), reliability: z.enum(['VERIFIED', 'UNVERIFIED', 'MISLEADING']),
});
export const canonicalCaseSchema = z.object({
  title: z.string().min(4), subtitle: z.string().min(8), location: z.string().min(3), date: z.string().min(3),
  type: z.string().min(2), status: z.literal('OPEN CASE'), summary: z.string().min(30), victim: z.string().min(2),
  suspects: z.array(suspect).min(3).max(5), evidence: z.array(evidence).min(5).max(12),
  timeline: z.array(z.object({ time: z.string().min(1), event: z.string().min(5) })).min(5).max(12),
  hints: z.array(z.string().min(8)).min(2).max(3),
  solution: z.object({ culpritId: z.string().min(1), explanation: z.string().min(60), keyClues: z.array(z.string()).min(2) }),
});

export function validateRelationships(value) {
  const ids = new Set(value.suspects.map(s => s.id));
  if (ids.size !== value.suspects.length) throw new Error('Generated case contains duplicate suspect identifiers.');
  if (!ids.has(value.solution.culpritId)) throw new Error('Generated solution does not identify one of the suspects.');
  const evidenceIds = new Set(value.evidence.map(e => e.id));
  if (evidenceIds.size !== value.evidence.length) throw new Error('Generated case contains duplicate evidence identifiers.');
  if (value.solution.keyClues.some(id => !evidenceIds.has(id))) throw new Error('Generated solution refers to evidence that does not exist.');
  if (value.solution.keyClues.length < 2) throw new Error('The solution must depend on at least two evidence items.');
}

export const geminiJsonSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' }, subtitle: { type: 'string' }, location: { type: 'string' }, date: { type: 'string' },
    type: { type: 'string' }, status: { type: 'string', enum: ['OPEN CASE'] }, summary: { type: 'string' }, victim: { type: 'string' },
    suspects: { type: 'array', items: { type: 'object', properties: { id:{type:'string'},name:{type:'string'},role:{type:'string'},age:{type:'integer'},initials:{type:'string'},color:{type:'string',enum:['sage','rust','blue','gold']},motive:{type:'string'},alibi:{type:'string'},detail:{type:'string'} }, required:['id','name','role','age','initials','color','motive','alibi','detail'] } },
    evidence: { type: 'array', items: { type: 'object', properties: { id:{type:'string'},title:{type:'string'},category:{type:'string',enum:['DOCUMENT','DIGITAL','PHYSICAL','CCTV TRANSCRIPT','WITNESS','FORENSIC']},time:{type:'string'},location:{type:'string'},summary:{type:'string'},content:{type:'string'},tags:{type:'array',items:{type:'string'}},reliability:{type:'string',enum:['VERIFIED','UNVERIFIED','MISLEADING']} }, required:['id','title','category','time','location','summary','content','tags','reliability'] } },
    timeline: { type: 'array', items: { type:'object',properties:{time:{type:'string'},event:{type:'string'}},required:['time','event'] } },
    hints: { type:'array',items:{type:'string'} },
    solution: { type:'object',properties:{culpritId:{type:'string'},explanation:{type:'string'},keyClues:{type:'array',items:{type:'string'}}},required:['culpritId','explanation','keyClues'] },
  },
  required: ['title','subtitle','location','date','type','status','summary','victim','suspects','evidence','timeline','hints','solution'],
};
